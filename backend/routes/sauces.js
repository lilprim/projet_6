const express   = require('express');
const router    = express.Router();

const auth      = require('../middleware/auth'); // Middleware d'authentification
const multer    = require('../middleware/multer-config'); // Middleware d'upload de fichier

const sauceCtrl = require('../controllers/sauces');

router.get('/', auth, sauceCtrl.getAllSauces); // Afficher toutes les sauces
router.post('/', auth, multer, sauceCtrl.createSauce); //Création d'une nouvelle sauce
router.get('/:id', auth, sauceCtrl.getOneSauce); // Afficher les détails d'une sauce
router.put('/:id', auth, multer, sauceCtrl.modifySauce); // Mise à jour d'une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce); // Supprimer une sauce
router.post('/:id/like', auth, sauceCtrl.reactToSauce); // Gérer le Like / Dislike d'une sauce

module.exports = router;