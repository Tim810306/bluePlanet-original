'use strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class vender_items extends Model {
    static associate (models) {
      // define association
    }
  }
  vender_items.init({
    vender_id: DataTypes.INTEGER,
    restaurant_id: DataTypes.INTEGER,
    restaurant_name: DataTypes.STRING,
    kind: DataTypes.STRING,
    keyId: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'vender_items'
  })
  return vender_items
}
