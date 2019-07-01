// models za MongoDB collections - User collection model - bez Schema() koju koristimo za mongoose middleware (hash password)
const mongoose = require('mongoose');
const validator = require('validator');


// Mongoose model - model opisuje tipove podataka i validaciju za pojedinu kolekciju (tabelu)
// prvi arg je ime modela, drugi arg je definicija modela
// Mongoose omogućava middleware, da se izvrši neka funkcija prije ili poslije sejvanja ili nečeg sličnog (dobro za hashed password)
const User = mongoose.model('User', {
    name: {
        type: String,  // js constructor koristimo za tip, treba
        required: true,  // validacija je opciona
        trim: true  // sanitizacija (opciono), truma space na početku i kraju unosa
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,  // sanitizacija, stavlja sve lowercase
        validate(value) {  // koristimo validator modul za email
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }    
    },
    age: {
        type: Number,
        default: 0,  // sanitizacija, default value
        validate(value) {  // opciono, custom validator, za razliku od ugrađenog može se provjeriti tj validirati sve
            if (value < 0) {
                throw new Error('Age must me a positive number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain word "password"')
            }
        }
    }
});

module.exports = User;