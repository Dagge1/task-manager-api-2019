// upload slika sa multer modulom (ne radi bez express i uključenim serverom, samo kao primjer koda)
const multer = require('multer');  // za upload images
// konfiguracija, može ih biti više za više različitih API endpointova:
const upload = multer({
    dest: 'images'  // destinacijski folder za upload slika
});

// routa za upload slika, drugi arg je middleware za upload single image-a. 
// Upload je ime koje mora biti u front endu, body> form-data> - Key: upload (odaberi tip text/file: file)
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
});