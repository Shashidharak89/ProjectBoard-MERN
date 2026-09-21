const express = require('express');
const { getMe, updateMe, searchUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/', searchUsers);
router.get('/:id', getUserById);

module.exports = router;
