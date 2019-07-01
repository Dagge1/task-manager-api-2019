// models za MongoDB collections - Task collection model
const mongoose = require('mongoose');

// task Schema sa definicijama polja
const taskSchema = new mongoose.Schema({  // staviti jedninu, MongoDB dodati će množinu kao ime
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {  // id usera koji je kreirao task
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // relationship između taska i modela 'User' koji povezuje dvije Collections sa ref:, na taj način može se koristiti cijeli User profil
    }

}, {  // drugi arg je object sa opcijama kao timestamp
    timestamps: true  // timestamp kada je kreiran ili updatan task
});

// Mongoose model za Tasks collection (tabelu)
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;