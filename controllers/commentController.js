const {Photo,User,Comment} = require('../models');
const comment = require('../models/comment');
const { Sequelize } = require('sequelize');

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
            if (error instanceof Sequelize.ValidationError) {
                let errorMessage = error.errors.map(err => err.message);
                return res.status(400).json({ message: errorMessage });
            }
            return res.status(500).json(error)
        }
    }

    // get /comments
    static async getComments(req, res) {
        try{
            const authenticatedUserId = res.locals.user.id;
            console.log(authenticatedUserId);
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

    // put / comment
    static async PutComments(req, res) {
        try {
            const { comment } = req.body;
            const { id } = req.params;
            if (!comment || comment.trim() === '') {
                return res.status(400).json({ message: 'Comment cannot be empty!' });
            }
            
            Comment.update({
                comment
            }, {
                where: {
                    id
                },
                returning: true
            })
            .then(([, [result]]) => {
                
                let response = {
                    id: result.id,
                    comment: result.comment,
                    UserId: result.UserId,
                    PhotoId: result.PhotoId,
                    updatedAt: result.updatedAt,
                    createdAt: result.createdAt
                }
            return res.status(200).json(response)
        })
        } catch (error) {
            if (error instanceof Sequelize.ValidationError) {
                let errorMessage = error.errors.map(err => err.message);
                return res.status(400).json({ message: errorMessage });
            }
            let errorMessage = error.errors.map(err => err.message);
            return res.status(500).json({ message: errorMessage})
        }
    }

    // delete / comment
    static async DeleteComments(req, res) {
        const id = +req.params.id;
        // Check if the user with the specified ID exists
        Comment.findByPk(id)
            .then(comment => {
                if (!comment) {
                    // If the user doesn't exist, send a 404 error
                    res.status(404).json({ message: "Comment Not Found" });
                }
                Comment.destroy({
                    where: {
                        id
                    }
                })
                .then(result => {
                    res.status(200).json({ message: "Your Comment has been successfully deleted" });
                })
                .catch(err => {
                    res.status(500).json(err);
                });
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}

module.exports = CommentController
