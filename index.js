const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mySecret = process.env.MONGO_URI;
const { Schema } = mongoose;
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

const ExercisesSche = new Schema({
  description: String,
  duration: Number,
  date: Date,
});
const UserSche = new Schema({
  username: { type: String, required: true },
});
const Exercises = new mongoose.model("Exercises", ExercisesSche);
const User = new mongoose.model("User", UserSche);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/users", (req, res) => {
  const user = new User({ username: req.body.username });
  user.save((err, data) => {
    if (err) res.send("Error saving user");
    res.json(data);
  });
});


app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id;
  const { description, duration, date } = req.body;
  User.findById(id, (err, UserData) => {
    if (err || !UserData) {
      res.send("Dont find that user");
    } else {
      const exercise = new Exercises({
        userId: id,
        description,
        duration,
        date: new Date(date),
      });
      exercise.save((err, data) => {
        if (err || !data) {
          res.send("Dont save that exercise");
        } else {
          const {description, duration, date, _id} = data;
          res.json({
            username: UserData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: UserData.id
          })
        }
      });
    }
  });
});
app.get('/api/users/:_id/logs', (req, res) => {
  const {from, to, limit} = req.query;
  const {id} = req.params;
  User.findById(id, (err, dataUser) =>{
    if(err || !data){
      res.send('dont find that user')
    } else{
      let dataObj = {};
      if(from){
        dataObj["$gte"] = new Date(from)
      }
      if(to){
        dataObj["$lte"]
      }
      let filter = {userId : id};
      Exercises.find(filter)
    }
  })
})
console.log(mongoose.connection.readyState);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
