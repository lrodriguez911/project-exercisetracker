const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mySecret = process.env.MONGO_URI;
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

//using bodyparser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//connect to db
mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true})


//create schema mongoose to send to mongodb
const {Schema } = mongoose;
const UserSchema = new Schema({
  username : {type: String, required: true}
})
const ExerSchema = new Schema({
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
  const newUser = new User({username: req.body.username})
  newUser.save((err, data) =>{
    if(err || !data) res.send('Dont save this user');
    res.json(data)
  })
})

app.post('/api/users/:id/exercises', (req, res) => {
  const id = req.params.id;
  const {description, duration, date} = req.body;
  User.findById(id,(err, dataUserFind) =>{
    if(err || !dataUserFind) res.send('Dont find that id');
    const newExercise = new Exercise({
      userId : id,
      description, 
      duration, 
      date : new Date(date)
    })
    newExercise.save((err,data) => {
      if(err || !data) res.send('Dont save that exercise');
      const {description, duration, date, _id} = data;
      res.json({
        username: dataUserFind.username,
        description,
        duration,
        date : date.toDateString(),
        _id: dataUserFind.id
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
