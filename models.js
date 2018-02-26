const Sequelize = require('sequelize');

// returns all the models.
module.exports = () => {
  const User = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: Sequelize.STRING,
    password: Sequelize.STRING,

});
};
