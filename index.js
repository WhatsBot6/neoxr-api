const express = require('express'),
   path = require('path'),
   cookieParser = require('cookie-parser'),
   logger = require('morgan')
const index = require('./routes/index'),
   api = require('./routes/api')
const PORT = process.env.PORT || 8080

global.creator = '@neoxrs – Wildan Izzudin'
global.status = {
   query: {
      creator: global.creator,
      status: false,
      msg: 'Missing \'q\' parameter!'
   },
   url: {
      creator: global.creator,
      status: false,
      msg: 'Missing \'url\' parameter!'
   },
   invalidURL: {
      creator: global.creator,
      status: false,
      msg: 'URL is invalid'
   },
   error: {
      status: false,
      creator: global.creator,
      msg: 'Page Not Found!'
   }
}

const app = express()
app.set('json spaces', 2)
   .use(logger('dev'))
   .use(express.json())
   .use(express.urlencoded({
      extended: false
   }))
   .use(cookieParser())
   .use(express.static(path.join(__dirname, 'public')))
   .use('/', index)
   .use('/api', api)
   .get('*', function(req, res) {
      res.status(404).json(global.status.error)
   })
   .listen(PORT, () => console.log(`Server is running in port ${PORT}`))