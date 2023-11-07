'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Comments', 'UserId', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addColumn('Comments', 'PhotoId', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addConstraint('Comments', {
      fields: ['UserId'],
      type: 'foreign key',
      name: 'UserId_fk',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
    await queryInterface.addConstraint('Comments', {
      fields: ['PhotoId'],
      type: 'foreign key',
      name: 'PhotoId_fk',
      references: {
        table: 'Photos',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Comments', 'UserId_fk')
    await queryInterface.removeConstraint('Comments', 'PhotoId_fk')
    await queryInterface.removeColumn('Comments', 'UserId')
    await queryInterface.removeColumn('Comments', 'PhotoId')
  }
};