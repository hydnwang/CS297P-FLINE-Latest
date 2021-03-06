require("dotenv").config();
const PORT = process.env.PORT || 3000
const FRONT_DIR = process.env.FRONT_DIR

const bodyParser = require('body-parser')
const express = require('express')
const next = require('next')
const cookieParser = require('cookie-parser')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, dir: FRONT_DIR })
const handle = app.getRequestHandler()
const fileUpload = require('express-fileupload')

app.prepare().then(() => {
  const server = express()
  server.use(cookieParser())
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(fileUpload())
  server.use('/api', require('./routes'))

  server.get('*', handle)
  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server is ready at http://localhost:${PORT}\n`)
  })
})
