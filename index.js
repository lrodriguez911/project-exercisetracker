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
const UserSchema = new Schema({
  username : {type: String, required: true}
})
const ExerSchema = new Schema({
  userId: {type: String, required: true},
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

app.get('/api/users', (req, res) => {
   User.find({}, (err, data) => {
  if(err) res.send('Dont find user to show');
  res.json(data)})
})
app.get('/api/users/:id/logs', (req, res) => {
  const {from, to, limit} = req.query;
  const {id} = req.params;
  User.findById(id, (err, dataUser) =>{
    if(err || !dataUser){
      res.send('dont find that user')
    } else{
      let dataObjPar = {};
      if(from){
        dataObjPar["$gte"] = new Date(from)
      }
      if(to){
        dataObjPar["$lte"] = new Date(to)
      }
      let filter = {userId : id};
      if(from || to){
        filter.date = dataObjPar
      }
      let nullNot = limit ?? 100;
      Exercise.find(filter).limit(+nullNot).exec((err, data) => {
        if(err || !data){ res.send({})}
      const count = data.length;
      const log = data;
      const {username, _id} = dataUser;
      const resultLog = log.map((i) => {
        return {
      description : i.description,
      duration : i.duration,
      date: i.date.toDateString()}
      })
      res.json({username, count, _id, resultLog})
      })
    }
  })
})
app.post('/api/users/:id/exercises', (req, res) => {
  const {id} = req.params;
  const {description, duration} = req.body;
  console.log(typeof req.body.date)
  console.log(new Date(req.body.date))
  
  User.findById(id,(err, dataUserFind) =>{
    if(err || !dataUserFind) res.send('Dont find that id');
    const newExercise = new Exercise({
      userId : id,
      description, 
      duration, 
      date : new Date(req.body.date)
    })
    console.log(newExercise)
    if(newExercise.date === ''){
      newExercise.date = new Date().toISOString().substring(0,10)
    }
    newExercise.save((err, data) => {
      if(err || !data) res.send('Dont save that exercise');
      const {description, duration, date, _id} = data;
      res.json({
        username: dataUserFind.username,
        description,
        duration,
        date : date.toDateString(),
        _id
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
