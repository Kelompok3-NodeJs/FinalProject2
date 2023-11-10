const { User} = require('../models');
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
        try {
            const authenticatedUserId = res.locals.user.id;
            const sosmed = await SocialMedia.findAll({
                include: [{ model: User }],
                where: {
                    UserId: authenticatedUserId
                }
            });
            
            let response = sosmed.map(([, [result]]) => {
                return {
                    id: result.id,
                    name: result.name,
                    social_media_url: result.social_media_url,
                    UserId: result.UserId,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    User: {
                        id: result.User.id,
                        username: result.User.username,
                        profile_image_url: result.User.profile_image_url,
                    },
                };
            });
    
            res.status(200).json(response);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
    

    // put / comment
    static async putSocialMedia(req, res) {
        try {
            const authenticatedUserId = res.locals.user.id;
            const { name, social_media_url } = req.body;
            
            SocialMedia.update({
                name,
                social_media_url,
            }, {
                where: {
                    id : authenticatedUserId
                },
                returning: true
            })
            .then(([, [result]]) => {
                
                let response = {
                    "social_media": {
                        id: result.id,
                        name: result.name,
                        social_media_url: result.social_media_url,
                        UserId: result.UserId,
                        updatedAt: result.updatedAt,
                        createdAt: result.createdAt
                        }
                }
            return res.status(200).json(response)
        })
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }

    // delete /socialMedia
    static async deleteSocialMedia(req,res){
        try {
            const {id} = req.params
            await SocialMedia.destroy({
                where:{
                    id:id
                }
            })
            res.status(200).json({message:'your social media has been successfully deleted'})
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    }
 
}

module.exports = sosialmediasController;