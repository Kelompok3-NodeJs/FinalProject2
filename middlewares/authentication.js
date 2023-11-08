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
  
      const userData = await User.findOne({
        where: {
          id: decode.id,
          email: decode.email
        }
      })
  
      if (!userData) {
        console.log(!userData);
        throw {
          code: 401,
          message: "User not found"
        }
      }
  
      req.UserData = {
        id: userData.id,
        email: userData.email,
        username: userData.username
      }

      res.locals.userData = userData
      next()
  
    } catch (error) {
        console.log(error);
      res.status(error.code || 500).json(error.message)
    }
  }
  
  module.exports = {
    authentication
  }