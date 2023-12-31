'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SocialMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{foreignKey: 'UserId'})
    }
  }
  SocialMedia.init({
    name: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Name cannot be empty!'
        }
      }
    },
    social_media_url: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Social media URL cannot be empty!'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'SocialMedia',
  });
  return SocialMedia;
};