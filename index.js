const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mySecret = process.env.MONGO_URI;
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

//connect to db
mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true})


//create schema mongoose to send to mongodb
const {Schema } = mongoose;
const UserSchema = new Schema({
  username : {type: String, required: true}
})
const ExerSchema = new Schema({
  userId : {type: String , required: true},
  description: String,
  duration: Number,
  date: Date,
})

//create models whit mongoose
const User = new mongoose.model('User', UserSchema);
const Exercise = new mongoose.model('Exercise', ExerSchema)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  console.log(req.body)
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
