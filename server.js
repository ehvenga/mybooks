require('dotenv').config
const express = require('express')
const app = express()
const expHbs = require('express-handlebars')

const port = process.env.PORT || 5000

app.engine('hbs', expHbs({ extname:'hbs' }))
app.set('view engine', 'hbs')

app.listen(port, () => {
    console.log(`Server Created at ${port}`)
})