'use strict';
const {
  Model
} = require('sequelize');
const {hashPassword} = require('../helpers/bcrypt')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Photo)
      this.hasMany(models.SocialMedia)
      this.hasMany(models.Comment)
    }
  }
  User.init({
    // validasi full name
    full_name: {
      type:DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Full name cannot be empty!'
          }
        }
    },

    // validasi email
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email already in use!'
      },
        validate: {
          isEmail: {
            args: true,
            msg: 'Invalid email format!'
          },
          notEmpty: {
            args: true,
            msg: 'Email cannot be empty!'
          },
        }
    },

    // validasi username
    username: {
      type:DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Username already in use!'
      },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Username cannot be empty!'
          }
        }
    },

    // validasi password
    password: {
      type:DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Password cannot be empty!'
          }
        }
    },

    // validasi profile image
    profile_image_url: {
      type:DataTypes.TEXT,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Profile image cannot be empty!'
          },
          isUrl: {
            args: true,
            msg: 'Invalid url format!'
          }
        }
    },

    // validasi age
    age: {
      type:DataTypes.NUMBER,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Age cannot be empty!'
          },
          isNumeric: {
            args: true,
            msg: 'Age must be a number data type!'
          }
        }
    },

    // validasi phone number
    phone_number: {
      type:DataTypes.STRING,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Phone number cannot be empty!'
          },
          isNumeric: {
            args: true,
            msg: 'Phone number must be a number data type!'
          }
        }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async function (user,opt) {
        try {
          const hashedPassword = await hashPassword(user.password)
          user.password = hashedPassword
          return user
        } catch (err) {
          console.log(err)
        }
      }
    }
  });
  return User;
};