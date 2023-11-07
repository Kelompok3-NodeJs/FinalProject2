const user = require('../models').User
const { verifyToken } = require('../helpers/jwt')

function authentication(req,res,next){
    try{
        const token = req.get('token')
        const userDecoded = verifyToken(token)
        user.findOne({
            where: {
                id: userDecoded.id,
                email: userDecoded.email
            }
        })
    .then(user => {
            if(!user){
                res.status(401).json({message: 'Invalid Token'})
            }
                res.locals.user = user
                return next()
        })
        .catch(err => {
            return res.status(401).json(err)
        }) 
    } catch(err) {
        return res.status(401).json(err)
    }
}

module.exports = authentication