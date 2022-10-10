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
      User.log.find(filter).limit(+nullNot).exec()
      /* User.log.find(filter).limit(+nullNot).exec((err, data) => {
        if(err || !data){ res.send({})}
      const count = data.length;
      const constLog = data;
      const {username, _id} = dataUser;
      const log = constLog.map((i) => {
        return {
      description : i.description,
      duration : i.duration,
      date: i.date.toDateString()}
      })
      res.json({username, count, _id, log})
      }) */
    }
  })
})
app.post('/api/users/:id/exercises', (req, res) => {
  const {id} = req.params;
  const {description, duration} = req.body;
  const newExercise = new Exercise({
      description, 
      duration, 
      date : new Date(req.body.date)
    })
    if(!newExercise.date > 0){
      newExercise.date = new Date().toISOString().substring(0,10)
    }
  User.findByIdAndUpdate(id,{$push : {log:newExercise}},{new: true},(err, dataUserFind) =>{
      if(err || !dataUserFind) res.send('Dont save that exercise');
      const {description, duration, date, _id} = newExercise;
      res.json({
        username: dataUserFind.username,
        description,
        duration,
        date: date.toDateString(),
        _id
      })
    
  })
})

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
