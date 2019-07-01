// models za MongoDB collections - User collection model - novi, sa Schema() da možemo koristiti middlewarei za hash password-a
// klasično spremanje slika u folder /images, ne šprema u avatar: {type: buffer}
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// Mongoose schema - opisuje tipove podataka i validaciju za pojedinu kolekciju (tabelu)
// schema omogućava korištenje middleware-a
const userSchema = new mongoose.Schema({
    name: {
        type: String,  // js constructor koristimo za tip, treba
        required: true,  // ova validacija je opciona, da li je polje obavezno
        trim: true  // sanitizacija (opciono), truma space na početku i kraju unosa
    },
    email: {
        type: String,
        unique: true,  // provjerava da li je email za registraciju jedinstven ili već postoji u bazi
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
    },
    tokens: [{  // tu sprema generirane tokene da se na PC može odlogirati a na laptopu je i dalje ulogiran
        token: {
            type: String,
            required: true
        }
    }]  
}, {  // drugi arg Scheme - options kao npr timestamp kada je user kreiran ili updatan
    timestamps: true   // default je false
});


// funkcija za filtriranje user podataka poslanih na front-end (bez passworda i svih tokena).problem je da je treba pozivati u routama
/* userSchema.methods.getPublicProfile = function() {
    const user = this;  // svi user podaci
    const userObject = user.toObject(); // pretvaramo user podatke u object da možemo micati iteme

    delete userObject.password; // mičemo password i tokene iz objecta koji šaljeno na front end
    delete userObject.tokens;

    return userObject;
} */


// virtual property je relationship između dvije kolekcije (nisu aktualni podaci), tako da možemo koristiti taskove ovog usera bez da ih kopiramo u array usera kao tokene
// 'tasks' je ime virtualnog propertyja. To nije spremljeno u bazu
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


//varijanta sa toJSON ne treba u reoutama pozivati funkciju gore getPublicProfile
//  userSchema.methods automatski se uključuje u API-ju, a toJSON vraća JSON object koji se šalje u front kao JSON kao i ostatak podataka u res.send()
userSchema.methods.toJSON = function() {
    const user = this;  // svi user podaci
    const userObject = user.toObject(); // pretvaramo user podatke u object da možemo micati iteme

    delete userObject.password; // mičemo password i tokene iz objecta koji šaljeno na front end
    delete userObject.tokens;

    return userObject;
}

// naša funckija za generiranje tokena za usera kod logina. Koristi .methods, mora biti standardna funkcija radi this
// .methods metode su accessible na instancama kao što je pronađeni user
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    // generiranje tokena, prvo je object koji identificira usera tj id. treba ga konvertirati u string jer to traži jwt
    const token = jwt.sign({_id: user._id.toString()}, 'thisismynewcourse');

    // sejvanje tokena u bazu (npr jedan ili više različitih uređaja)
    user.tokens = user.tokens.concat({token});  // ako ih je više sa nekoliko uređaja, dodaj jedan za drugim
    await user.save();  // pričekaj da sejva u userov profil i returnaj token
    return token;
}


// naša middleware funckija, koristiti .statics. Static methods su accessible na modelima kao što je User
userSchema.statics.findByCredentials = async (email, password) => {
    // find by email
    const user = await User.findOne({email: email});

    if (!user) {  // ako nema emaila usera, šalji error
        throw new Error('Unable to login');  // new Error odmah prekida izvršenje funkcije, kao return
    }
    // ako je našao email, provjeri da li se podudara password
    // prvi je orig password poslan sa front-enda, drugi je hashirani pass iz baze
    const isMatch = await bcrypt.compare(password, user.password);  

    if (!isMatch) {  // ako ne odgovara password..
        throw new Error('Unable to login');  // error ne treba biti prespecifičan da hakerima ne oda previše detalja
    }

    return user;  // ako je sva provjera prošla
}


// middleware ima dvije methode, pre i post, pre radi nešto prije radnje tj sejvanja a post poslije.
// prvi arg je ime eventa a drugi je funkcija šta treba raditi, ne smije biti arrow funkcija jer ona ne bind-a this
// hash te password before saving
userSchema.pre('save', async function(next) {
    const user = this; // this daje pristup dokumentu koji sejvamo, radi preglednosti ga preimenujemo u user
    //console.log('just before saving');  // za isprobavati kada se ovaj middleware triga

    // prvo provjeravamo da li je password već hashan (za update), ne želimo ga hashati dvaput, samo ako je modificiran od strane usera
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();  // next nastavlja dalje radnju započetu prije tog middleware-a (save novog usera)
});


// Delete user tasks middleware - when user profile is removed from the base, i.e. before it
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});  // prije brisanja profila obriši sve njegove taskove

    next();
});


// prvi arg je ime modela, drugi arg je definicija modela u schemi
// Mongoose omogućava middleware, da se izvrši neka funkcija prije ili poslije sejvanja ili nečeg sličnog (dobro za hashed password)
const User = mongoose.model('User', userSchema);

module.exports = User;