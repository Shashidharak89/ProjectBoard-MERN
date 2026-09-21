const express = require('express');
const {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/:taskId')
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;
