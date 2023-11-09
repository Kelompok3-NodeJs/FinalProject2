const {comparePassword} = require('../helpers/bcrypt')
const { User } = require('../models')
const user = require('../models/user')
const { generateToken } = require('../helpers/jwt')

class UserController {
    static register(req, res) {
        try{
            const { email, full_name, username, password, profile_image_url, age, phone_number } = req.body
        User.create({ 
            email, 
            full_name, 
            username, 
            password, 
            profile_image_url, 
            age, 
            phone_number 
        })
        .then(result => {
            let response = {
                email: result.email,
                full_name: result.full_name,
                username: result.username,
                profile_image_url: result.profile_image_url,
                age: result.age,
                phone_number: result.phone_number
            }
            res.status(201).json(response)
        })
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({ 
                message : 'Validation Error',
                errors : error.errors.map(err => err.message)
    });
        } else {
            res.status(500).json({ message : 'Internal Server Error' })
        }
    }
    }

    static login(req, res) {
        const { email, password } = req.body
        User.findOne({
            where: {
                email
            }
        })
        .then(user => {
            if (!user) {
                throw {
                    name: "user login error",
                    devMesaage: `User With Email "${email}" Not Found`
                }
            }
            const isCorrect = comparePassword(password, user.password)
            if (!isCorrect) {
                throw {
                    name: "user login error",
                    devMesaage: `Wrong Password`
                }
            }
            let payload = {
                id: user.id,
                email: user.email
            }
            const token = generateToken(payload)
            res.status(200).json({ token })
        })
        .catch(err => {
             res.status(401).json(err)
            console.log(err)
         })
    }

    static update(req,res){
        const id = req.params.id
        
        const { email, full_name, username, profile_image_url, age, phone_number } = req.body
        User.update({
            email, 
            full_name, 
            username, 
            profile_image_url, 
            age, 
            phone_number 
        },{
            where:{
                id
            },
            returning: true
        })
        .then(([rowsUpdate, [updatedUser]]) => {
            if (rowsUpdate === 0) {
                res.status(404).json({message: 'User Not Found'})
            }

            let response = {
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                username: updatedUser.username,
                profile_image_url: updatedUser.profile_image_url,
                age: updatedUser.age,
                phone_number: updatedUser.phone_number
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({message: 'Internal Server Error'})
        })
    }

    static delete(req, res) {
        const id = +req.params.id;
    
        // Check if the user with the specified ID exists
        User.findByPk(id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User Id not found' });
                }
    
                // If the user exists, proceed to delete it
                User.destroy({
                    where: {
                        id
                    }
                })
                .then(result => {
                    res.status(200).json({ message: "Your account has been successfully deleted" });
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

module.exports = UserController