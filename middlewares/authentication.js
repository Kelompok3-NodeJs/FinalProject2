const {
    verifyToken
  } = require("../helpers/jwt")
  
  const {
    User
  } = require("../models")


  
  let authentication = async(req, res, next) => {
    try {
   
      const authorizationHeader = req.headers["authorization"];
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw {
          code: 401,
          message: "Token not provided or in an invalid format!,",
        };
      }
      const token = authorizationHeader.replace('Bearer ', '');
      console.log(token);
      
      if (!token) {
        throw {
          code: 401,
          message: "Token not provided!"
        }
      }

      // verify token
      const decode = verifyToken(token)
      console.log(decode);
      if (!decode) {
        throw {
          code: 401,
          message: "Invalid token",
        };
      }
  
      User.findOne({
        where: {
            id : decode.id,
            email: decode.email
        }
    })
     
    .then(user => {
      if (!user) {
        console.log(!User);
       return res.status(401).json({
        name: "Authentication Error",
        devMessage: `User with id "${decode.id}" not found in database`
       })
    }
      res.locals.user = user
      return next()
    })
    .catch(err => {
        console.log(err);
      return res.status(error.code || 401).json(error.message)
    })
} catch (err) {
    return res.status(401).json(err)
}
}

module.exports =  authentication
  