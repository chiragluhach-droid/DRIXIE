const Subcatagorym = require('./subcategory');

// const YellowNoting = require('./yellonoting')
// const YellowNoting = require('./yellonoting')
const Catagoym = require('./category')

const sequiilize = require('../config/database')
const Teacherm = require('./teachers');
const Querym = require('./querydetail')
const Rolem = require('./role')
const Assignrule = require('./autoforwarding')
Catagoym.hasOne(Subcatagorym, {
  sourceKey:'id',
  foreignKey: 'categoryId',
  as: 'subcatinfo',
});
// Catagoym.hasOne(Subcatagorym, {
//   sourceKey:'id',
//   foreignKey: 'categoryId',
//   as: 'forwardteacherd',
// });
Querym.hasOne(Catagoym, {
  sourceKey:'catagoryid',
  foreignKey: 'id',
  as: 'querycatagory',
});
Querym.hasOne(Subcatagorym, {
  sourceKey:'subcaragoryid',
  foreignKey: 'id',
  as: 'querysubcatagory',
});

sequiilize.sync({ force: false })
