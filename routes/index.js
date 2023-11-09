const router = require('express').Router();
const authorization = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');
const PhotoController = require('../controllers/photoController');


router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.put('/users/:id', UserController.update,authorization);
router.delete('/users/:id', UserController.delete);
router.use(authentication)
router.post('/photos/', PhotoController.postPhoto);

module.exports = router;