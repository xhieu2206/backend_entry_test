const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Credential = require('../models/credential');
const SECRET = process.env.SECRET_KEY;

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors['errors'][0].msg);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body['email'];
  const username = req.body['username'];
  const password = req.body['password'];
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const credential = new Credential({
        email, password: hashedPassword, username
      })
      return credential.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created',
        userId: result._id,
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedCredential;

  Credential.findOne({ email })
    .then(credential => {
      if (!credential) {
        const error = new Error('User with this email could not be found');
        error.satusCode = 401;
        throw error;
      }
      loadedCredential = credential;
      return bcrypt.compare(password, credential.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong Password');
        error.satusCode = 401;
        throw error;
      }
      const token = jwt.sign({
        email: loadedCredential.email,
        username: loadedCredential.username,
        userId: loadedCredential._id.toString(),
      }, SECRET);
      res.status(200).json({
        token,
        username: loadedCredential.username,
        email: loadedCredential.email,
        credentialId: loadedCredential._id.toString(),
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
