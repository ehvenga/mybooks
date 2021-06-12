// import all packages
require('dotenv').config()
const express = require('express')
const app = express()
const expHbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const myStore = new session.MemoryStore()
const expressUpload = require('express-fileupload')

// set port
const port = process.env.PORT || 5000

// import keys and routes
const {DATABASE_URL} = process.env
const {SESSION_SECRET} = process.env
// const {seedDB} = require("./seed")
const userRouter = require('./routes/user')
const cartRouter = require('./routes/cart')
const booksRouter = require('./routes/books')
const checkoutRouter = require('./routes/checkout')

// template engine
app.engine('hbs', expHbs({ extname:'hbs' }))
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(expressUpload())

// configure session
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 900000000
    },
    store: myStore
}))

// configure mongoose
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err) => {
    if (err) throw err

    // seedDB()
    console.log('MongoDB Connected')
})

// routes
app.use('/', userRouter)
app.use('/', booksRouter)
app.use('/cart', cartRouter)
app.use('/checkout', checkoutRouter)

// error handling if route not found
app.all('*', (req, res) => {
    res.status(404).render('error', {alert: 'Error: 404 Not Found'})
})

// bind and listen to connections at port
app.listen(port, () => {
    console.log(`Server Created at ${port}`)
})