const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Task = require('../models/task');
const User = require('../models/user');
const Project = require('../models/project');

exports.addTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors['errors'][0].msg);
    error.statusCode = 422;
    throw error;
  }

  const { userId, projectId, date, hours, minutes, task } = req.body;

  const createdDate = new Date(date);

  const newTask = new Task({
    user: userId,
    project: projectId,
    date: createdDate,
    hours,
    minutes,
    task
  });

  newTask
    .save()
    .then(task => {
      res.status(201).json({
        message: 'Project created successfully',
        task,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.getTasks = async (req, res, next) => {
  const currentPage = req.query['page'] || 1;
  const perPage = req.query['perPage'] || 10;

  let filter = {};

  if (req.query['users'] && Array.isArray(req.query['users'])) {
    let userIds = req.query['users'].map(userId => {
      return new mongoose.Types.ObjectId(userId);
    });
    filter.user = {
      $in: userIds
    }
  } else if (req.query['users']) {
    filter.user = new mongoose.Types.ObjectId(req.query['users']);
  }

  if (req.query['projects'] && Array.isArray(req.query['projects'])) {
    let projectIds = req.query['projects'].map(projectId => {
      return new mongoose.Types.ObjectId(projectId);
    })
    filter.project = {
      $in: projectIds
    }
  } else if (req.query['projects']) {
    filter.project = new mongoose.Types.ObjectId(req.query['projects']);
  }

  if (req.query['from'] && req.query['to']) {
    filter.date = {
      $gte: new Date(req.query['from']),
      $lt: new Date(req.query['to']),
    }
  }

  try {
    const totalTasks = await Task.find(filter).sort('-date').countDocuments();
    const allTasks = await Task.find(filter).sort('-date');
    let hours = 0;
    let minutes = 0;
    allTasks.forEach(task => {
      hours += task.hours;
      minutes += task.minutes;
    })
    const tasks = await Task.find(filter)
      .populate('user')
      .populate('project')
      .sort('-date').skip((currentPage - 1) * perPage).limit(perPage);
    res.status(200).json({
      message: 'Fetched tasks successfully',
      tasks,
      totalTasks,
      hours,
      minutes,
      totalPages: Math.ceil(totalTasks / perPage),
    })
  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getTask = async (req, res, next) => {
  const taskId = req.params['id'];

  Task.findById(taskId)
    .then(task => {
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      res.json({
        task,
        message: 'Fetch task successfully',
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.editTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors['errors'][0].msg);
    error.statusCode = 422;
    throw error;
  }
  const taskId = req.params['taskId'];
  const { date, hours, minutes, task } = req.body;
  let description = task;
  Task
    .findById(taskId)
    .then(task => {
      task.date = date;
      task.hours = hours;
      task.minutes = minutes;
      task.task = description;
      return task.save();
    })
    .then(task => {
      res.status(200).json({
        message: 'Update task successfully',
        task
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
