const { Task, TASK_STATUSES } = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const Project = require('../models/Project');

// Helper to check user project membership
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, isMember: false, isOwner: false };

  const isOwner = project.createdBy.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());

  return { project, isMember: isOwner || isMember, isOwner };
};

// Helper to populate assignedUsers from TaskAssignment collection
const populateTaskWithAssignments = async (taskDoc) => {
  const taskObj = taskDoc.toObject ? taskDoc.toObject() : taskDoc;
  const assignments = await TaskAssignment.find({ taskId: taskObj._id }).populate(
    'userId',
    'name email'
  );
  const assignedUsers = assignments.map((a) => a.userId).filter(Boolean);
  return {
    ...taskObj,
    assignedUsers,
  };
};

// @desc    Create task in project
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Project Member or Owner)
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { description, assignedUsers, deadline, status } = req.body;

    const { project, isMember } = await checkProjectMembership(projectId, req.user._id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task description is required',
      });
    }

    if (!deadline || isNaN(Date.parse(deadline))) {
      return res.status(400).json({
        success: false,
        message: 'A valid deadline date is required',
      });
    }

    // Validate assigned users are project members
    let validAssignedUserIds = [];
    if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      const invalidUsers = assignedUsers.filter(
        (uId) => !project.members.some((m) => m.toString() === uId.toString())
      );

      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to users who are not project members',
        });
      }
      validAssignedUserIds = assignedUsers;
    }

    const taskStatus = status && TASK_STATUSES.includes(status) ? status : 'in-progress';

    // 1. Create Task document
    const task = await Task.create({
      projectId,
      description: description.trim(),
      status: taskStatus,
      deadline: new Date(deadline),
      createdBy: req.user._id,
    });

    // 2. Create TaskAssignment documents in separate collection
    if (validAssignedUserIds.length > 0) {
      const assignmentDocs = validAssignedUserIds.map((uId) => ({
        taskId: task._id,
        userId: uId,
        assignedBy: req.user._id,
      }));
      await TaskAssignment.insertMany(assignmentDocs);
    }

    const populatedTask = await Task.findById(task._id).populate('createdBy', 'name email');
    const resultTask = await populateTaskWithAssignments(populatedTask);

    return res.status(201).json({
      success: true,
      data: resultTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project tasks
// @route   GET /api/projects/:projectId/tasks?page=1&size=20&search=&status=&assignedUser=&overdue=
// @access  Private (Project Member or Owner)
const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 20;
    const search = req.query.search || '';
    const statusFilter = req.query.status || '';
    const assignedUserFilter = req.query.assignedUser || '';
    const overdueFilter = req.query.overdue;

    const { project, isMember } = await checkProjectMembership(projectId, req.user._id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    const query = { projectId };

    if (search.trim()) {
      query.description = new RegExp(search.trim(), 'i');
    }

    if (statusFilter && TASK_STATUSES.includes(statusFilter)) {
      query.status = statusFilter;
    }

    if (overdueFilter === 'true') {
      query.deadline = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    // Filter by assigned user via TaskAssignment collection
    if (assignedUserFilter) {
      const userAssignments = await TaskAssignment.find({ userId: assignedUserFilter }).select('taskId');
      const assignedTaskIds = userAssignments.map((a) => a.taskId);
      query._id = { $in: assignedTaskIds };
    }

    const total = await Task.countDocuments(query);
    const totalPages = Math.ceil(total / size) || 1;
    const skip = (page - 1) * size;

    const tasks = await Task.find(query)
      .sort({ deadline: 1, createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate('createdBy', 'name email');

    // Populate assigned users for each task from TaskAssignment collection
    const tasksWithAssignments = await Promise.all(
      tasks.map((taskDoc) => populateTaskWithAssignments(taskDoc))
    );

    return res.json({
      success: true,
      data: tasksWithAssignments,
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

// @desc    Get single task
// @route   GET /api/tasks/:taskId
// @access  Private (Project Member)
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('projectId', 'name description createdBy members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = task.projectId;
    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    const resultTask = await populateTaskWithAssignments(task);

    return res.json({
      success: true,
      data: resultTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details & assignments
// @route   PATCH /api/tasks/:taskId
// @access  Private (Project Member)
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { description, assignedUsers, deadline, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { project, isMember } = await checkProjectMembership(task.projectId, req.user._id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task description cannot be empty',
        });
      }
      task.description = description.trim();
    }

    if (deadline !== undefined) {
      if (isNaN(Date.parse(deadline))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid deadline date',
        });
      }
      task.deadline = new Date(deadline);
    }

    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${TASK_STATUSES.join(', ')}`,
        });
      }
      task.status = status;
    }

    await task.save();

    // Update TaskAssignments collection if assignedUsers array is provided
    if (Array.isArray(assignedUsers)) {
      const invalidUsers = assignedUsers.filter(
        (uId) => !project.members.some((m) => m.toString() === uId.toString())
      );

      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign users who are not project members',
        });
      }

      // Delete existing assignments for this task
      await TaskAssignment.deleteMany({ taskId });

      // Insert new assignments
      if (assignedUsers.length > 0) {
        const newAssignments = assignedUsers.map((uId) => ({
          taskId,
          userId: uId,
          assignedBy: req.user._id,
        }));
        await TaskAssignment.insertMany(newAssignments);
      }
    }

    const updatedTaskDoc = await Task.findById(taskId).populate('createdBy', 'name email');
    const resultTask = await populateTaskWithAssignments(updatedTaskDoc);

    return res.json({
      success: true,
      data: resultTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:taskId/status
// @access  Private (Project Member)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${TASK_STATUSES.join(', ')}`,
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { isMember } = await checkProjectMembership(task.projectId, req.user._id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a member of this project',
      });
    }

    task.status = status;
    await task.save();

    const updatedTaskDoc = await Task.findById(taskId).populate('createdBy', 'name email');
    const resultTask = await populateTaskWithAssignments(updatedTaskDoc);

    return res.json({
      success: true,
      data: resultTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Project Owner or Task Creator)
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { isOwner } = await checkProjectMembership(task.projectId, req.user._id);
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner or task creator can delete this task',
      });
    }

    // Cascade delete task assignments
    await TaskAssignment.deleteMany({ taskId });

    // Delete task document
    await task.deleteOne();

    return res.json({
      success: true,
      message: 'Task and its assignments deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
