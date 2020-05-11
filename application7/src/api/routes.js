/* File that is in charge of implementing the routes to the app*/
const request = require('request');
var CryptoJS = require("crypto-js");
const JWT_KEY = 'wGuyfJdbzBMyBwpXMjEXnKQQmKlXsiItxzLVIfC5qE97V6l6S0LzT9bzixv'
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const ObjectID = require('mongodb').ObjectID
const utils = require('./utils.js')

//utils.convertTime
function implement(app,database){

    // Route to get the status of an invitation
    app.get("/invite/:senderId/:receiverId", (req, res) => {
        database.collection('friends').findOne({receiverId : req.params.receiverId, senderId : req.params.senderId})
            .then(item => res.json(item))
            .catch(err => console.log("err" + err))
        console.log('req.params.receiverId : ' + req.params.receiverId);
        console.log('req.params.senderId : ' + req.params.senderId);
    })

    // Route to refuse an invitation or delete a friend
    app.delete('/removefriend/:senderId/:receiverId',(req,res) => {
        database.collection('friends').deleteOne({receiverId : req.params.receiverId, senderId : req.params.senderId})
            .then(command => res.status(201).json(req.params.senderId))
        console.log('req.params.receiverId : ' + req.params.receiverId);
        console.log('req.params.senderId : ' + req.params.senderId);
    })


    app.put('/time/:id',(req,res) => {
      const beginEnd= {
        dateTime : req.body.dateTime,
         period : req.body.period
      }
      console.log(beginEnd)
      database.collection('positions').update({userId:req.params.id},{$set : beginEnd})
              .then(command => console.log('modification effectuée'))
    })

    // position active d'un user
    app.get('/position/:id',(req,res) => {
      database.collection('positions').findOne(
        {
          $and : [ { userId : {$eq : req.params.id} } , { status : {$eq : 'activated' } } ]
        }).then(position => (position) ? res.json(position) : res.status(404).json({ error: "You must activate your position first" }))
				  .catch(err => console.log("err" + err))
    })

    //toutes les positions des amis
    app.get('/friendsposition/:id',(req,res) => {
      database.collection('friends').find({
        $and : [
                 {
                   $or : [ { senderId : { $eq : req.params.id } },{ receiverId : { $eq : req.params.id } }]
                 },
                 { status : { $eq : 'accepted' } }
               ]
        }).toArray().then(function(friends){
                    if(friends.length !== 0){
                      var arrayfriends = []
                      for(var i=0;i<friends.length;i++){
                        if(friends[i].senderId === req.params.id){
                          //arrayfriends.push(friends[i].receiverSurname)
                          arrayfriends.push(friends[i].receiverId)
                        }
                        else if (friends[i].receiverId === req.params.id){
                          //arrayfriends.push(friends[i].senderSurname)
                          arrayfriends.push(friends[i].senderId)
                        }
                      }
                    }

                    database.collection('positions').find(
                      {
                        $and : [ { userId : {$in : arrayfriends} } , { status : {$eq : 'activated' } } ]
                      }).toArray().then(result => res.json(result))
            })
    })

    app.get('/toutespositions' , (req,res) =>{
      database.collection('positions').find().toArray()
              .then(positions => res.json(positions))
    })

    app.delete('/positions',(req,res) =>{
      database.collection('positions').find().toArray()
              .then(function(positions){
                if(positions.length !== 0){
                  for (var i=0 ; i<positions.length;i++){
                    let activation = utils.parsingdate(positions[i].dateTime)

                    let departure = utils.parsingdate(positions[i].period)
                    let hourminactivation = utils.convertTime(activation[1])
                    let hourmindeparture = utils.convertTime(departure[1])

                    let arrayactivation = utils.tableauOfTime(hourminactivation,activation)
                    let arraydeparture = utils.tableauOfTime(hourmindeparture,departure)

                    let dateactivation = new Date(arrayactivation[0],arrayactivation[2]-1,arrayactivation[1],arrayactivation[3],arrayactivation[4]);
                    let datedeparture =  new Date(arraydeparture[0],arraydeparture[2]-1,arraydeparture[1],arraydeparture[3],arraydeparture[4]);
                    let datenow = new Date()

                    if(datenow.getTime() >= datedeparture.getTime()){
                      database.collection('positions').updateOne({_id : positions[i]._id},{$set : {status : 'desactivated'}})
                    }
                  }
                }
              })
    })

    app.post('/position/:id',(req,res) => {
      const coordinates = {
        userId : req.params.id,
        userName : req.body.userName,
        latitude : req.body.latitude,
        longitude : req.body.longitude,
        dateTime : req.body.dateTime,
        period : req.body.period,
        message : req.body.msg,
        status : req.body.status,
      }
      console.log(coordinates);
      database.collection('positions').find(
        {
          $and : [ { userId : {$eq : req.params.id} } , { status : {$eq : 'activated' } } ]
        }).toArray().then(function(userposition){
                    if(userposition.length !== 0){
                      for(var i=0;i<userposition.length;i++){
                        if(userposition[i].status === 'activated'){
                          database.collection('positions').updateMany({userId:req.params.id},{$set : {status : 'desactivated'}})
                                  .then(function(result){
                                    database.collection('positions').insertOne(coordinates);
                                  })
                        }
                      }
                    }
                    else{
                        console.log("you are new to the database")
                        database.collection('positions').insertOne(coordinates);
                    }
                })
    })

    app.get('/pastpositions/:id', (req,res) => {
      database.collection('positions').find({
        $and : [ { userId : {$eq : req.params.id} } , { status : {$eq : 'desactivated' } } ]
      }).toArray().then(positions => res.json(positions))
    })

    app.get('/deletedposition/:id',(req,res) => {
      database.collection('positions').find({_id : ObjectID(req.params.id)}).toArray()
              .then(position => res.json(position))
    })

    app.delete('/deletedposition/:id',(req,res) => {
      console.log('j ai supprimé une position de mon historique')
      database.collection('positions').deleteOne({_id : ObjectID(req.params.id)})
    })

    app.get('/pastposition/:idposition',(req,res) => {
      database.collection('positions').find({_id : ObjectID(req.params.idposition)}).toArray()
                          .then(position => res.json(position))
    })

    //FIXME not the good way to accept an invite ?
    // route to accept invites
     app.put('/updateinvite',(req,res) => {
        const newValue ={
            senderId        : req.body.senderId,
            senderSurname   : req.body.senderSurname,
            senderName      : req.body.senderName,
            receiverSurname : req.body.receiverSurname,
            receiverName    : req.body.receiverName,
            receiverId      : req.body.receiverId,
            status          : req.body.status
        }
        database.collection('friends').update({senderId : req.body.senderId , receiverId : req.body.receiverId },{$set : newValue})
                                    .then(command => res.json(req.body))
                                    .catch(err => console.log("Error " + err))
    })

    app.get('/sentRequest/:id', (req,res) => {
        database.collection('friends').find( { senderId : req.params.id }).toArray().then(friends => res.json(friends))
    })

    app.get('/friendlist/:userId' , (req,res) => {
      database.collection('friends').find({
        $and : [
                 {
                   $or : [ { senderId : { $eq : req.params.userId } },{ receiverId : { $eq : req.params.userId } }]
                 },
                 { status : { $eq : 'accepted' } }
               ]
        }).toArray().then(friends => res.json(friends))
    })

    // route that returns the friendlist
    app.get('/notif/:usrId',(req,res) => {
        database.collection('friends').find(
          {
           $and : [ { receiverId : {$eq : req.params.usrId} } , { status : {$eq : 'pending' } } ]
         }).toArray().then(friend => res.json(friend))
    })

    app.get('/friends/addFriends/:myId',(req,res) => {
              database.collection('friends').find({
                    $and : [
                             {
                               $or : [ { senderId : {$eq : req.params.myId}},{ receiverId : {$eq : req.params.myId}}]
                             },
                             { status : { $ne : 'refused' } }
                           ]
                     }).toArray().then(friends => {
                          if(friends.length !=0){
                            var arraySenderReceiver = []
                            for(var i=0;i<friends.length;i++){
                              if(friends[i].senderId === req.params.myId){
                                arraySenderReceiver.push(friends[i].receiverId)
                              }
                              else if (friends[i].receiverId === req.params.myId){
                                arraySenderReceiver.push(friends[i].senderId)
                              }
                            }
                            arraySenderReceiver.push(req.params.myId)
                            database.collection('users').find({ _id : { $nin: arraySenderReceiver.map(function(id) { return ObjectID(id);}) }}).limit(20).toArray()
                                  .then(users => res.json(users))
                          }
                          else{
                            database.collection('users').find({_id : { $ne : ObjectID(req.params.myId) }}).limit(20).toArray()
                                    .then(users => res.json(users))
                          }
                    })
    })

    //route to send an invite
    app.post('/invite', (req,res) => {
        let newFriend = {
            senderId        : req.body.senderId,
            senderSurname   : req.body.senderSurname,
            senderName      : req.body.senderName,
            receiverSurname : req.body.receiverSurname,
            receiverName    : req.body.receiverName,
            receiverId      : req.body.receiverId,
            status          : 'pending'
        }
        database.collection('friends').insertOne(newFriend)
            .then(command => res.status(201).json(newFriend)) //NOTE do we really need to send back the data ?
    })

    app.post('/login',(req,res) => {
        let infoLogin = {
        mail : req.body.mail,
        password : req.body.password,
        }

        if(infoLogin.mailUser === '' || infoLogin.passwordUser === ''){
          return res.status(400).json({error:"You must fill every field"});
        }

        database.collection('users').findOne({mail:req.body.mail})
            .then(function(usr){
                if(usr){
                   let decryptedPasswordLogin = CryptoJS.AES.decrypt(usr.password,'secret key 123');
                   let originalPasswordLogin = decryptedPasswordLogin.toString(CryptoJS.enc.Utf8);

                   let decryptedPasswordRegister = CryptoJS.AES.decrypt(infoLogin.password,'secret key 123');
                   let originalPasswordRegister = decryptedPasswordRegister.toString(CryptoJS.enc.Utf8);

                    if(originalPasswordLogin === originalPasswordRegister){
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
                          return res.status(200).json({token : token, id : usr._id, surname:usr.surname, name:usr.name})
                    }
                    else{
                      res.status(400).json({error:"Incorrect password"})
                    }
                }
                else{
                  return res.status(400).json({error:"You should sign up before login"})
                }
            })
    })

    app.post('/register',(req,res) => {

        const regexEmail = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,10})(\.[a-z]{2,10})?$/
        const regexPseudo = /^[a-z\d]{5,15}$/i

        let user = {
            mail         : req.body.mail,
            password     : req.body.password,
            surname      : req.body.surname,
            name         : req.body.name,
            pseudo       : req.body.pseudo,
            birthday     : req.body.birthday
        }

        if(user.mail === '' || user.password === '' || user.surname === '' || user.name === '' || user.pseudo === '' || user.birthday === ''){
            return res.status(400).json({error:"You must fill every field"});
        }

        if(regexPseudo.test(user.pseudo) === false){
          return res.status(400).json({error: "Your pseudo mustn't contain metacharacters , its length must be between 5 and 15 characters"})
        }

        if(regexEmail.test(user.mail) === false){
          return res.status(400).json({error: " The email must be written in the following form __@__.__"})
        }

        if(user.password.length < 6 && user.password.length > 20){
          return res.status(400).json({error: " Your password must contain between 6 and 20 characters "})
        }

        //Conditions sur le mail , la longueur du password

        database.collection('users').find({mail:req.body.mail}).count().then(number => {
            if (number !== 0){
                return res.status(409).json({error:"Mail already exists !"});
            }
            else{
                database.collection('users').insertOne(user)
                        .then(command => res.status(201).json(user)) //NOTE do we really need to send back the data ?
            }
        });
    })
}


exports.implement = implement;
