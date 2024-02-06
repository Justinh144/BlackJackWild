const User = require('./User');
const Card = require('./Card');
const Project = require('./Project')
// const UserDeck = require('./userDeck');

User.hasMany(Project, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
  });
  
  Project.belongsTo(User, {
    foreignKey: 'user_id'
  });
  


module.exports = { User, Card, Project };