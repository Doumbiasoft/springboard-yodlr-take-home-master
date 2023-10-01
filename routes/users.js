const express = require('express');
const router = express.Router();
const _ = require('lodash');
const logger = require('../lib/logger');
const log = logger();

let users = require('../init_data.json').data;
let curId = _.size(users)+1;


/* GET users listing.(Admin) */

router.get('/', function(req, res) {
  let list_users = _.toArray(users);
  res.render("admin.html", {list_users});
});
/* GET register form. */

router.get('/register', function(req, res) {
  res.render("signup.html");
});
/* Create a new user */
router.post('/', function(req, res, next) {
  if(_.toArray(users).some(x=> x.email === req.body.email)){
    return next(new Error('This user already exists!'));
  };
  let user = req.body;
  user.id = curId++;
  if (!user.state) {
    user.state = 'pending';
  }
  users[user.id] = user;
  log.info('Created user', user);
  res.redirect('/');
});

/* Get a specific user by id */
router.get('/users/:id', function(req, res, next) {
  let user = users[req.params.id];
  if (!user) {
    return next();
  }
  res.json(users[req.params.id]);
});

/* Get a edit form for a user by id */
router.get('/users/:id/edit/', function(req, res, next) {
  let user = users[req.params.id];
  if (!user) {
    return next();
  }
  res.render("edit_user.html", {user});
});

/* Delete a user by id */
router.post('/users/:id/delete', function(req, res) {
  let user = users[req.params.id];
  delete users[req.params.id];
  log.info('Deleted user', user);
  res.redirect('/');
});
/* Change user state by id */
router.post('/users/:id/state', function(req, res) {
  let user = users[req.params.id];
  if (!user) {
    return next();
  }
  if (user.state === "active"){
    user.state = "pending";
  }else{
    user.state = "active";
  }
  users[user.id] = user;

  log.info('User state changed', user);
  res.redirect('/');
});

/* Update a user by id */
router.post('/users/:id/update', function(req, res, next) {
  let user = req.body;
  if (user.id != req.params.id) {
    return next(new Error('ID paramter does not match body'));
  }
  /*Check if user email information update is not already in the database*/
  if(user.email !== users[user.id].email && _.toArray(users).some(x=> x.email === req.body.email)){
    return next(new Error('This email already exists!'));
  };

  const current_state = users[user.id].state;
  user.state = current_state;
  users[user.id] = user;
  log.info('Updating user', user);
  res.redirect('/');

});


module.exports = router;
