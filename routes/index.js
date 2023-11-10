const router = require('express').Router();
const {
    authorization,
    photoAuthorization,
    commentGetAuth,
    commentAuth,
    socialmediaAuthorization,
    socialmediaGetAuth
} = require('../middlewares/authorization');
const authentication = require('../middlewares/authentication');
const UserController = require('../controllers/userController');
const PhotoController = require('../controllers/photoController');
const CommentController = require('../controllers/commentController');
const SocialMediaController = require('../controllers/socialMediaController');

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
router.get('/comments',CommentController.getComments, commentGetAuth);
router.put('/comments/:id', commentAuth,CommentController.PutComments);
router.delete('/comments/:id', commentAuth,CommentController.DeleteComments);
router.post('/socialmedias',SocialMediaController.postSocialMedia);
router.get('/socialmedias',socialmediaGetAuth,SocialMediaController.getSocialMedia);
router.put('/socialmedias/:id',socialmediaAuthorization,SocialMediaController.putSocialMedia);
router.delete('/socialmedias/:id',socialmediaAuthorization,SocialMediaController.deleteSocialMedia);
module.exports = router;