const express = require("express")

const app = express()

const routes = require('./routes.js')


// Express middleware to parse requests' body
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';

// On ouvre une connexion à notre base de données
MongoClient.connect(url)
     .then(database => database.db("friendFinder"))
     .then(mydatabase => routes.implement(app,mydatabase))
  .catch(err => { throw err })

  // MongoClient.connect(url)
  //   .then(database => database.db("users").collection("friends"))
  //   .then(friends => {
  //     app.post('/friend', (req,res) => {
  //
  //       const nvAmitie ={
  //         expediteur : req.body.myToken,
  //         destinataire:req.body.friendId,
  //         status:'pending'
  //       }
  //       friends.insertOne(nvAmitie)
  //           .then(resultat => res.status(201).json(nvAmitie))
  //     })
  //   })

  app.listen(3000,() => console.log("Awaiting requests."))
