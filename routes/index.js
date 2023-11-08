const router = require('express').Router();
const authorization = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');


router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.put('/users/:id', UserController.update,authorization);

module.exports = router;