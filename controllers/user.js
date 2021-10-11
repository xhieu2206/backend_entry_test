const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getUsers = (req, res, next) => {
  User
    .find()
    .then(users => {
      res.status(200).json({
        message: 'Fetched users successfully',
        users,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.addUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors['errors'][0].msg);
    error.statusCode = 422;
    throw error;
  }

  const { firstName, lastName, username, email } = req.body;

  const user = new User({ firstName, lastName, username, email });

  user
    .save()
    .then(user => {
      res.status(201).json({
        message: 'User created successfully',
        user,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
