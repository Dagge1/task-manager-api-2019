// Glavni back-end fajl - novi način sa Async Await. 
// Dobro je koristiti async await ako je promises chaining gdje jedan promise ovisi o rezultatu drugog. Ali kod običnih situacija nije neka prednost.
// za status API HTTP request kodove idi na httpstatuses.com
const express = require('express');
require('./db/mongoose');  // tamo je konekcija na MongoDB bazu
const app = express();
const port = process.env.PORT;  // ne treba PORT || 3000 jer je već određen PORT za development u config/dev.env
app.use(express.json());  // automatski parsa sa front-enda primljene JSON podatke i pretvara ih u js object


const userRouter = require('./routers/user'); // route za users API
const taskRouter = require('./routers/task');
app.use(userRouter);  // registriranje routera user.js za korištenje u index.js
app.use(taskRouter);


app.listen(port, () => {
    console.log('Server activated on the port ' + port);
});

const Task = require('./models/task');

