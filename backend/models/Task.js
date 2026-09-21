const mongoose = require('mongoose');

const TASK_STATUSES = ['in-progress', 'review', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be one of: in-progress, review, completed',
      },
      default: 'in-progress',
      index: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for dynamic overdue check
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed') return false;
  return this.deadline && new Date(this.deadline) < new Date();
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  TASK_STATUSES,
};
