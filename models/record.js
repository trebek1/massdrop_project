'use strict';
module.exports = function(sequelize, DataTypes) {
  var Record = sequelize.define('Record', {
    address: DataTypes.STRING,
    data: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Record;
};