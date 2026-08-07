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

  async googleAuth(req, res, next) {
    try {
      const result = await authService.googleAuth(req.body.idToken);
      return success(res, result, "Signed in with Google");
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

  async selectRole(req, res, next) {
    try {
      const result = await authService.selectRole(req.user.id, req.body.role);
      return success(res, result, "Role updated");
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      return success(res, user, "Profile updated");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();