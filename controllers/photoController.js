const { Photo, User } = require('../models');

class PhotoController {

    static postPhoto(req, res) {
        const { poster_image_url, title, caption } = req.body;
        const user = res.locals.us
        Photo.create({
            poster_image_url,
            title,
            caption,
            UserId: user,
            
        })
            .then(result => {
                let response = {
                    poster_image_url: result.poster_image_url,
                    title: result.title,
                    caption: result.caption,
                    UserId: result.UserId
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