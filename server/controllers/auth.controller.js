const User = require('../models/User.model');
const { generateToken } = require('../utils/generateToken');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { success, error } = require('../utils/apiResponse');

const register = async (req, res) => {
  try {
    const { name, email, password, role, assignedWard } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role,
      assignedWard
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedWard: user.assignedWard
    };

    success(res, { user: userData, token }, 'User registered successfully', 201);
  } catch (err) {
    console.error('Registration error:', err);
    error(res, 'Registration failed', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return error(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedWard: user.assignedWard
    };

    success(res, { user: userData, token }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    error(res, 'Login failed', 500);
  }
};

module.exports = {
  register,
  login
};
