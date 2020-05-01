/* File that is in charge of implementing the routes to the app*/

const JWT_KEY = 'wGuyfJdbzBMyBwpXMjEXnKQQmKlXsiItxzLVIfC5qE97V6l6S0LzT9bzixv'
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')


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
        console.log(newValue)
    }) 

    // route that returns the friendlist
    app.get('/friends',(req,res) => {
        //FIXME no, you don't send a whole database to the client
        database.collection('friends').find().toArray()
            .then(friends => res.json(friends))
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

    app.get("/users/:id", (req, res) => {
        database.collection('users').findOne({ _id: ObjectID(req.params.id) })
        .then(item => res.json(item))
        .catch(err => console.log("err" + err))
    })

    //route that returns a list of users
    app.get('/users', (req,res) =>{
        //FIXME no, you don't send a whole database to the client, at least add a limit on the number of rows
        database.collection('users').find().toArray()
        .then(users => res.json(users))
    })

    app.post('/login',(req,res) => {
        let infoLogin = {
        mail : req.body.mail,
        password : req.body.password,
        }
        //console.log('requete recu')
        //console.log(infoLogin)

        if(infoLogin.mailUser === '' || infoLogin.passwordUser === ''){
        return res.status(400).json({error:"You must fill every field"});
        }

        //todo verify mail regex & password length

        database.collection('users').findOne({mail:req.body.mail})
            .then(function(usr){
                if(usr){
                //FIXME le chiffrement sert à ce que le code ne passe pas en clair sur le réseau, c'est donc au code CLIENT de le faire
                bcrypt.compare(infoLogin.password,usr.password,function(errCrypt,resCrypt){
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
                        return res.status(200).json({token : token, id : usr._id, surname:usr.surname, name:usr.name})
                    }
                    else{
                        res.status(400).json({error:"Incorrect password"})
                    }
                })
                }
                else{
                    return res.status(400).json({error:"You should sign up before login"})
                }
            })
    })

    app.post('/register',(req,res) => {
        let user = {
            mail         : req.body.mail,
            password     : req.body.password,
            surname      : req.body.surname,
            name         : req.body.name,
            pseudo       : req.body.pseudo,
            birthday     : req.body.birthday
        }

        if(user.mail === '' || user.password === '' || user.surname === '' || user.name === '' || user.pseudo === '' || user.birthday === ''){
            //console.log(user);
            return res.status(400).json({error:"You must fill every field"});
        }

        //verify pseudo length , mail regex , password etc

        database.collection('users').find({mail:req.body.mail}).count().then(num => {
            if (num !== 0){
            //console.log("mail exists")
                return res.status(409).json({error:"Mail already exists !"});
            }
            else{
                //FIXME le chiffrement sert à ce que le code ne passe pas en clair sur le réseau, c'est donc au code CLIENT de le faire
                bcrypt.hash(user.password,5,function(err,cryptedPassword){
                    user.password = cryptedPassword
                    database.collection('users').insertOne(user)
                        .then(command => res.status(201).json(user)) //NOTE do we really need to send back the data ?
                })
            }
        });
    })
}


exports.implement = implement;