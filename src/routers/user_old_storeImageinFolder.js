// roter za users API endpointe
// stari način - stora image u folder /images
const express = require('express');
const User = require('../models/user');  // tamo je model za collection User
const auth = require('../middleware/auth');  // middleware za provjeru tokena poslanog iz browswera, samo na nekim routama
const multer = require('multer');  // za image upload
const router = new express.Router();

// konfiguracija multera za image upload APi
const upload = multer({  
    // ako je navedena dest: tada u APi endpointu ne možemo pristupiti fajlu da ga snimimo u MongoDB bazu direktno
    dest: 'images/avatar',  // treba ručno dodati file extension ako nije definirano da dodaje
    limits: {
        fileSize: 1000000   // limit veličine 1 mil byte je 1 MB
    },
    fileFilter(req, file, cb) {  // koje tipove fajlova dozvoljavamo, file je fajl
        // if (!file.originalname.endsWith('.pdf')) {  // ako fajl ne završava sa .pdf izađi iz funkcije
        if (!file.originalname.match(/\.(jpg|jpeg|png|)$/)) {  // ako fajl ne završava sa .doc ili .docx, regex verzija sa match()
            return cb(new Error('Please upload an image'));
        }
        cb(undefined, true);  // ako file je pdf prvi arg error vrati undefined, drugi arg true        

    }
});

// upload image for avatar, upload.single je middleware za single image, 'avatar' je Key u front-endu (postman Body>form-data>Key: avatar (odaberi: file))
router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
    res.send();
});


// create new user
router.post('/users', async (req, res) => { // prvo pretvorimo funkciju u async da returna Promise
    const user = new User(req.body);

    // sa async await - hendlanje individualnih errora pojedinih promises sa try catch
    try {
        await user.save();
        // nakon sejvanja usera generiraj njegov token i ubaci u bazu
        const token = await user.generateAuthToken();  // naša funkcija za generiranej tokena koji ćemo poslati useru u browser
        res.status(201).send({user, token});  // izvršava se tek ako je prošao gornji promise
    } catch (e) {
        res.status(400).send(e);
    }

    /* user.save().then((result) => {  // then promise nije uvjet, samo za info
        res.send(result); // može i user, iste podatke vraća
    }).catch((e) => {
        res.status(400).send(e); // 400 su client errori (npr prekratak pass), moglo je res.send() posebno ali mora biti iza status linije
    }); */
});

// user login
router.post('/users/login', async (req, res) => {
    try {  // findByCredentials je naša funkcija za provjeru emaila i passworda
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();  // naša funkcija za generiranej tokena koji ćemo poslati useru u browser

        // ako je prošao provjeru emaila i passworda pošalji podatke usera i generirani token na front-end
        //res.send({user: user.getPublicProfile(), token}); // getPublicProfile() filtrira user podatke i na front end šalje bez tokena i passworda 
        
        // pošto je u schemi toJSON ne treba u APi endpointima dodatna funkcija getPublicProfile() za user:, dovoljno je standardno
        res.send({user, token}); // getPublicProfile() filtrira user podatke i na front end šalje bez tokena i passworda 
    } catch (e) {  // ako nije prošla provjera pošalji error 400 (sa 4 su front-end errori a sa 5 su back.end)
        res.status(400).send();
    }
});

// log out user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {  // pronađi iz token arraya userov token samo za ovaj uređaj
            return token.token !== req.token; // zadržio u arrayu tokene koji nisu identični trenutnom koji koristimo, onaj koji je briši tj odlogiraj
        });
        await req.user.save(); // sejva usera sa novim tokenima (bez izbrisanog sessiona/tokena)
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//log out all users (wipe out all tokens)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];  // mora biti empty array a ne null jer je u Schemi array objekata
        await req.user.save();
        res.send();
    } catch (e) {
        res.ststus(500).send();
    }
});

// find all users - koristi middleware auth za provjeru tokena poslanog iz browsera. Ako middleware triga next() ova routa će se izvršiti
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user); // pošalji na front object sa user profilom koji smo sami zakačili na req.user object u auth.js

    /* try {  // ovo više ne treba jer daje sve usere a mi trebamos amo ejdnog koji je prošao autentifikaciju
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    } */

    // sa async await
    /* User.find().then((result) => {  // method na User modelu
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    });    */
});


// find one user - ne treba više ejr imamo users/me
/* router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;  // poslani id sa front enda, mongoose sam konvertira string id u js object, sa ObjectID()
    
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(500).send();
    } */
    
    /* User.findById(_id).then((user) => {
        if (!user) {  // ako nije našao usera to nije greška, pošalji status 404 not found
            return res.status(404).send();
        }
        res.send(user);  // ako je sve ok pošalji usera na front
    }).catch((e) => {
        res.status(500).send();
    }); */
/* }); */


// update user, treba auth
router.patch('/users/me', auth, async (req, res) => {
    // da provjeri da li je validan naziv polja u bazi koje updata, nije potrebno
    const updates = Object.keys(req.body);  // koji su nazivi key u key-value poslanih podataka
    const allowedUpdates = ['name', 'email', 'password', 'age'];  // dozvoljeni key nazivi polja za update u bazi
    const isValidOperation = updates.every((update) => {  // provjerava za svaki unos u arrayu
        return allowedUpdates.includes(update);  // vratiti će true samo ako su sve posalne rubrike za update postojeće        
    });

    if (!isValidOperation) {  // ako želi updatati ime polja koje ne postojiu bazi
        return res.status(400).send({error: 'invalid updates!'}); 
    }  // ovo gore nije nužno, to ej dodatna validacija


    try {
        
        // stara verzija koja radi ako nema middleware-a - parametar new znači da vraća nupdatanog usera a ne onog prije toga, req.body su podaci sa fronta za update, runValidators provjerava validatore za poslani input
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});  // tri argumenta 
        
        // pošto findByIdAndUpdate zaobilazi mongoose i direktno radi sa bazom, ne možemo koristiti middleware (za password hash), zato treba modificirati
        // novi kod od pet redova
        //const user = await User.findById(req.params.id); // ovo je pristup useru i ujedno instanci user modela,možemo pristupati pojedinim poljima npr user.name
        
        const user = req.user;
        updates.forEach((update) => { // updataj svaki poslani element (name, email, password) radi middlewarea prije sejvanja
            user[update] = req.body[update];
        });
        user.save();
        // end of updating poslane podatke with middleware

        res.send(user); // šalje natrag updatanog usera
    } catch (e){
        res.status(400).send(e);  // ako nije prošlo validaciju
    }
});


// deleting user - treba authtentifikacija
router.delete('/users/me', auth, async (req, res) => {
    try {
        /* const user = await User.findByIdAndDelete(req.user._id);  // da nema auth middlewarea ne bi imali req.user object
        if (!user) {
            return res.status(404).send();
        } */

        await req.user.remove();  // remove() je method na mongoose documentu, briše usera. Asinhrona je, zato await
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;

