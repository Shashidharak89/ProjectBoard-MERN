const Project = require('../models/Project');
const { Task } = require('../models/Task');
const User = require('../models/User');

// Helper to calculate progress for a project
const calculateProjectProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({ projectId });
  const completedTasks = await Task.countDocuments({
    projectId,
    status: 'completed',
  });
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    progress,
  };
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      startDate: startDate ? new Date(startDate) : new Date(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.status(201).json({
      success: true,
      data: {
        ...populatedProject.toObject(),
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        progress: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user projects (owned or member)
// @route   GET /api/projects?page=1&size=20&search=
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 20;
    const search = req.query.search || '';

    const skip = (page - 1) * size;

    const query = {
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
    };

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
          ],
        },
      ];
    }

    const total = await Project.countDocuments(query);
    const totalPages = Math.ceil(total / size) || 1;

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    // Compute task metrics for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const stats = await calculateProjectProgress(project._id);
        return {
          ...project.toObject(),
          ...stats,
        };
      })
    );

    return res.json({
      success: true,
      data: projectsWithProgress,
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

// @desc    Get single project by ID
// @route   GET /api/projects/:projectId
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check membership or ownership
    const isOwner = project.createdBy._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You are not a member of this project',
      });
    }

    const stats = await calculateProjectProgress(project._id);

    return res.json({
      success: true,
      data: {
        ...project.toObject(),
        ...stats,
        isOwner,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:projectId
// @access  Private (Owner Only)
const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, startDate } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Authorization check: Owner only
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can update project details',
      });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (startDate) project.startDate = new Date(startDate);

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    const stats = await calculateProjectProgress(projectId);

    return res.json({
      success: true,
      data: {
        ...updatedProject.toObject(),
        ...stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:projectId
// @access  Private (Owner Only)
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Authorization check: Owner only
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can delete this project',
      });
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ projectId });

    // Delete project
    await project.deleteOne();

    return res.json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
// @access  Private (Owner Only)
const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Authorization: Owner only
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can add members',
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
      });
    }

    // Check if already a member
    if (project.members.some((m) => m.toString() === userId.toString())) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(userId);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    return res.json({
      success: true,
      message: 'Member added successfully',
      data: updatedProject.members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:userId
// @access  Private (Owner Only)
const removeMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Authorization: Owner only
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can remove members',
      });
    }

    // Prevent removing owner
    if (project.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner from the project',
      });
    }

    // Check if member exists in project
    if (!project.members.some((m) => m.toString() === userId.toString())) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project',
      });
    }

    // Remove user from project members
    project.members = project.members.filter((m) => m.toString() !== userId.toString());
    await project.save();

    // Clean up task assignments: remove userId from assignedUsers in all project tasks
    await Task.updateMany(
      { projectId },
      { $pull: { assignedUsers: userId } }
    );

    const updatedProject = await Project.findById(projectId)
      .populate('members', 'name email');

    return res.json({
      success: true,
      message: 'Member removed successfully and removed from assigned tasks',
      data: updatedProject.members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project members
// @route   GET /api/projects/:projectId/members?page=1&size=20&search=
// @access  Private (Members & Owner)
const getProjectMembers = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 20;
    const search = req.query.search || '';

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check membership
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    let memberUserIds = project.members;

    const userQuery = { _id: { $in: memberUserIds } };

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      userQuery.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(userQuery);
    const totalPages = Math.ceil(total / size) || 1;
    const skip = (page - 1) * size;

    const members = await User.find(userQuery)
      .select('name email _id createdAt')
      .skip(skip)
      .limit(size);

    const formattedMembers = members.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isOwner: user._id.toString() === project.createdBy.toString(),
    }));

    return res.json({
      success: true,
      data: formattedMembers,
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
};
