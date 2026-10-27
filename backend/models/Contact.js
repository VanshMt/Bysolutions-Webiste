const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email address cannot exceed 254 characters'],
      index: true
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    service: {
      type: String,
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters long'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['contact', 'quote'],
        message: '{VALUE} is not a valid submission type'
      },
      default: 'contact'
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'new'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
);

// Additional compound index for efficient status-filtered date queries
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
