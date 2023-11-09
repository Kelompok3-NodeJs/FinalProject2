'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{
        foreignKey: 'UserId'
      })
    }
  }
  Photo.init({
    // validasi title
    title: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Title cannot be empty!'
        }
      }
    },
    // validasi caption
    caption: {
      type:DataTypes.TEXT,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Caption cannot be empty!'
        }
      }},
    poster_image_url: {
      type:DataTypes.TEXT,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Poster image URL cannot be empty!'
        },
        isUrl: {
          args: true,
          msg: 'Poster image URL format is invalid!'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Photo',
  });
  return Photo;
};