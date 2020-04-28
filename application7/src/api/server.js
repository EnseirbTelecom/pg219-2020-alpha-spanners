const express = require("express")
const JWT_KEY = 'wGuyfJdbzBMyBwpXMjEXnKQQmKlXsiItxzLVIfC5qE97V6l6S0LzT9bzixv'
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const app = express()

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
     .then(database => database.db("users"))
     .then(mydatabase => {

          app.get("/ami/:idexp/:iddest", (req, res) => {
            mydatabase.collection('amis').findOne({destinaireid: req.params.iddest,expediteur:req.params.idexp})
                    .then(item => res.json(item))
                    .catch(err => console.log("err" + err))
            console.log('req.params.iddest : '+req.params.iddest);
            console.log('req.params.idexp : ' + req.params.idexp);
          })

          app.delete('/ami/:idexp/:iddest',(req,res) => {
            mydatabase.collection('amis').deleteOne({destinaireid: req.params.iddest,expediteur:req.params.idexp})
                                         .then(command => res.status(201).json(req.params.idexp))
            console.log('req.params.iddest : '+req.params.iddest);
            console.log('req.params.idexp : ' + req.params.idexp);
          })

          app.put('/friend',(req,res) => {
            const changement ={
              expediteur:req.body.idexpediteur,
              expediteurNom:req.body.nomexpediteur,
              expediteurPrenom:req.body.prenomexpediteur,
              destinataireNom:req.body.nomdestinataire,
              destinatairePrenom:req.body.prenomdestinataire,
              destinaireid:req.body.myyid,
              statut:req.body.statut
            }
            mydatabase.collection('amis').update({expediteur:req.body.idexpediteur,destinaireid:req.body.myyid},{$set:changement})
                                         .then(command => res.json(req.body))
                                         .catch(err => console.log("Error " + err))
            console.log(changement)
          })

          app.get('/friend',(req,res) => {
            mydatabase.collection('amis').find().toArray()
                .then(friends => res.json(friends))
          })

          app.post('/friend', (req,res) => {
            let nvAmitie = {
              expediteur : req.body.monId,
              expediteurNom:req.body.monNom,
              expediteurPrenom:req.body.monPrenom,
              destinataireNom:req.body.friendNom,
              destinatairePrenom:req.body.friendPrenom,
              destinaireid:req.body.idFriend,
              statut:'en attente',
            }
            mydatabase.collection('amis').insertOne(nvAmitie)
                                                    .then(command => res.status(201).json(nvAmitie))
          })

          app.get("/inscrits/:id", (req, res) => {
            mydatabase.collection('infos').findOne({ _id: ObjectID(req.params.id) })
            .then(item => res.json(item))
            .catch(err => console.log("err" + err))
          })

          app.get('/contacts', (req,res) =>{
            mydatabase.collection('infos').find().toArray()
              .then(inscrits => res.json(inscrits))
          })

          app.post('/connexion',(req,res) => {
            let infoLogin = {
              mailUser : req.body.mailUser,
              passwordUser : req.body.passwordUser,
            }
            //console.log('requete recu')
            //console.log(infoLogin)

            if(infoLogin.mailUser == '' || infoLogin.passwordUser === ''){
              return res.status(400).json({error:"Vous devez saisir tous les champs"});
            }

            //verify mail regex & password length

            mydatabase.collection('infos').findOne({mail:req.body.mailUser})
                 .then(function(usr){
                    if(usr){
                      bcrypt.compare(infoLogin.passwordUser,usr.password,function(errCrypt,resCrypt){
                        if(resCrypt){ //Résultat positif
                          const token = jwt.sign(
                            {
                              mailToken:usr.mail,
                              idToken:usr._id
                            },
                            JWT_KEY,
                            {
                              expiresIn:'24h'
                            }
                          );
                          //infos.update({mail:usr.mail},{$set:{token:token}})
                          return res.status(200).json({token:token,id:usr._id,lastname:usr.nom,firstname:usr.prenom})
                        }
                        else{
                          res.status(400).json({error:"Le mot de passe que vous avez saisi est incorrect"})
                        }
                      })
                    }
                    else{
                      return res.status(400).json({error:"You should sign up before login"})
                    }
                 })
          })

          app.post('/inscription',(req,res) => {
              let user = {
                mail : req.body.mail,
                password : req.body.password,
                nom : req.body.nom,
                prenom : req.body.prenom,
                pseudo : req.body.pseudo,
                birthday : req.body.birthday
              }

              if(user.mail === '' || user.password === '' || user.nom === '' || user.prenom === '' || user.pseudo === '' || user.birthday === ''){
                //console.log(user);
                return res.status(400).json({error:"Vous devez saisir tous les champs"});
              }

              //verify pseudo length , mail regex , password etc

              mydatabase.collection('infos').find({mail:req.body.mail}).count().then(num => {
                if (num !== 0){
                  //console.log("mail exists")
                  return res.status(409).json({error:"Mail already exists !"});
                }
                else{
                  bcrypt.hash(user.password,5,function(err,cryptedPassword){
                    var nvUser= {
                      mail : req.body.mail,
                      password : cryptedPassword,
                      nom : req.body.nom,
                      prenom : req.body.prenom,
                      pseudo : req.body.pseudo,
                      birthday : req.body.birthday
                    }
                    mydatabase.collection('infos').insertOne(nvUser)
				                 .then(command => res.status(201).json(nvUser))
                  })
                }
              });
          })
  })
  .catch(err => { throw err })

  // MongoClient.connect(url)
  //   .then(database => database.db("users").collection("amis"))
  //   .then(amis => {
  //     app.post('/friend', (req,res) => {
  //
  //       const nvAmitie ={
  //         expediteur : req.body.myToken,
  //         destinataire:req.body.friendId,
  //         statut:'en attente'
  //       }
  //       amis.insertOne(nvAmitie)
  //           .then(resultat => res.status(201).json(nvAmitie))
  //     })
  //   })

  app.listen(3000,() => console.log("Awaiting requests."))
