const { validationResult } = require('express-validator');

const Project = require('../models/project');

exports.fetchProjects = (req, res, next) => {
  Project
    .find()
    .then(projects => {
      res.status(200).json({
        message: 'Fetched projects successfully',
        projects,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.createProject = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors['errors'][0].msg);
    error.statusCode = 422;
    throw error;
  }

  const { name, description } = req.body;
  const project = new Project({ name, description });

  project
    .save()
    .then(project => {
      res.status(201).json({
        message: 'Project created successfully',
        project,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}
