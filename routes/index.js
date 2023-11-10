const router = require('express').Router();
const {authorization,photoAuthorization,commentGetAuth,commentAuth,sosialmediaAuthorization} = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');
const PhotoController = require('../controllers/photoController');
const CommentController = require('../controllers/commentController');
const SocialMediasController = require('../controllers/sosialmediasController');
//userController
router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.use(authentication);
router.delete('/users/:id', UserController.delete);
router.put('/users/:id', authorization, UserController.update);
//PhotoController
router.post('/photos', PhotoController.postPhoto);
router.get('/photos', PhotoController.getPhotos);
router.put('/photos/:id', photoAuthorization,PhotoController.updatePhoto);
router.delete('/photos/:id', photoAuthorization,PhotoController.deletePhoto);
//CommentController
router.post('/comments', CommentController.postComment);
router.get('/comments',CommentController.getComments, commentGetAuth);
router.put('/comments/:id', commentAuth,CommentController.PutComments);
router.delete('/comments/:id', commentAuth,CommentController.DeleteComments);
//SocialMediasController
router.post('/socialmedia', SocialMediasController.postSocialMedia);
router.get('/socialmedia', sosialmediaAuthorization,SocialMediasController.getSocialMedia);

module.exports = router;