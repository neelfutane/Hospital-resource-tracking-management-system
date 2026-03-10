const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

class AuthService {
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role, department } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return ApiResponse.conflict('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role || 'VIEWER',
          department,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`New user registered: ${email}`);

      return ApiResponse.success(
        { user, token },
        'User registered successfully',
        201
      );
    } catch (error) {
      logger.error('Registration error:', error);
      return ApiResponse.error('Registration failed', 500);
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return ApiResponse.unauthorized('Invalid email or password');
      }

      if (!user.isActive) {
        return ApiResponse.unauthorized('Account is deactivated');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return ApiResponse.unauthorized('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${email}`);

      return ApiResponse.success(
        { user: userWithoutPassword, token },
        'Login successful'
      );
    } catch (error) {
      logger.error('Login error:', error);
      return ApiResponse.error('Login failed', 500);
    }
  }

  async refreshToken(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return ApiResponse.unauthorized('Invalid user');
      }

      const token = this.generateToken(user);

      return ApiResponse.success(
        { user, token },
        'Token refreshed successfully'
      );
    } catch (error) {
      logger.error('Token refresh error:', error);
      return ApiResponse.error('Token refresh failed', 500);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return ApiResponse.notFound('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return ApiResponse.unauthorized('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      logger.info(`Password changed for user: ${user.email}`);

      return ApiResponse.success(null, 'Password changed successfully');
    } catch (error) {
      logger.error('Password change error:', error);
      return ApiResponse.error('Password change failed', 500);
    }
  }

  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  async getProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return ApiResponse.notFound('User not found');
      }

      return ApiResponse.success(user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      return ApiResponse.error('Failed to retrieve profile', 500);
    }
  }
}

module.exports = new AuthService();
