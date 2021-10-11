const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const isAuth = require('../middleware/isAuth');

const projectController = require('../controllers/project');
const Project = require('../models/project');

router.get('/projects', projectController.fetchProjects);

router.post('/projects', [
  isAuth,
  body('name').trim().isLength({ min: 3 }).withMessage('Project name must have at least 3 characters'),
  body('description').trim().isLength({ min: 5 }).withMessage('Project name must have at least 5 characters'),
], projectController.createProject);

module.exports = router;
