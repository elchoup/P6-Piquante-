const multer = require('multer');

const MIME_TYPES = {
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpg',
    'image/png' : 'png'
};

//Logique d'enregistrement des fichiers
const storage = multer.diskStorage({
    //On indique à multer d'enregistrer les fichiers dans le dossier images
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    //Filename utilise le nom d'origine, elle remplace les espaces par des underscores et ajoute un timestamp 'date.now()' comme nom de fichier
    //Elle utilise la constante dictionnaire de mimetype pour resoudre l'extension de fichier approprié
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});


//On exporte l'élément multer entiérement configuré, on lui passe la constante storage et on lui indique qu'on ne s'occupera que des fichiers images 
module.exports = multer({ storage: storage}).single('image');