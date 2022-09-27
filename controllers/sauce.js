const Sauce = require('../models/Sauce');
const fs = require('fs');

// Création d'une sauce
exports.createSauce = (req, res, next) => {
    const userId = res.locals.userId;
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        //Décomposer l'objet à la main. Eviter le spread operator
        userId: userId,
        name: sauceObject.name,
        manufacturer: sauceObject.manufacturer,
        description: sauceObject.description,
        mainPepper: sauceObject.mainPepper,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        heat: sauceObject.heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    //On trouve la sauce à supprimer
    Sauce.findOne({ _id: req.params.id })
    //On supprime la sauce dans le dossier image
            .then(sauce => {
                if (sauce.userId != res.locals.userId){
                    return res.status(401).json({message: 'pas votre sauce'})
                }else {
                    const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    //On supprimer la sauce
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet suprrimé !' }))
                    .catch(error => res.status(400).json({ error }))}
                )
                }
                
                })
};


// Affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};


// Affichage d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
};

exports.modifySauce = (req, res, next) => {

    if (req.file) {
        // si l'image est modifiée, il faut supprimer l'ancienne image dans le dossier /image
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if(!sauce){
                    return res.status(400).json({message: 'sauce inexistante'})
                }
                if (sauce.userId != res.locals.userId){
                    return res.status(401).json({message: 'pas votre sauce'})
                }else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // une fois que l'ancienne image est supprimée dans le dossier /image, on peut mettre à jour le reste
                    const sauceObject = JSON.parse(req.body.sauce);
                    const modifiedSauce = ({
                        userId: res.locals.userId,
                        name: sauceObject.name,
                        manufacturer: sauceObject.manufacturer,
                        description: sauceObject.description,
                        mainPepper: sauceObject.mainPepper,
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                        heat: sauceObject.heat,
                        likes: sauce.likes,
                        dislikes: sauce.dislikes,
                        usersLiked: sauce.usersLiked,
                        usersDisliked: sauce.usersDisliked
                    })
                    Sauce.updateOne({ _id: req.params.id }, { ...modifiedSauce, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                    .catch(error => res.status(400).json({ error }));
                })
            }
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(!sauce){
                return res.status(400).json({message: 'sauce inexistante'})
            }
            if (sauce.userId != res.locals.userId){
                return res.status(401).json({message: 'pas votre sauce'})
            }else {
        const modifiedSauce = ({
            name:req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat
        })

       
    Sauce.updateOne({ _id: req.params.id }, { ...modifiedSauce, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
    .catch(error => res.status(400).json({ error }));
            }  
            
    })
    .catch(error => res.status(500).json({ error }));    }
};


exports.likeSauce = (req, res, next) => {
    const userId = res.locals.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            // nouvelles valeurs à modifier
            const newValues = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            
            const indexLike = newValues.usersLiked.indexOf(userId);
            if (indexLike>-1){
                newValues.usersLiked.splice(indexLike, 1);
            }
            
            const indexDislike = newValues.usersDisliked.indexOf(userId);
            if (indexDislike>-1){
                newValues.usersDisliked.splice(indexDislike, 1);
            }
            
            // Différents cas:
            switch (like) {
                case 1:  // Si on like la sauce on envoie l'userId dans le tableau
                        newValues.usersLiked.push(userId);
                    break;
                case -1:  // Si on Dislike la sauce on envoie l'userId dans le tableau
                        newValues.usersDisliked.push(userId);  
                    break;
                case 0:  // Cas annulation : si l'userId est deja présent dans le tableau like on le récupére son index grâce à l'userID et on l'enlève du tableau
                    break;
            };
            // Calcul du nombre de likes / dislikes
            newValues.likes = newValues.usersLiked.length;
            newValues.dislikes = newValues.usersDisliked.length;
            
            // On modifie les valeurs
            Sauce.updateOne({ _id: sauceId }, newValues )
                .then(() => res.status(200).json({ message: 'Sauce notée !' }))
                .catch(error => res.status(400).json({ error }))  
        })
        .catch(error => res.status(500).json({ error }));
    }

