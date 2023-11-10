const { SocialMedia } = require('../models');
const socialmedia = require('../models/socialmedia');

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

    static async getSocialMedia(req, res) {
        try{
            const authenticatedUserId = res.locals.user.id;
            console.log(authenticatedUserId);
            const sosmed = await socialmedia.findAll({
                include:[{model: User},{model: Photo}],
                where: {
                    UserId: authenticatedUserId
                }
            })
            
            let response = sosmed.map(el => {
                return {
                    id: el.id,
                    name: el.name,
                    social_media_url: el.social_media_url,
                    UserId: el.UserId,
                    createdAt: el.createdAt,
                    updatedAt: el.updatedAt,
                    User: {
                        id: el.User.id,
                        username: el.User.username,
                        profile_image_url: el.User.profile_image_url,
                    },
                }
            })
            return res.status(200).json(response)
        }catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }
 
}

module.exports = sosialmediasController;