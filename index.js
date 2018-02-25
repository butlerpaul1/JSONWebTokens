const express = require('express');
const http = require('http');
var bodyParser = require('body-parser');

const routes = require('./api');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/postgres');


const app = express();

sequelize
  .authenticate()
  .then(function (err) {
    console.log('Connection works');
  })
  .catch(function(err) {
    console.log('Connection does not work', err);
  });

//bodyParser
app.use(bodyParser.json());

//content
app.use(express.static('public'));


//apis
  app.use(routes);


  app.get('/', (req, res) =>{
    console.log('Get Request');
    res.end();
  });



  app.listen(3000, () => console.log('Example app listening on port 3000!'))
