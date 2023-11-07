const comparePassword = require('../helpers/bcrypt')
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
                    res.status(400).json({ message: 'Invalid email' })
                } else {
                    const isCorrect = comparePassword(password, user.password)
                    if (!isCorrect) {
                        res.status(400).json({ message: 'Invalid password' })
                    } else {
                        const payload = {
                            id: user.id,
                            email: user.email
                        }
                        const token = generateToken(payload)
                        res.status(200).json({ token })
                    }
                }
            })
            .catch(err => {
                res.status(401).json(err)
                console.log(err)
            })
    }
}

module.exports = UserController