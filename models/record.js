'use strict';
module.exports = function(sequelize, DataTypes) {
  var Record = sequelize.define('Record', {
    addressQueue: DataTypes.ARRAY(DataTypes.STRING),
    responses: DataTypes.ARRAY(DataTypes.TEXT),
    addresses: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Record;
};