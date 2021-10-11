const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const userController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');
const User = require('../models/user');

router.get('/users', userController.getUsers);

router.post('/users', [
  isAuth,
  body('firstName').trim().isLength({ min: 2 }).withMessage('first name must have at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('last name must have at least 2 characters'),
  body('username').trim().isLength({ min: 5 }).withMessage('username must have at least 5 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      return User.findOne({ email: value })
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already existed');
          }
        });
    })
    .normalizeEmail(),
], userController.addUser);

module.exports = router;
