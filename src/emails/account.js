// fajl za slanje emaila putem Sendgrid npm modula
const sgMail = require('@sendgrid/mail');
//const sendgridAPIKey = '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';  // API key
//sgMail.setApiKey(sendgridAPIKey);  // dodaj APi key, stari način

sgMail.setApiKey(process.env.SENDGRID_API_KEY);  // dodaj APi key, novi način sa process.env

// funkcija koja koristi sgMail.send() za slanje emaila, unutar objecta su svi parametri
const sendWelcomeEmail = (email, name) => {  // treba nam email i ime novog usera
    sgMail.send({
        to: email,
        from: 'davorincuvalo@gmail.com',  // ovdje ide naš email server
        subject: 'Welcome to the app!',
        //text: `Welcome to the system ${name}. This is message for confirmation of the email account`
        html: `<h3>Welcome to the system ${name}.</h3>`  // ovdje dolauzi html kod koji želimo poslati
    });
}

module.exports = {sendWelcomeEmail}