const authService = require('./auth.service');
const { handleValidationErrors } = require('./auth.validator');

class AuthController {
  async register(req, res) {
    const result = await authService.register(req.body);
    return res.status(result.statusCode).json(result);
  }

  async login(req, res) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(result.statusCode).json(result);
  }

  async refreshToken(req, res) {
    const userId = req.user.id;
    const result = await authService.refreshToken(userId);
    return res.status(result.statusCode).json(result);
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    return res.status(result.statusCode).json(result);
  }

  async getProfile(req, res) {
    const userId = req.user.id;
    const result = await authService.getProfile(userId);
    return res.status(result.statusCode).json(result);
  }

  async logout(req, res) {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
}

module.exports = new AuthController();
