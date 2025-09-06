const Subcatagorym = require('./subcategory');

// const YellowNoting = require('./yellonoting')
// const YellowNoting = require('./yellonoting')
const Catagoym = require('./category')

const sequiilize = require('../config/database')


Subcatagorym.hasOne(Catagoym, {
  sourceKey:'categoryId',
  foreignKey: 'id',
  as: 'subcatinfo',
});
Catagoym.hasOne(Subcatagorym, {
  sourceKey:'id',
  foreignKey: 'categoryId',
  as: 'subcatinfo',
});
sequiilize.sync({ force: false })
