import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  f_Image: {
    type: String, // Assuming this is a URL or file path to the image
    required: false
  },
  f_Name: {
    type: String,
    required: true
  },
  f_Email: {
    type: String,
    required: true,
    unique: true
  },
  f_Mobile: {
    type: Number,
    required: true,
    unique: true
  },
  f_Designation: {
    type: String,
    required: false
  },
  f_Gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'], // Restrict values to specific genders, optional
    required: false
  },
  f_Course: {
    type: String,
    required: false
  },
  f_Createdate: {
    type: Date,
    default: Date.now // Automatically set the date when the document is created
  }
});

// Create and export the model
export const Employee = mongoose.model('Employee', employeeSchema);

