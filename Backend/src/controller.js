import { Employee } from "./models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "./utils/asyncHandler.js";
import { uploadOnCloudinary } from "./utils/cloudinary.js";
import { z, ZodError } from "zod";
import { generateAccessToken, generateRefreshToken } from "./utils/token.js";
// import bcrypt from "bcrypt";

const options = {
  httpOnly: true,
  secure: true,   
  sameSite: 'None',
}
// Refresh token endpoint set new accesstoken
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken)
    return res.status(401).json({ message: "Refresh token is required" });
  try {
    // Verify refresh token with the secret
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = { username: decoded.username };

    if (!user) {
      throw new Error({ message: "Invalid refresh token" });
    }
  
    // Generate a new access token
    const newAccessToken = generateAccessToken(user);


    // Set the new access token in an HTTP-only, secure cookie
    res.cookie("accessToken", newAccessToken, {
      options
    });

    res.status(200).json({ message: "Access token refreshed", accessToken: newAccessToken });
  } catch (err) {
    // Check if error is due to token expiration
    if (err.name === "TokenExpiredError") {
      res.status(403).json({ message: "Refresh token expired" });
    } else {
      res.status(403).json({ message: "Invalid refresh token" });
    }
  }
});

// login
export const login = asyncHandler(async (req, res) => {
  const { DEFAULT_USERNAME, DEFAULT_PASSWORD } = process.env;
  // const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  try {
    const { username, password } = loginSchema.parse(req.body);

    if (username !== DEFAULT_USERNAME || password !== DEFAULT_PASSWORD) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // as the password and username are not saving in the database so there is no need of encrypting the password
    // const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    // if (!isPasswordMatch) {
    //   return res.status(401).json({ message: "Invalid username or password" });
    // }
    const user = { username };
    console.log(user , " from login");
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);
    res.status(200).json({message:"Logged in Successfully", data: {user,refreshToken,accessToken}});
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: error.issues });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// logout
export const logout = (req, res) => {
  
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged Out" });
};
// creating employee controller
const employeeSchema = z.object({
  f_Name: z.string(),
  f_Email: z.string().email(),
  f_Mobile: z.string(),
  f_Designation: z.string(),
  f_Gender: z.enum(["Male", "Female", "Other"]),
  f_Course: z.string(),
});
export const createEmployee = asyncHandler(async (req, res) => {
  try {
    const { f_Name, f_Email, f_Mobile, f_Designation, f_Gender, f_Course } =
      employeeSchema.parse(req.body);

    // Check for existing employee
    const existingEmployee = await Employee.findOne({
      $or: [{ f_Email }, { f_Mobile }],
    });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee with the email, or mobile already exists.",
      });
    }

    // Check if file exists in request
    const file = req.file; // Note: Changed from req.files?.f_Image[0] to req.file
    if (!file) {
      return res.status(400).json({ message: "Please attach a file" });
    }

    // Validate file type
    const allowedFormats = ["image/jpeg", "image/png"];
    if (!allowedFormats.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only JPG or PNG formats are allowed." });
    }

    // Upload to Cloudinary using buffer
    const avatar = await uploadOnCloudinary(file.buffer, file.mimetype);
    if (!avatar) {
      return res.status(400).json({
        message: "Error uploading to Cloudinary",
      });
    }

    // Create the new employee
    const newEmployee = await Employee.create({
      f_Image: avatar.url,
      f_Name,
      f_Email,
      f_Mobile,
      f_Designation,
      f_Gender,
      f_Course,
    });

    res
      .status(201)
      .json({ message: "Employee created successfully", data: newEmployee });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: error.issues });
    } else {
      console.error("Error in createEmployee:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Get all employees
export const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find();
  res.status(200).json({ data: employees });
});

// Get a single employee by ID
export const getEmployeeById = asyncHandler(async (req, res) => {
  const employeeIdSchema = z.object({
    id: z.string().nonempty(),
  });

  try {
    const { id } = employeeIdSchema.parse(req.params);
    const employee = await Employee.findOne({ _id: id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ data: employee });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: error.issues });
    } else {
      console.error("Error in getEmployeeById:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
});

const editEmployeeSchema = z.object({
  f_Name: z.string().trim().min(1).optional(),
  f_Email: z.string().email().toLowerCase().optional(),
  f_Mobile: z.preprocess((val) => {
    if (val === "" || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().int().positive().optional()),
  f_Designation: z.enum(["HR", "Manager", "Sales"]).optional(),
  f_Gender: z.enum(["Male", "Female", "Other"]).optional(),
  f_Course: z.enum(["MCA", "BCA", "BSC"]).optional(),
});

// Utility function for file validation
// Utility function for file validation
const checkFileValidity = (file) => {
  const allowedFormats = ["image/jpeg", "image/png"];
  if (!allowedFormats.includes(file.mimetype)) {
    return {
      isValid: false,
      message: "Only JPG or PNG formats are allowed.",
    };
  }
  return {
    isValid: true,
    message: "File is valid",
  };
};

export const editEmployee = async (req, res) => {
  try {
    const { Employee_Id } = req.params;
    const data = req.body;
    const file = req.file; // Using req.file instead of req.files

    // Early validation
    if (!Employee_Id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Get existing employee
    const existingEmployee = await Employee.findById(Employee_Id);
    if (!existingEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Parallel processing for validation and file check
    const validationResult = await editEmployeeSchema.safeParseAsync(data);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: validationResult.error.errors,
      });
    }

    let avatarUrl = existingEmployee.f_Image; // Keep existing image by default

    // Handle file upload if new file is provided
    if (file) {
      // Check file validity
      const fileCheck = checkFileValidity(file);
      if (!fileCheck.isValid) {
        return res.status(400).json({ message: fileCheck.message });
      }

      // Upload to Cloudinary using buffer
      const avatar = await uploadOnCloudinary(file.buffer, file.mimetype);
      if (!avatar) {
        return res.status(400).json({
          message: "Error uploading to Cloudinary",
        });
      }
      avatarUrl = avatar.url;
    }

    // Update employee with validated data
    const updatedEmployee = await Employee.findByIdAndUpdate(
      Employee_Id,
      {
        $set: {
          ...validationResult.data,
          f_Image: avatarUrl,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  const { id } = req.params;
  if (!avatarLocalPath) {
    throw new Error({ message: "Avatar file is missing" });
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new Error({ message: "Error while uploading on avatar" });
  }

  const user = await Employee.findByIdAndUpdate(id, {
    $set: {
      f_Image: avatar.url,
    },
  });
  return res.status(200).json({ message: "avatar updated successfully" });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const { Employee_Id } = req.params;

  const user = await Employee.findByIdAndDelete(Employee_Id);

  if (!user) {
    return res.status(403).json({ message: "Not able to delete " });
  }
  res.status(200).json({ message: "Deleted", data: user });
});
