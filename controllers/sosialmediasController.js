const { SocialMedia } = require('../models');

class sosialmediasController {

static postSocialMedia(req, res) {
    const { name, social_media_url } = req.body;
    const user = res.locals.user
    SocialMedia.create({
        name,
        social_media_url,
        UserId: user.id
    })
        .then(result => {
            let response = {
                name: result.name,
                social_media_url: result.social_media_url
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

module.exports = sosialmediasController;