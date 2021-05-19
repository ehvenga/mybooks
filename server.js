require('dotenv').config
const express = require('express')
const app = express()
const expHbs = require('express-handlebars')

const port = process.env.PORT || 5000
const {seedDB} = require("./seed")

app.engine('hbs', expHbs({ extname:'hbs' }))
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(port, () => {
    console.log(`Server Created at ${port}`)
})