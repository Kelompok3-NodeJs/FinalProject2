const router = require('express').Router();
const {authorization} = require('../middlewares/authorization');
const {photoAuthorization} = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');
const PhotoController = require('../controllers/photoController');

router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.delete('/users/:id', UserController.delete);
router.use(authentication);
router.put('/users/:id', authorization, UserController.update);
router.post('/photos', PhotoController.postPhoto);
router.get('/photos', PhotoController.getPhotos);
router.put('/photos/:id', photoAuthorization,PhotoController.updatePhoto);
router.delete('/photos/:id', photoAuthorization,PhotoController.deletePhoto);

module.exports = router;