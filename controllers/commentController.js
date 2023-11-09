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
}

module.exports = CommentController