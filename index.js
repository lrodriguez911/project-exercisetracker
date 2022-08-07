const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mySecret = process.env.MONGO_URI;
const mongoose = require('mongoose')

//connect to db
mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true})

const {Schema } = mongoose;
const userSchema = new Schema({
  username : {type: String, required: true},
  description: String,
  duration: Number,
  date: { type: Date.toDateString , default: Date.now },
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: { type: Date.toDateString , default: Date.now },
  }]
})

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
