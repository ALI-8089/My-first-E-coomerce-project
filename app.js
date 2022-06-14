const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const adminRouter = require('./routes/admin')
const usersRouter = require('./routes/user')
const hbs = require('express-handlebars')
const app = express()
const db = require('./config mongo/mongo-connection')
const nocache = require("nocache");
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv').config()
// const fileUpload = require('express-fileupload')
const cors = require('cors')
app.use(
  cors({
    origin: '*',
  }),
)
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine(
  'hbs',
  hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
  }),
)
// app.use(fileUpload())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(nocache());
app.use(
  session({
    secret: 'token',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: 'mongodb://localhost:27017' }),
    cookie: { maxAge: 7 * 24 * 60 * 60 },
  }),
)
db.connect((err) => {
  if (err) {
    console.log('connection err' + err)
  } else {
    console.log('data base conneted to port 27017')
  }
})

app.use('/', usersRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
// #571D65
