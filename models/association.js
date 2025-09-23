const Subcatagorym = require('./subcategory');

// const YellowNoting = require('./yellonoting')
// const YellowNoting = require('./yellonoting')
const Catagoym = require('./category')

const sequiilize = require('../config/database')
const Teacherm = require('./teachers');
const Querym = require('./querydetail')
const Rolem = require('./role')
const Assignrule = require('./autoforwarding')
Subcatagorym.hasOne(Catagoym, {
  sourceKey:'categoryId',
  foreignKey: 'id',
  as: 'subcatinfo',
});
Catagoym.hasOne(Subcatagorym, {
  sourceKey:'id',
  foreignKey: 'categoryId',
  as: 'forwardteacherd',
});
Querym.belongsTo(Teacherm, {
  sourceKey:'tid',
  foreignKey: 'tchid',
  as: 'recieverteacherd',
});
Querym.belongsTo(Teacherm, {
  sourceKey:'frtid',
  foreignKey: 'tchid',
  as: 'forwardteacherd',
});
Teacherm.belongsTo(Rolem, {
  sourceKey:'tchrole',
  foreignKey: 'id',
  as: 'roleinfo',
});
Assignrule.belongsTo(Teacherm, {
  sourceKey:'assignteacher',
  foreignKey: 'tchid',
  as: 'forassignt',
});
Assignrule.belongsTo(Teacherm, {
  sourceKey:'auforwardingt',
  foreignKey: 'tchid',
  as: 'forautofort',
});
sequiilize.sync({ force: false })
