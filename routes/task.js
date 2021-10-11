const express = require('express');
const { body, check } = require('express-validator');
const router = express.Router();

const isAuth = require('../middleware/isAuth');
const taskController = require('../controllers/task');
const Project = require('../models/project');
const User = require('../models/user');
const Task = require('../models/task');

router.post('/tasks', [
  isAuth,
  body('userId')
    .trim()
    .not()
    .isEmpty()
    .withMessage('You have to select the user')
    .custom((value, { req }) => {
      return User.findOne({ _id: value })
        .then(userDoc => {
          if (!userDoc) {
            return Promise.reject(`The user doesn't existed`);
          }
        });
    }),
  body('projectId')
    .trim()
    .not()
    .isEmpty()
    .withMessage('You have to select the project')
    .custom((value, { req }) => {
      return Project.findOne({ _id: value })
        .then(projectDoc => {
          if (!projectDoc) {
            return Promise.reject(`The project doesn't existed`);
          }
        });
    }),
  body('date')
    .isDate({
      format: 'MM/DD/YYYY',
      strictMode: true,
    })
    .withMessage('Must be a valid date, the format of date should be MM/DD/YYYY'),
  body('hours')
    .isInt({ min: 0 })
    .withMessage('Hours must be a number equal or greater than 0'),
  body('minutes')
    .isInt({ min: 0 })
    .withMessage('Minutes must be a number equal or greater than 0'),
  body('task')
    .not()
    .isEmpty()
    .withMessage('Task description must not be empty'),
], taskController.addTask);

router.get('/tasks', taskController.getTasks);

router.put('/tasks/:taskId', [
  isAuth,
  check('taskId')
    .custom((value, { req }) => {
      return Task.findById(value)
        .then(task => {
          if (!task) {
            return Promise.reject(`This task doesn't existed`);
          }
        })
    }),
  body('date')
    .isDate({
      format: 'MM/DD/YYYY',
      strictMode: true,
    })
    .withMessage('Must be a valid date, the format of date should be MM/DD/YYYY'),
  body('hours')
    .isInt({ min: 0 })
    .withMessage('Hours must be a number equal or greater than 0'),
  body('minutes')
    .isInt({ min: 0 })
    .withMessage('Minutes must be a number equal or greater than 0'),
  body('task')
    .not()
    .isEmpty()
    .withMessage('Task description must not be empty'),
], taskController.editTask);

router.get('/tasks/:id', taskController.getTask)

module.exports = router;
