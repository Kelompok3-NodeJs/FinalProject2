const {Photo,User,Comment} = require('../models')
const user = require('../models/user')

class CommentController {
    // post comment
    static async postComment(req, res) {
        try{
            const { comment, PhotoId } = req.body;
            const user = res.locals.user
            const photo = await Photo.findByPk(PhotoId)
            if (!photo) {
                throw {
                    name: "photo not found",
                    devMessage: `Photo with id ${PhotoId} not found`
                }
            }
            const createComment = await Comment.create({
                comment,
                UserId: user.id,
                PhotoId
            })
            return res.status(201).json(createComment)
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    }

    // get /comments
    static async getComments(req, res) {
        try{
            const authenticatedUserId = res.locals.user.id;
            const comments = await Comment.findAll({
                include:[{model: User},{model: Photo}],
                where: {
                    UserId: authenticatedUserId
                }
            })
            let response = comments.map(el => {
                return {
                    id: el.id,
                    UserId: el.UserId,
                    PhotoId: el.PhotoId,
                    comment: el.comment,
                    createdAt: el.createdAt,
                    updatedAt: el.updatedAt,
                    Photo: {
                        id: el.Photo.id,
                        title: el.Photo.title,
                        caption: el.Photo.caption,
                        poster_image_url: el.Photo.poster_image_url,
                    },
                    User: {
                        id: el.User.id,
                        username: el.User.username,
                        profile_image_url: el.User.profile_image_url,
                        phone_number: el.User.phone_number,
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

module.exports = CommentController