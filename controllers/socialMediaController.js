const {SocialMedia,User} = require('../models')
const { Sequelize } = require('sequelize')

class socialMediaController{
    static async postSocialMedia(req,res){
        try {
            const {name,social_media_url} = req.body
            const UserId = res.locals.user.id
            const newSocialMedia = await SocialMedia.create({
                name,
                social_media_url,
                UserId:UserId
            })
            let response = {
                id:newSocialMedia.id,
                name:newSocialMedia.name,
                social_media_url:newSocialMedia.social_media_url,
                UserId:newSocialMedia.UserId,
                createdAt:newSocialMedia.createdAt,
                updatedAt:newSocialMedia.updatedAt
            }
            res.status(201).json(response)
        } catch (error) {
            if (error instanceof Sequelize.ValidationError) {
                let errorMessage = error.errors.map(err => err.message);
                return res.status(400).json({ message: errorMessage });
            }
            return res.status(500).json(error)
        }
    }

    // get /socialMedia
    static async getSocialMedia(req,res){
        try {
            const socialMedias = await SocialMedia.findAll({
                include:[{model:User}]
                ,where:{
                    UserId:res.locals.user.id
                }
            })
            let response = socialMedias.map(el => {
                return {
                    id:el.id,
                    name:el.name,
                    social_media_url:el.social_media_url,
                    UserId:el.UserId,
                    createdAt:el.createdAt,
                    updatedAt:el.updatedAt,
                    User: {
                        id: el.User.id,
                        username: el.User.username,
                        profile_image_url: el.User.profile_image_url
                    }
                }
            })
            res.status(200).json(response)
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
        }
    }

    // put /socialMedia
    static async putSocialMedia(req,res){
        try {
            const {name,social_media_url} = req.body
            const {id} = req.params
            const UserId = res.locals.user.id
            await SocialMedia.update({
                name,
                social_media_url,
                UserId:UserId
            },{
                where:{
                    id:id
                },
                returning:true
            })
            .then(([,[result]])=>{
                let response = {
                    id:result.id,
                    name:result.name,
                    social_media_url:result.social_media_url,
                    UserId:result.UserId,
                    createdAt:result.createdAt,
                    updatedAt:result.updatedAt
                }
                return res.status(200).json(response)
            })
        } catch (error) {
            console.log(error);
            res.status(500).json(error)
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

module.exports = socialMediaController