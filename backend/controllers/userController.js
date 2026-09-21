const User = require('../models/User');
const Project = require('../models/Project');
const TaskAssignment = require('../models/TaskAssignment');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) {
      user.name = name.trim();
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already taken',
        });
      }
      user.email = normalizedEmail;
    }

    const updatedUser = await user.save();

    return res.json({
      success: true,
      data: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated users list or search
// @route   GET /api/users?page=1&size=20&search=""
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const size = Math.max(1, Math.min(100, parseInt(req.query.size) || 20));
    const search = req.query.search || '';

    let filter = {};
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter = {
        $or: [{ name: searchRegex }, { email: searchRegex }],
      };
    }

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / size) || 1;

    const users = await User.find(filter)
      .select('name email createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    return res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        page,
        size,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Inspect user account details and statistics
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const projectsOwned = await Project.countDocuments({ createdBy: user._id });
    const projectsJoined = await Project.countDocuments({ members: user._id });
    const totalAssignedTasks = await TaskAssignment.countDocuments({ user: user._id });
    const completedTasks = await TaskAssignment.countDocuments({ user: user._id, status: 'completed' });

    return res.json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          projectsOwned,
          projectsJoined,
          totalAssignedTasks,
          completedTasks,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  searchUsers,
  getUserById,
};
