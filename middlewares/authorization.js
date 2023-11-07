const {user} = require('../models')

function authorization(req, res, next) {
    const id = req.params.id
    user.findByPk(id)
    .then(result => {
        if (!result) {
            res.status(404).json({message: 'User Not Found'})
        } else {
            if (result.id === req.userData.id) {
                next()
            } else {
                res.status(401).json({message: 'Unauthorized'})
            }
        }
    })
    .catch(err => {
        res.status(500).json({message: 'Internal Server Error'})
    })
}

module.exports = authorization