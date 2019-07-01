// roter za tasks API endpointe
const express = require('express');
const Task = require('../models/task');  // tamo je model za collection Task
const auth = require('../middleware/auth');  // autorizacija API endpointa
const router = new express.Router();

// create new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,  // iskopirati će sve propertyje objecta task.body
        owner: req.user._id  // ObjectId 'vlasnika' profila koji je kreirao task
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e){
        res.status(400).send(e);
    }

    /* task.save().then((result) => {
        res.status(201). send(task);  // status 200 šalje po defaultu, druge treba posebno poslati, 201 je 'created'
    }).catch((e) => {
        res.status(400).send(e);
    }); */
    
});

// get all tasks & filtering tasks?completed=true
// use limit and skip for pagination... GET /tasks?limit=10&skip=10  .. daje rezultete od 11 do 20
// sorting GET /tasks?sortBy=createdAt:desc  (ascending prema vremenu upisa, : služi za odvajanje)
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    if (req.query.completed) {
        // objectu match dodjeljujemo item completed, ali browser vraća string 'true' a ne true, zato treba konverzija
        match.completed = req.query.completed === 'true';  // dodjeljujemo mu boolean rezultet true a ne string 'true', ako nije 'true' ili bilo što druge, vraća boolean false
    }

    const sort = {};  // za sorting
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':'); // pretvori string u array, odvoji sa :
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;  // ternatry operator, ako je iza : riječ desc stavi -1, inače 1
    }

    try {  
        //const tasks = await Task.find({owner: req.user._id});
        //await req.user.populate('tasks').execPopulate();  // alternativni način fetchanja taskova

        await req.user.populate({
            path: 'tasks',
            match,   // da nije gore definiran object match ovdje bi bilo match: {completed: true}
            options: {  // koristimo za pagination i sorting
                limit: parseInt(req.query.limit),  // limitiraj broj rezultata na strani. parseInt pretvara string iz queryja u number. Čak i broj kao 10 u queryju je string
                skip: parseInt(req.query.skip),
                sort   // isprobaj sa /tasks?sortBy=createdAt:desc ili asc
                /* sort: {
                    createdAt: -1  // 1 je ascendnig, -1 je desecending. Može i completed: -1 .. sorta kompletne taskove od najnovijeg
                } */
            }
        }).execPopulate()
 
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
    
    /* Task.find({}).then((result) => {
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    }); */
});


router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id, owner: req.user._id});  // nađi task i nađi usera koji ga je unio

        if (!task) {  // ovdje provjeravamo da li task postoji
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }

    /* Task.findById(_id).then((result) => {
        if (!result) {
            return res.status(404).send();  // return zato da izađe iz petlje ako nema rezultata
        }
        res.send(result);
    }).catch((e) => {
        res.status(500).send();
    }); */
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        
        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send();
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        
        if (!task) {
            return res.status(404).send()
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;