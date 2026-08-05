const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const { signToken } = require("../config/jwt");
const { AppError } = require("../utils/response");

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

class AuthService {
  async register({ name, email, password, role }) {
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || "ATTENDEE";
    const user = await userRepository.create({ name, email, passwordHash, role: userRole });

    const token = signToken(user);
    return { token, user: toSafeUser(user) };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user);
    return { token, user: toSafeUser(user) };
  }

  async me(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toSafeUser(user);
  }

  async updateProfile(id, { name, email }) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (email && email !== user.email) {
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        throw new AppError("Email is already in use", 409);
      }
    }

    const updated = await userRepository.update(id, {
      ...(name && { name }),
      ...(email && { email }),
    });

    return toSafeUser(updated);
  }

  async updatePassword(id, { currentPassword, newPassword }) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(id, { passwordHash });

    return { message: "Password updated successfully" };
  }
}

module.exports = new AuthService();