const express = require('express'),
   router = express.Router(),
   yt = new(require('../lib/yt')),
   { igh } = require('../lib/ig')

router.get('/music', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(global.status.query)
   let result = await yt.audio(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/video', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(global.status.query)
   let result = await yt.video(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/analyze', async (req, res) => {
   let url = req.query.url
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await yt.analyze(url)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/yta', async (req, res) => {
   let url = req.query.url
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await yt.yta(url)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/ytv', async (req, res) => {
   let { url, quality } = req.query
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await yt.ytv(url, quality)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/yts', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(handle.query)
   let result = await yt.search(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/igh', async (req, res) => {
   let url = req.query.url
   if (!url) return res.json(global.status.url)
   if (!url.match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:s\/)(?:\S+)?$/)) return res.json(global.status.invalidURL)
   let result = await igh(url)
   res.json(result)
})

module.exports = router