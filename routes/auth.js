const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth');
const Credential = require('../models/credential');

router.put('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req}) => {
      return Credential.findOne({ email: value })
        .then(credentialDoc => {
          if (credentialDoc) {
            return Promise.reject('Email address already existed');
          }
        })
    })
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }).withMessage('Password must have at least 5 characters'),
  body('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage(`Username couldn't be empty`)
], authController.signup);

router.post('/login', authController.login)

module.exports = router;
