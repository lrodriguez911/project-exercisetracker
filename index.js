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
const {Schema} = mongoose;

const ExerSchema = new Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date,
})
const UserSchema = new Schema({
  username : {type: String, required: true},
  log : [ExerSchema]
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
  const {username} = req.body
  const newUser = new User({username})
  newUser.save((err, data) =>{
    const {username, _id} = data
    if(err || !data) res.send('Dont save this user');
    res.json(
      {username, _id})
  })
})

app.get('/api/users',(req, res) => {
  User.find({}, (err, data) => {
  if(err) res.send('Dont find user to show');
  res.json(data)})
})
app.get('/api/users/:id/logs', (req, res) => {
  const {from, to, limit} = req.query;
  const {id} = req.params;
 
  
  User.findById(id ,(err, dataUser) =>{
    if(err || !dataUser){
      res.send('dont find that user')
    } else{
    let log = dataUser.log.map((i) => {
      return {
      description : i.description,
      duration : i.duration,
      date: i.date.toDateString()}
    });
    let nullNot = limit ?? 50;
    let fromDate = new Date(0);
    let toDate = new Date();
    if(from){
      fromDate = new Date(from)
      }
    if(to){
      toDate = new Date(to)
    }
    if(from || to){
      log = dataUser.log.filter((i) => { 
      const dateExercises = i.date.getTime()
       return dateExercises >= fromDate && dateExercises <= toDate
      })
    }
    fromDate = fromDate.getTime()
    toDate = toDate.getTime()
    if(limit){
    log = log.slice(0, nullNot)
    } 
    const {username, _id} = dataUser;
    let count = log.length;
    res.json({username, count, _id, log})
    } 
  })
})
app.post('/api/users/:id/exercises', (req, res) => {
  const {id} = req.params;
  const {description, duration} = req.body;
  const newExercise = new Exercise({
      description,
      duration,
      date : new Date(req.body.date).toDateString()
    })
    if(!newExercise.date > 0){
      newExercise.date = new Date().toISOString().substring(0,10)
    }
  User.findByIdAndUpdate(id,{$push : {log:newExercise}},{new: true},(err, dataUserFind) =>{
      if(err || !dataUserFind) res.send('Dont save that exercise');
      const {description, duration, date, _id} = newExercise;
      const {username} = dataUserFind;
      console.log(newExercise)
      res.json({
        username,
        description,
        duration,
        date: new Date(date).toDateString(),
        _id:id
      })
    
  })
})

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
