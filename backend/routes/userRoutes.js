const express = require('express');
const { getMe, updateMe, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/', searchUsers);

module.exports = router;
