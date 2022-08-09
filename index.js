const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const mySecret = process.env.MONGO_URI;
const {Schema } = mongoose;
mongoose.connect(mySecret,
  {useNewUrlParser: true,
  useUnifiedTopology: true})

const ExercisesSche = new Schema({
  description: String,
  duration: Number,
  date: Date,
})
const UserSche = new Schema({
  username: {type: String, required: true}
})
const Exercises = new mongoose.model('Exercises',ExercisesSche)
const User = new mongoose.model('User',ExercisesSche)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({extended:false}))


app.post('/api/users', (req, res) =>{
  const user = new User({username : req.body.username})
  user.save((err, data) => {
    if(err) return console.log(err);
    res.json({username : req.body.username})
  })
  
})
app.post('/api/users/:_id/exercises', (req, res) =>{
  res.json(req.params.id)
})

console.log(mongoose.connection.readyState)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
