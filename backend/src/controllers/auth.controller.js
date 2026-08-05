const authService = require("../services/auth.service");
const { success } = require("../utils/response");

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return success(res, result, "Account created", 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return success(res, result, "Login successful");
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.id);
      return success(res, user, "Authenticated user");
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return success(res, updatedUser, "Profile updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const result = await authService.updatePassword(req.user.id, req.body);
      return success(res, result, "Password updated successfully");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();