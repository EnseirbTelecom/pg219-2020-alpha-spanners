/* File that is in charge of implementing the routes to the app*/
var CryptoJS = require("crypto-js");
const JWT_KEY = 'wGuyfJdbzBMyBwpXMjEXnKQQmKlXsiItxzLVIfC5qE97V6l6S0LzT9bzixv'
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const ObjectID = require('mongodb').ObjectID



function verifyToken(req,res,next){
  if ( req.query.token){
    //NOTE temp
    if( req.query.token == "dev"){
      req.userId = "5ec873100d0135103028c018";
      next();
    }
    else {

    
    //
    jwt.verify(req.query.token,JWT_KEY, (err,data) => {
      if (err){
          return res.status(400).json({error:err.name})
      } else {
        req.userId = data.id;
        req.userPseudo = data.ps;
        next();
      }
    });
    }
  } else {
    return res.status(400).json({error:"no token"})
  }
}

function implement(app,database){

//ANCHOR NOT CONNECTED REQUESTS
  app.post('/login',(req,res) => {
    const infoLogin = {
      mail : req.body.mail.trim().toLowerCase(),
      password : req.body.password,
    }

    if(infoLogin.mailUser === '' || infoLogin.passwordUser === ''){
      return res.status(400).json({error:"You must fill every field"});
    }

    database.collection('users').findOne({mail:req.body.mail})
      .then(function(usr){
        if(usr){

          const decryptedPassword = CryptoJS.AES.decrypt(infoLogin.password,'secret key 123').toString(CryptoJS.enc.Utf8);
          const expireDate = Date.now() + (24* 60 * 60 * 1000); //the expiration date of the token in ms
          bcrypt.compare(decryptedPassword, usr.password)
            .then(bool =>{
              if(bool){
                const expireDate = Date.now() + (24* 60 * 60 * 1000); //the expiration date of the token in ms
                const token = jwt.sign(
                  {
                    exp: Math.floor(expireDate/1000) + 10, 
                    // the expiration date in s 
                    // we add a 10s margin  because we prefer that the client handle expiration rather 
                    // than the server responding invalid_token
                    id: usr._id,
                    ps: usr.pseudo
                  },
                  JWT_KEY
                );
                return res.status(200).json({token : token, tokenExp: expireDate, id : usr._id, surname:usr.surname, name:usr.name, pseudo: usr.pseudo})
              } else {
                res.status(400).json({error:"Incorrect password"})
              }
            })
        } else {
          return res.status(400).json({error:"You should sign up before login"})
        }
      })
  })

  app.post('/register',(req,res) => {

    const regexEmail = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    const regexStrings = /^[a-z\d]{1,16}$/i
    const decryptedPassword = CryptoJS.AES.decrypt(req.body.password,'secret key 123').toString(CryptoJS.enc.Utf8);
    if(decryptedPassword.length < 6 || decryptedPassword.length > 20){
      return res.status(400).json({error: " Your password must contain between 6 and 20 characters "})
    }
    var bday;
    try {
      bday = new Date(req.body.birthday)
    } catch {
      return res.status(400).json({error:"Birthday's date format not understood"});
    }
    bcrypt.hash(decryptedPassword,10)
      .then(hashedPassword=> {
        const user = {
          mail         : req.body.mail.trim().toLowerCase(),
          password     : hashedPassword,
          surname      : req.body.surname.trim(),
          name         : req.body.name.trim(),
          pseudo       : req.body.pseudo.trim(),
          birthday     : bday
        }

        if(user.mail === '' || user.password === '' || user.surname === '' || user.name === '' || user.pseudo === ''){
          return res.status(400).json({error:"You must fill every field"});
        }

        if(regexStrings.test(user.pseudo) === false){
          return res.status(400).json({error: "Your pseudo mustn't contain metacharacters , its length must be between 1 and 16 characters"})
        }

        if(regexStrings.test(user.name) === false){
          return res.status(400).json({error: "Your name mustn't contain metacharacters , its length must be between 1 and 16 characters"})
        }
        if(regexStrings.test(user.surname) === false){
          return res.status(400).json({error: "Your surname mustn't contain metacharacters , its length must be between 1 and 16 characters"})
        }

        if(regexEmail.test(user.mail) === false){
          return res.status(400).json({error: " The email must be written in the following form __@__.__"})
        }

        //Conditions sur le mail , la longueur du password

        database.collection('users').findOne({$or: [{mail:user.mail},{pseudo: user.pseudo}]})
          .then(userDb => {
            if (userDb){
              if (userDb.mail === user.mail){
                return res.status(409).json({error:"Mail already exists !"});
              } else { //else that is the pseudo that is already taken
                return res.status(409).json({error:"Pseudo already taken !"});
              }
            
            }
            else{
              database.collection('users').insertOne(user)
                .then(command => res.status(201).json(user)) //NOTE do we really need to send back the data ?
            }
          });
    })
  })
  app.get('/search/:query', verifyToken, (req,res) => {
    database.collection('users').findOne({$or : [{mail: req.params.query },{pseudo: req.params.query }]}, { projection: { pseudo: 1}} )
      .then(result => res.json(result) )
      .catch(err => res.sendStatus(500))

  })


//ANCHOR MANAGE INVITES
  // Route to delete a friend or an invitation
  app.delete('/friend/delete/:otherId', verifyToken, (req,res) => {
    const userTuple = [ObjectID(req.params.otherId), ObjectID(req.userId)]; 
    database.collection('friends').deleteOne({receiverId : {$in: userTuple}, senderId : {$in: userTuple}})
      .then(command => (command.deletedCount) ? res.sendStatus(200): res.sendStatus(404))
      .catch(err => res.sendStatus(500))

  })
  //accept an invitation
  app.put('/friend/accept/:otherId', verifyToken, (req,res) => {
    database.collection('friends').updateOne(
      { receiverId : ObjectID(req.userId), senderId : ObjectID(req.params.otherId) },
      { 
        $set: {status : 'accepted' },
        $currentDate: { lastModified: true } 
      }
    )
      .then(command =>  (command.matchedCount) ? res.sendStatus(200): res.sendStatus(404))
      .catch(err => res.sendStatus(500))

  })
  //refuse an invitation
  app.put('/friend/refuse/:otherId', verifyToken, (req,res) => {
    database.collection('friends').updateOne(
      { receiverId : ObjectID(req.userId), senderId : ObjectID(req.params.otherId) },
      { 
        $set: {status : 'refused' },
        $currentDate: { lastModified: true } 
      }
    )
      .then(command =>  (command.matchedCount) ? res.sendStatus(200): res.sendStatus(404))
      .catch(err => res.sendStatus(500))

  })
  //route to send an invite
  app.put('/friend/invite/:otherId', verifyToken, (req,res) => {
    if (req.userId == req.params.otherId){
      return res.sendStatus(404);
    }
    receiverProm    = database.collection('users').findOne({_id: ObjectID( req.params.otherId)});
    receivedProm    = database.collection('friends').findOne({senderId: ObjectID(req.params.otherId) , receiverId: ObjectID(req.userId)});
    Promise.all([receiverProm, receivedProm])
      .then((values) => {
        if ( values[0] && !values[1] ){
          
          const invit ={
            senderId        : ObjectID( req.userId),
            senderPseudo    : req.userPseudo,
            receiverPseudo  : values[0].pseudo,
            receiverId      :  ObjectID(req.params.otherId),
            status          : 'pending',
            lastModified    : new Date()
          };
          database.collection('friends').insertOne( invit)
            .then( result => res.sendStatus(201) )
            .catch( err => {
              if (err.code === 11000){ //unique id violation => invite already in db 
                res.sendStatus(208) 
              } else {
                res.sendStatus(500) 
              }
              
            })
        } else {
          if (values[1]) { //the receiver has already sent an invite to the user, we accept it
            database.collection('friends').updateOne(
              { _id: values[1]._id},
              { 
                $set : { status: 'accepted' },
                $currentDate: { lastModified: true }
              }
            )
              .then(val => res.sendStatus(200))
              .catch( err => res.sendStatus(500) )
          } else { //the user was not found
            res.sendStatus(404);
          }
        }
      })
      .catch( err => res.sendStatus(500) )

  })


  //get the invitations sent, if a status is provided it is added to filter
  app.get('/friends/sent/:status', verifyToken, (req,res) => {
    const match = (["accepted", "refused", "pending"].indexOf(req.params.status) > -1) ? { senderId : ObjectID( req.userId), status : req.params.status } : { senderId : ObjectID( req.userId)};
    database.collection('friends').aggregate( [
      {$match : match},
      {$project: {_id: 0 , id: "$receiverId", pseudo: "$receiverPseudo", status:1, lastModified:1 }}
    ]).sort( { lastModified: -1 } ).toArray()
      .then( sent => res.json(sent))
      .catch( err => {res.sendStatus(500); throw err})
  })
  

  //get the invitations received, if a status is provided it is added to filter
  app.get('/friends/received/:status', verifyToken, (req,res) => {
    const match = (["accepted", "refused", "pending"].indexOf(req.params.status) > -1) ? { receiverId : ObjectID( req.userId), status : req.params.status } : { receiverId : ObjectID( req.userId)};
    database.collection('friends').aggregate( [
      {$match : match},
      {$project: {_id: 0 , id: "$senderId", pseudo: "$senderPseudo", status: 1, lastModified: 1 }}
    ]).sort( { lastModified: -1 } ).toArray()
      .then( received => res.json(received))
      .catch( err => {res.sendStatus(500); throw err})
  })

  //gets the friend list
  app.get('/friends/list/', verifyToken, (req,res) => {
    const userObjectId = ObjectID(req.userId);
    database.collection('friends').aggregate([
      {$match: {
        $or: [ {senderId: userObjectId}, {receiverId: userObjectId} ],
        status: 'accepted'
      }},
      {$replaceWith : {
        $cond: {
          if : { $eq: ["$senderId",userObjectId] },
          then : {id: "$receiverId", pseudo: "$receiverPseudo"},
          else : {id: "$senderId", pseudo: "$senderPseudo"}
        }
      }}
    ]).toArray()
      .then(friends => res.json(friends))
      .catch(err => {res.sendStatus(500); throw err})
  })

//ANCHOR POSITION MANAGEMENT
    //deactivating a position is simply updating the departure time to current time
    app.put('/pos/deactivate',verifyToken, (req,res) => {
      const now = new Date( Math.round(Date.now()/60000) *60000 ); // we round to inferior minute, because we expect a minute precision on /pos/activate
      //so this is important when one deactivate their pos just to activate a new one
      database.collection('positions').updateOne({ userId : ObjectID(req.userId), arrivalTime : {$lte: now},departureTime : {$gte : now}},{$set : {departureTime : now}})
        .then(command => {console.log('pos deactivated'); res.sendStatus(200)} )
    })

    // gets the active position of the user, if there is none then 404
    app.get('/pos/current',  verifyToken, (req,res) => {
      database.collection('positions').findOne({ userId : ObjectID(req.userId), arrivalTime : {$lt : new Date()}, departureTime : {$gte : new Date() }})
        .then(position => (position) ? res.json(position) : res.json(null))
        .catch(err => {console.log("err" + err); throw err;})
    })

    //toutes les positions des amis
    app.get('/pos/friends',  verifyToken, (req,res) => {
      database.collection('friends').aggregate([
        {$match: {
          $or: [{senderId: ObjectID(req.userId)},{receiverId: ObjectID(req.userId)} ],
          status: 'accepted'
        }},
        {$group: {
          _id: null,
          ids: {
            $push: {$cond : { if: {$eq : ["$senderId", ObjectID(req.userId)]}, then: "$receiverId", else: "$senderId"}}
          }
        }},
        {$project: { _id:0 }}

      ]).toArray()
        .then(function(friends){
          if (friends && friends[0]){
            const friendsIds = friends[0].ids;
            const now = new Date();
            database.collection('positions').find(
               { userId : {$in : friendsIds}, arrivalTime : {$lt : now}, departureTime : {$gte : now }  }
            ).sort( { arrivalTime: -1, departureTime: 1 } ).toArray()
              .then(result => res.json(result))
          } else {
            res.json([])
          }
        })
    })

    //post a new position
    app.post('/pos/activate', verifyToken, (req,res) => {
      const checkCoord = (x) => x < 90 && x > -90 && (typeof(x) === "number");
      if( req.body.msg.length >140 ){
        res.status(400).json("Message too long");
        return;
      } else if(! checkCoord(req.body.latitude)){
        res.status(400).json("Latitude invalid");
        return;
      }else if (! checkCoord(req.body.longitude)){
        res.status(400).json("Longitude invalid");
        return;
      }
      var arrivalTime;
      var departureTime;
      try{
        arrivalTime  = new Date(req.body.arrivalTime);
        departureTime= new Date(req.body.departureTime);
      }catch{
        res.status(400).json("Date format not understood");
        return;
      }
      if (departureTime <= arrivalTime){
        res.status(400).json("departureTime can not be before arrivalTime");
        return;
      }
      if( new Date(Date.now() -600000) > arrivalTime){
        res.status(400).json("arrivalTime can't be less than now");
        return;
      }
      const coordinates = {
        userId        : ObjectID(req.userId),
        pseudo        : req.userPseudo,
        latitude      : req.body.latitude,
        longitude     : req.body.longitude,
        arrivalTime   : arrivalTime,
        departureTime : departureTime,
        message       : req.body.msg,
      }
      //we check if the position conflicts with previous positions
      database.collection('positions').findOne({$or: [
        {userId : ObjectID(req.userId), arrivalTime: { $lte : coordinates.departureTime}, departureTime: {$gte : coordinates.departureTime}  },
        {userId : ObjectID(req.userId), departureTime: { $gt: coordinates.arrivalTime, $lte: coordinates.departureTime}}
      ]})
        .then(pos => {
          if (pos){
            res.status(409).json("Conflict with an already scheduled position")
          } else {
            database.collection('positions').insertOne(coordinates)
              .then(r => res.sendStatus(201))
              .catch(err => {console.log(err), res.sendStatus(500)})
          }
        })
        .catch(err => {console.log(err), res.sendStatus(500)})
    })

    // return past positions of the user
    app.get('/pos/past',verifyToken, (req,res) => {
      database.collection('positions').find(
         { userId : ObjectID(req.userId),  departureTime : {$lte : new Date() } },
          { userId: 0,  userPseudo: 0 }
      ).sort( { arrivalTime: -1, departureTime: -1 } ).toArray()
        .then(positions => res.json(positions))
        .catch(err => {console.log(err), res.sendStatus(500)})
    })

    // return the scheduled position that haven't yet been activated
    app.get('/pos/future',verifyToken, (req,res) => {
      database.collection('positions').find(
         { userId :  ObjectID(req.userId),  arrivalTime : {$gte : new Date() } },
         { userId: 0,  userPseudo: 0 }
      ).sort( { arrivalTime: 1, departureTime: 1 } ).toArray()
        .then(positions => res.json(positions))
        .catch(err => {console.log(err), res.sendStatus(500)})
    })

    // delete a position given an ID
    app.delete('/pos/delete/:id',verifyToken,(req,res) => {
      database.collection('positions').deleteOne({_id : ObjectID(req.params.id)})
        .then(deleted  => res.sendStatus(200))
    })

}

exports.implement = implement;
