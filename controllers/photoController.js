const { Photo,User,Comment} = require('../models');
const user = require('../models/user');

class PhotoController {
    // post photo
    static postPhoto(req, res) {
        const { poster_image_url, title, caption } = req.body;
        const user = res.locals.user
        Photo.create({
            poster_image_url,
            title,
            caption,
            UserId: user.id
            
        })
            .then(result => {
                let response = {
                    id: result.id,
                    poster_image_url: result.poster_image_url,
                    title: result.title,
                    caption: result.caption,
                    UserId: result.UserId
                }
                res.status(201).json(response)
            })
            .catch(err => {
                console.error(err);  // Log the error
                res.status(500).json({ error: 'Internal Server Error' });  // Send a meaningful error response
            })
     }

    // get /photos
    static getPhotos(req, res) {
        Photo.findAll({ 
            include:[{model: User},{model: Comment, include: [{ model: User }]}]
        })
            .then(result => {
                let response = result.map(el => {
                    return {
                        id: el.id,
                        title: el.title,
                        caption: el.caption,
                        poster_image_url: el.poster_image_url,
                        UserId: el.UserId,
                        createdAt: el.createdAt,
                        updatedAt: el.updatedAt,
                        Comments:el.Comments.map(comment => {
                            return {
                                comment: comment.comment,
                                User: {
                                    username: comment.User.username
                                }
                            };
                        }),
                        User: {
                            id: el.User.id,
                            username: el.User.username,
                            profile_image_url: el.User.profile_image_url
                        }
                    }
                
                })
                res.status(200).json(response)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
    }

    // put /photos/:photoid
    static updatePhoto(req, res) {
        const { title,caption,poster_image_url } = req.body;
        const { id } = req.params;
        Photo.update({
            poster_image_url,
            title,
            caption
        }, {
            where: {
                id
            },
            returning: true
        })
            .then(([rowsUpdate, [updatedPhoto]]) => {
                if (rowsUpdate === 0) {
                    res.status(404).json({ message: 'Photo Not Found' })
                }
                let response = {
                    id: updatedPhoto.id,
                    title: updatedPhoto.title,
                    caption: updatedPhoto.caption,
                    poster_image_url: updatedPhoto.poster_image_url,
                    UserId: updatedPhoto.UserId,
                    createdAt: updatedPhoto.createdAt,
                    updatedAt: updatedPhoto.updatedAt
                }
                res.status(200).json(response)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
    }

    // delete /photos/:photoid
    static deletePhoto(req, res) {
        const  id  = req.params.id;
        Photo.destroy({
            where: {
                id
            }
        })
            .then(result => {
                if (result === 0) {
                    res.status(404).json({ message: 'Photo Not Found' })
                }
                res.status(200).json({ message: 'Your photo has been successfully deleted' })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
    }

}

module.exports = PhotoController;