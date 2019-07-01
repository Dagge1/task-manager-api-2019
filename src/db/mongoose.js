// Creating APi with mongoose and MongoDB
// Za složeniju validaciju unosa tipa email ili credit card koristi npm modul 'validator'
const mongoose = require('mongoose');

// konektaj na MongoDB bazu
//mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api-2019', {  // stari način, bez env varijable
mongoose.connect(process.env.MONGODB_URL, {  // novi način sa process.env varijablom
    useUrlParser: true, // opcije, ovo mora biti po novom
    useCreateIndex: true,  // opcija, da brže pretražuje
    useFindAndModify: false  // da ne pokazuje depreciation warnings
});



// Kreiramo instancu tog modela da kreiramo stvarni unos u bazu
/* const me = new User({
    name: 'Mitch',
    email: 'mitc@gmail.com',
    password: '   dubrovnik  ',
    age: 44
}); */

// saving me into database. Koristi promise tako da čeka da save bude završen prije povratne informacije
/* me.save().then(() => {
    console.log(me);  // obavijesti tek kada je upisano u bazu
}).catch((error) => {
    console.log(error)
}); */




/* const task = new Task({
    description: 'Završiti js tečaj',
    completed: false
});

task.save().then(() => {
    console.log(task);
}).catch((error) => {
    console.log(error);
}); */