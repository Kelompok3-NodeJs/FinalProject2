const { Photo, User } = require('../models');

class PhotoController {

    static postPhoto(req, res) {
        const { poster_image_url, title, caption } = req.body;
        const user = res.locals.user
        console.log(res.locals.user);
        Photo.create({
            poster_image_url,
            title,
            caption,
            UserId: user.id
            
        })
            .then(result => {
                let response = {
                    poster_image_url: result.poster_image_url,
                    title: result.title,
                    caption: result.caption,
                    UserId: result.userId
                }
                console.log(result);
                res.status(201).json(result)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            })
     }



}

module.exports = PhotoController;