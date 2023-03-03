const express = require('express'),
   router = express.Router(),
   Y2mate = new(require('../lib/y2mate'))

router.get('/music', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(global.status.query)
   let result = await Y2mate.audio(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/video', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(global.status.query)
   let result = await Y2mate.video(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/analyze', async (req, res) => {
   let url = req.query.url
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await Y2mate.analyze(url)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/fetch', async (req, res) => {
   let { url, type, quality } = req.query
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await Y2mate.fetch(url, type, quality)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/yta', async (req, res) => {
   let url = req.query.url
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await Y2mate.fetch(url)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/ytv', async (req, res) => {
   let { url, quality } = req.query
   if (!url) return res.json(global.status.url)
   if (!url.match('youtu.be') && !url.match('youtube.com')) return res.json(global.status.invalidURL)
   let result = await Y2mate.fetch(url, 'video', quality)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

router.get('/yts', async (req, res) => {
   let q = req.query.q
   if (!q) return res.json(handle.query)
   let result = await Y2mate.search(q)
   res.header('Content-Type: application/json')
   res.type('json').send(JSON.stringify(result, null, 2))
})

module.exports = router