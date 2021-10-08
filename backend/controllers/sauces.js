const Sauce = require('../models/sauces'); // Importe le modèle sauce
const fs    = require('fs'); // Importe le package file System

// Enregistrement d'une nouvelle sauce

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // Transforme le JSON en objet JS
    const sauce = new Sauce({ // Déclaration d'un nouvel objet sauce
        ...sauceObject, // Copie les éléments de req.body
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de l'image uploadée
    });
    sauce.save() // Enregistre la nouvelle sauce en BDD
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

// Afficher toutes les sauces

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(sauces => res.status(200).json(sauces)) // Récupère toutes les sauces
        .catch(error => res.status(400).json({ error }));
};

// Afficher une sauce

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Récupère la sauce de l'id correspondant
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Modifier une sauce

exports.modifySauce = (req, res, next) => {
    if (req.file) {
        // Si l'image est modifiée
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { // On supprime l'image existante du serveur
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    // On met à jour les infos et l'image
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        // Si l'image n'est pas modifiée
        const sauceObject = { ...req.body };
        // On met à jour les infos
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(400).json({ error }));
    }
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]; //On récupère le nom de l'image
            fs.unlink(`images/${filename}`, () => { // On supprime l'image du serveur
                Sauce.deleteOne({ _id: req.params.id }) // On supprime la sauce de la BDD
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch((error) => res.status(400).json({ error: error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Liker / disliker une sauce
exports.reactToSauce = (req, res, next) => {
    if (req.body.like === 1) { // Un utilisateur like une sauce
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }) // +1 like et push de l'id user dans l'array usersLiked
            .then((sauce) => res.status(200).json({ message: 'Un like de plus !' }))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) { // Un utilisateur dislike une sauce
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }) // +1 dislike et push de l'id user dans l'array usersLiked
            .then((sauce) => res.status(200).json({ message: 'Un dislike de plus !' }))
            .catch(error => res.status(400).json({ error }));
    } else { // L'utilisateur retire son like ou son dislike
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (sauce.usersLiked.includes(req.body.userId)) { // Si l'array userLiked contient l'id de l'utilisateur
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }) // On retire un like et l'id de l'user de l'array userLiked
                        .then((sauce) => { res.status(200).json({ message: 'Un like de moins !' }) })
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } }) // On retire un dislike et l'id de l'user de l'array userDisliked
                        .then((sauce) => { res.status(200).json({ message: 'Un dislike de moins !' }) })
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
};