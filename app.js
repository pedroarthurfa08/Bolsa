const express = require('express')
const app = express()

const dotenv = require("dotenv")
dotenv.config()

const port = process.env.APP_PORT || 3000

var session = require('express-session')
const pgSession = require('connect-pg-simple')(session);
const pool = require('./databases/postgres');

const sessionOptions = session({
  store: new pgSession({
    pool : pool,                // Connection pool
    tableName : 'session'   // Use another table-name than the default "session" one
    // Insert connect-pg-simple options here
  }),
  secret: 'process.env.SESSSION_SECRET', // mudar para o .env
  resave: false, // true se quiser que a sessao se renove mesmo com inatividade
  saveUninitialized: false, // true se quiser identificar visitantes recorrentes
  cookie: {
    maxAge: 1000 * 60 * 60, // valor em miliseconds - uma hora
    httpOnly: true
  }
})
app.use(sessionOptions)

const router = require('./routes/index-router')
const userRouter = require('./routes/user-router')
const postRouter = require('./routes/post-router')

app.use(function (req, res, next) {
  res.locals.usuario = req.session.usuario
  next()
})

const expressLayouts = require('express-ejs-layouts')

app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'))

app.use(expressLayouts)

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)
app.use('/user', userRouter)
app.use('/post', postRouter)

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})