const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
} = require('../controllers/projectController');
const { createTask, getProjectTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:projectId')
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

router.route('/:projectId/members')
  .post(addMember)
  .get(getProjectMembers);

router.delete('/:projectId/members/:userId', removeMember);

// Task nested endpoints
router.route('/:projectId/tasks')
  .post(createTask)
  .get(getProjectTasks);

module.exports = router;
