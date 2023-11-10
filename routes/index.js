const router = require('express').Router();
const {authorization,commentAuthorization} = require('../middlewares/authorization');
const {photoAuthorization} = require('../middlewares/authorization');
const {sosialmediaAuthorization} = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');
const PhotoController = require('../controllers/photoController');
const CommentController = require('../controllers/commentController');
const sosialmediasController = require('../controllers/sosialmediasController');

router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.use(authentication);
router.delete('/users/:id', UserController.delete);
router.put('/users/:id', authorization, UserController.update);
router.post('/photos', PhotoController.postPhoto);
router.get('/photos', PhotoController.getPhotos);
router.put('/photos/:id', photoAuthorization,PhotoController.updatePhoto);
router.delete('/photos/:id', photoAuthorization,PhotoController.deletePhoto);
router.post('/comments', CommentController.postComment);
router.get('/comments', commentAuthorization,CommentController.getComments, );
router.put('/comments/:id', commentAuthorization,CommentController.PutComments);
router.delete('/comments/:id', commentAuthorization,CommentController.DeleteComments);
router.post('/socialmedia', sosialmediasController.postSocialMedia);

module.exports = router;