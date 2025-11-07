const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
      trim: true,
    },
    bug: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bug',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    flags: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        reason: {
          type: String,
          required: [true, 'Please provide a reason for flagging'],
          maxlength: [500, 'Reason cannot be more than 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent user from submitting more than one comment per bug
CommentSchema.index({ bug: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
CommentSchema.statics.getAverageRating = async function (bugId) {
  const obj = await this.aggregate([
    {
      $match: { bug: bugId },
    },
    {
      $group: {
        _id: '$bug',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Bug').findByIdAndUpdate(bugId, {
      averageRating: obj[0] ? obj[0].averageRating : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
CommentSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.bug);
});

// Call getAverageRating before remove
CommentSchema.pre('remove', async function () {
  await this.constructor.getAverageRating(this.bug);
});

module.exports = mongoose.model('Comment', CommentSchema);
