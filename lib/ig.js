const { igApi } = require('insta-fetcher')
const IG = new igApi('sessionid=56743822181%3AaGWCOMhUOk4P1t%3A18%3AAYfiJxOBtU7Mm3fHUgT60sl8miReeZj_rDSR4zketA; ds_user_id=56743822181; csrftoken=hcYoolJWp8VPbE9YuNStJ4slLlfV65pm')

exports.igh = url => {
   return new Promise(async resolve => {
      try {
         let mediaId = url.match(/story_media_id[=](.*?)[&]/)[1]
         const json = await IG.fetchPostByMediaId(mediaId)
         if (json.status != 'ok' || typeof json.items == 'undefined' || json.items.length == 0) return resolve({
            creator: global.creator,
            status: false
         })
         let data = {}
         data = json.items[0].video_versions ? json.items[0].video_versions[0] : json.items[0].image_versions2.candidates[0]
         data.taken_at = json.items[0].taken_at
         resolve({
            creator: global.creator,
            status: true,
            data
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}