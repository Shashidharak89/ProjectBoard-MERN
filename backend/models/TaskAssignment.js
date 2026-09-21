const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate assignment of the same user to the same task
taskAssignmentSchema.index({ taskId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);
