const axios = require('axios'),
   cheerio = require('cheerio'),
   yts = require('yt-search'),
   decode = require('html-entities').decode,
   fetch = require('node-fetch')

module.exports = class Y2mate {
   creator = '@neoxrs – Wildan Izzudin'
   server = '448'
   header = {
      headers: {
         'Accept': '*/*',
         'Accept-Language': 'en-US,en;q=0.9',
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         'Referer': 'https://www.y2mate.com/',
         'Referrer-Policy': 'strict-origin-when-cross-origin',
         'X-Requested-With': 'XMLHttpRequest'
      }
   }

   shorten = (url) => {
      return new Promise(async (resolve) => {
         try {
            let params = new URLSearchParams()
            params.append('url', url)
            let json = await (await fetch('https://s.nxr.my.id/api', {
               method: 'POST',
               body: params
            })).json()
            if (json.error) return resolve({
               creator: this.creator,
               status: false
            })
            resolve({
               creator: this.creator,
               status: true,
               data: {
                  url: 'https://s.nxr.my.id/r/' + json.data.code
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: this.creator,
               status: false
            })
         }
      })
   }

   ytr(url) {
      let regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#\&\?]*).*/
      let id = url.match(regEx)
      return id[2]
   }

   convert(extractor, token, videoId, ftype, quality) {
      return new Promise(async (resolve, reject) => {
         let form = new URLSearchParams()
         form.append('type', extractor)
         form.append('_id', token)
         form.append('v_id', videoId)
         form.append('ajax', 1)
         form.append('token', '')
         form.append('ftype', ftype)
         form.append('fquality', quality)
         let json = await (await axios.post('https://www.y2mate.com/mates/convert', form, this.header)).data
         let $ = cheerio.load(json.result)
         resolve({
            url: await (await this.shorten($('a').attr('href'))).data.url
         })
      })
   }

   analyze = url => {
      return new Promise(async (resolve, reject) => {
         try {
            let construct = 'https://www.youtube.com/watch?v=' + this.ytr(url)
            let yt = await yts({
               videoId: this.ytr(url)
            })
            let form = new URLSearchParams()
            form.append('url', url)
            form.append('q_auto', 0)
            form.append('ajax', 1)
            let json = await (await axios.post('https://www.y2mate.com/mates/' + this.server + '/analyze/ajax', form, this.header)).data
            let $ = cheerio.load(json.result)
            let mp4 = [],
               mp3 = []
            let token = json.result.match(/k__id\s=\s"(.*?)"/)[1]
            let extractor = json.result.match(/video_extractor\s=\s"(.*?)"/)[1]
            let videoInfo = {
               title: decode($('div[class="caption text-left"]').text().trim()),
               thumbnail: $('a[class="video-thumbnail"] > img').attr('src'),
               duration: yt.seconds + ' (' + yt.timestamp + ')',
               channel: yt.author.name,
               views: Number(yt.views).toLocaleString().replace(/,/gi, '.'),
               publish: yt.uploadDate + ' (' + yt.ago + ')',
               videoId: this.ytr(url),
               token,
               extractor,
            }
            $('div[id="mp4"]').find('table > tbody > tr').each(function(i, e) {
               mp4.push({
                  filename: decode($('div[class="caption text-left"]').text().trim()) + '.' + $($(e).find('td')[2]).find('a').attr('data-ftype'),
                  extension: $($(e).find('td')[2]).find('a').attr('data-ftype'),
                  // quality: $($(e).find('td')[0]).text().split('(')[0].trim().trim(),
                  quality: $($(e).find('td')[2]).find('a').attr('data-fquality').replace(/3gp|p HFR|p/g, ''),
                  size: $($(e).find('td')[1]).text().trim(),
               })
            })
            $('div[id="mp3"]').find('table > tbody > tr').each(async (i, e) => {
               mp3.push({
                  filename: decode($('div[class="caption text-left"]').text().trim()) + '.' + $($(e).find('td')[2]).find('a').attr('data-ftype'),
                  extension: $($(e).find('td')[2]).find('a').attr('data-ftype'),
                  // quality: $($(e).find('td')[0]).text().split('(')[1].split(')')[0].trim(),
                  quality: $($(e).find('td')[2]).find('a').attr('data-fquality'),
                  size: $($(e).find('td')[1]).text().trim()
               })
            })
            let join = mp4.concat(mp3)
            resolve({
               creator: this.creator,
               status: true,
               ...videoInfo,
               data: join
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: this.creator,
               status: false
            })
         }
      })
   }

   yta = url => {
      return new Promise(async (resolve, reject) => {
         try {
            let json = await this.analyze(url)
            if (!json.status) return resolve({
               creator: this.creator,
               status: false,
               msg: 'Can\'t get metadata!'
            })
            let mp3 = json.data.find(v => v.extension == 'mp3' && v.fquality == 128)
            let _mp3 = await this.convert(json.extractor, json.token, this.ytr(url), 'mp3', mp3.fquality)
            delete mp3.fquality
            delete json.extractor
            resolve({
               ...json,
               token: 'api-neoxr-' + json.token,
               data: {
                  ...mp3,
                  ..._mp3
               }
            })
         } catch {
            resolve({
               creator: this.creator,
               status: false,
               msg: 'Can\'t get metadata!'
            })
         }
      })
   }

   ytv = (url, quality = 480) => {
      return new Promise(async resolve => {
         try {
            let json = await this.analyze(url)
            if (!json.status) return resolve({
               creator: this.creator,
               status: false,
               msg: 'Can\'t get metadata!'
            })
            var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == quality)
            if (typeof mp4 == 'undefined') return resolve({
               creator: this.creator,
               status: false,
               msg: 'Can\'t get metadata!'
            })
            let _mp4 = await this.convert(json.extractor, json.token, this.ytr(url), 'mp4', mp4.fquality)
            delete mp4.fquality
            delete json.extractor
            resolve({
               ...json,
               token: 'api-neoxr-' + json.token,
               data: {
                  ...mp4,
                  ..._mp4
               }
            })
         } catch {
            resolve({
               creator: this.creator,
               status: false,
               msg: 'Can\'t get metadata!'
            })
         }
      })
   }

   audio = q => {
      return new Promise(async (resolve, reject) => {
         try {
            let json = await yts(q)
            let yt = json.all.find(video => video.seconds < 3600)
            const res = await this.yta(yt.url)
            resolve(res)
         } catch {
            resolve({
               creator: this.creator,
               status: false
            })
         }
      })
   }

   video = q => {
      return new Promise(async (resolve, reject) => {
         try {
            let json = await yts(q)
            let yt = json.all.find(video => video.seconds < 3600)
            const res = await this.yta(yt.url)
            resolve(res)
         } catch {
            resolve({
               creator: this.creator,
               status: false
            })
         }
      })
   }
}