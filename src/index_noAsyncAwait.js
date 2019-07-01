// glavni back-end fajl - klasični način, bez Async Await
// za status API HTTP request kodove idi na httpstatuses.com
const express = require('express');
const app = express();
require('./db/mongoose');  // tamo je konekcija na MongoDB bazu
const User = require('./models/user');  // tamo je model za collection User
const Task = require('./models/task');  // model za collection Task

const port = process.env.PORT || 3000;
app.use(express.json());  // automatski parsa sa front enda primljene JSON podatke i pretvara ih u js object

app.post('/users', (req, res) => {
    const user = new User(req.body);

    user.save().then((result) => {  // then promise nije uvjet, samo za info
        res.send(result); // može i user, iste podatke vraća
    }).catch((e) => {
        res.status(400).send(e); // 400 su client errori (npr prekratak pass), moglo je res.send() posebno ali mora biti iza status linije
    });
});

// find all users
app.get('/users', (req, res) => {
    User.find().then((result) => {  // method na User modelu
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    });   
    
});

// find one user
app.get('/users/:id', (req, res) => {
    const _id = req.params.id;  // poslani id sa front enda, mongoose sam konvertira string id u js object, sa ObjectID()
    User.findById(_id).then((user) => {
        if (!user) {  // ako nije našao usera to nije greška, pošalji status 404 not found
            return res.status(404).send();
        }
    
        res.send(user);  // ako je sve ok pošalji usera na front
    }).catch((e) => {
        res.status(500).send();
    });
});


app.post('/tasks', (req, res) => {
    const task = new Task(req.body);

    task.save().then((result) => {
        res.status(201). send(task);  // status 200 šalje po defaultu, druge treba posebno poslati, 201 je 'created'
    }).catch((e) => {
        res.status(400).send(e);
    });
    
});


app.get('/tasks', (req, res) => {
    Task.find({}).then((result) => {
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    });
});

app.get('/tasks/:id', (req, res) => {
    const _id = req.params.id;
    Task.findById(_id).then((result) => {
        if (!result) {
            return res.status(404).send();  // return zato da izađe iz petlje ako nema rezultata
        }
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    });
});


app.listen(port, () => {
    console.log('Server activated on the port ' + port);
});
