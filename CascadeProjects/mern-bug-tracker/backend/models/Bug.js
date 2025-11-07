const mongoose = require('mongoose');
const validator = require('validator');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  dueDate: {
    type: Date
  },
  labels: [{
    type: String,
    trim: true
  }],
  attachments: [{
    url: String,
    name: String,
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search functionality
bugSchema.index({ 
  title: 'text', 
  description: 'text',
  'comments.text': 'text' 
});

// Virtual for comments
bugSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'bug',
  justOne: false
});

// Query middleware to populate comments
bugSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name email'
  }).populate({
    path: 'assignedTo',
    select: 'name email'
  });
  
  next();
});

// Static method to get bugs by status
bugSchema.statics.getBugsByStatus = async function(projectId) {
  return this.aggregate([
    {
      $match: { project: projectId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        bugs: { $push: '$$ROOT' }
      }
    }
  ]);
};

// Instance method to update bug status
bugSchema.methods.updateStatus = async function(newStatus) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add status change history
  this.statusHistory = this.statusHistory || [];
  this.statusHistory.push({
    from: oldStatus,
    to: newStatus,
    changedAt: new Date()
  });
  
  await this.save();
  return this;
};

// Add pre-save validation
bugSchema.pre('save', function(next) {
  // Validate due date if it exists
  if (this.dueDate && this.dueDate < Date.now()) {
    throw new Error('Due date must be in the future');
  }
  
  // Validate labels
  if (this.labels && this.labels.length > 5) {
    throw new Error('Cannot have more than 5 labels');
  }
  
  next();
});

const Bug = mongoose.model('Bug', bugSchema);

module.exports = Bug;
