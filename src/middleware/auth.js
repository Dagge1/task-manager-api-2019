// middleware za autentifikaciju usera pomoću poslanog tokena iz browsera
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const auth = async (req, res, next) => {
    try {
        // Authorization e key a Bearer je value, token poslan iz browswera
        const token = req.header('Authorization').replace('Bearer ', '');  // replace briše riječ Bearer i razmak iz tokena
        //const decoded = jwt.verify(token, 'thisismynewcourse');  // prvo provjeri valjanost tokena, stari način
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // prvo provjeri valjanost tokena, novi sa process.env varijablom
        // provjeri da li id usera u bazi odgovara id-u usera u od browsera poslanom tokenu, zatim provjerava da li je token još u arrayu tokens usera (da nije odlogiran)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});  

        if (!user) {  // ako autorizacija tokena nije prošla..
            throw new Error(); // automatski baca u catch error, ne treba poruka
        }
        req.token = token;  // da uzme token baš sa ovog uređaja, ako se odlogira da ostane ulogiran na drugim uređajima
        req.user = user; // ako je prošla, zakači an req.object novi user object da ne mora iz route opet tražiti..
        next();  // i pusti usera kroz tu routu
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'});
    }
}

module.exports = auth;  // exportiramo middleware da se može koristiti u main fajlu express.js