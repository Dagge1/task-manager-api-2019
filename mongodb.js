// CRUD operacije sa MongoDB bazom i mongodb native driverom (npm mongodb modul)
// Za razliku od MySWL MongoDB svaki put generira unique ID on the fly a ne na serveru. Zato je moguće raditi sharding distribuirane servere jer ne moraju provjeravati da li taj ID već postoji
// ID je moguće kreirati unaprijed

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;  // za generiranje document (record) ID-a unaprijed

//const id = new ObjectID();  // generiramo unaprijed novi ID
//console.log(id);
//console.log(id.getTimestamp());  // timestamp vremena reiranja ID-a

const connectionURL = 'mongodb://127.0.0.1:27017';  // adresa baze, lokalno
const databaseName = 'task-manager-2019';  // ime MongoDB baze

// konekcija na MongoDB bazu
MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {  // urlparser dio po novom mora biti dodan
    if (error) {
        return console.log('Unable to connect to dataabase');
    }
    // kreiramo bazu u MongoDB
    const db = client.db(databaseName);

    // **** CREATE

    /* db.collection('users').insertOne({  // kreiramo collection (tabelu) 'users' on the fly i insertamo unos (async funkcija)
        name: 'Andrew',  // možemo koristiti unaprijed kreirani id sa _id: id
        age: 27
    }, (error, result) => {
        if (error) {
            return console.log('Unable to insert document');
        }
        console.log(result.ops);  // ops je array sa informacijama o insertu
    }); */
    
    /* db.collection('users').insertMany([  
        {
            name: 'Johan',
            age: 45
        },
        {
            name: 'Joachim',
            age: 57
        }    
    ], (error, result) => {
        if (error) {
            return console.log('Unable to insert document');
        }
        console.log(result.ops);  
    });   */


    // **** READ
    db.collection('users').findOne({name: 'Jen'}, (error, user) => {
        if (error) {
            return console.log('Unable to fetch');
        }
        console.log(user);
    });
    
    // find by _id
    db.collection('users').findOne({_id: ObjectID("5d0e05b78a4cad11806dbc3b")}, (error, user) => {  // umjesto " može i '
        if (error) {
            return console.log('Unable to fetch');
        }
        console.log(user);
    });
    
    // find many that fulfill criteria, ne uzima callback nego cursor (pointer na podatke, npr count, limit, toArray() itd)
    db.collection('users').find({age: 25}).toArray((error, user) => {  // toArray pretvara rezultat u array, ima callback
        console.log(user);
    });
    
    // count documents (records)
    db.collection('users').find({age: 25}).count((error, user) => {  // toArray pretvara rezultat u array, ima callback
        console.log(user);
    });

    // *** UPDATE - with Promises umjesto callback
    db.collection('users').updateOne({  // kod update je prvi arg search kriterij itema
        _id: new ObjectID("5d0e05b78a4cad11806dbc3b")
    }, {
        $set: {  // drugi arg je set - operator za updatanje
            name: 'Mich'
        },
        $inc: {  // operator za povećati broj
            age: 1
        }
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(result)
    });


    // ** DELETE
    db.collection('users').deleteMany({
        age: 26
    }).then((result) => {  // Promise nije obavezno, obavijest ako je uspješno ili ako nije
        console.log(result);
    }).catch((error) => {
        console.log(error);
    })

});

