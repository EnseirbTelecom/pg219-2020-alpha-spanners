//file that will be executed juste after installation
//it will make the indexes of mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';

(async() => {
// On ouvre une connexion à notre base de données
    database = await MongoClient.connect(url)
        .then(database => database.db("friendFinder"))
        .catch(err => { throw err });

    const p1 = database.collection('users'    ).createIndex( { pseudo : 1 },                         { unique: true } );
    const p2 = database.collection('users'    ).createIndex( { mail : 1 },                           { unique: true } );
    const p3 = database.collection('positions').createIndex( { userId : 1 } );                  
    const p4 = database.collection('positions').createIndex( { arrivalTime : -1, departureTime:-1 } );
    const p5 = database.collection('friends'  ).createIndex( { senderId : 1, receiverId:1 },         { unique: true } );
    const p6 = database.collection('friends'  ).createIndex( { lastModified : -1 } );
    Promise.all([p1, p2, p3, p4, p5,p6])
        .then(res => console.log("indexes created"))
        .catch( err => {throw err} )
        .finally(ex => process.exit(0));
})();

