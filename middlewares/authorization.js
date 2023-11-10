const {User,Photo,Comment} = require('../models')
const {verifyToken} = require('../helpers/jwt')

function authorization(req, res, next) {
    const id = req.params.id
    const authenticatedUserId = res.locals.user.id

    User.findByPk(id)
    .then(result => {
        if (!result) {
            res.status(404).json({message: 'User Not Found'})
        } else {
            if (result.id === authenticatedUserId) {
                next()
            } else {
                res.status(401).json({message: 'Unauthorized'})
            }
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'})
    })
}

async function photoAuthorization(req, res, next) {
    const photoId = req.params.id;
    const authenticatedUserId = res.locals.user.id;

    try {
        const result = await Photo.findOne({
            where: {
                id: photoId
            }
        });
        
        if (!result) {
            return res.status(404).json({ message: 'result Not Found' });
        }

        if (result.UserId === authenticatedUserId) {
            return next(); // Pengguna memiliki akses ke foto, lanjutkan ke handler berikutnya
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

async function commentGetAuth(req, res, next) {
    try {
        const authenticatedUserId = res.locals.user.id;
        const comments = await Comment.findAll({
            where: {
                UserId: authenticatedUserId
            }
        });

        if (comments.length > 0) {
            return next();
        }
        return res.status(401).json({ message: 'Unauthorized' });
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

async function commentAuth(req, res, next) {
    try {
        const authenticatedUserId = res.locals.user.id;
        const { id } = req.params;
        const comment = await Comment.findByPk(id);
        if (comment.UserId === authenticatedUserId) {
            return next();
        }
        return res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    authorization,
    photoAuthorization,
    commentGetAuth,
    commentAuth
}
