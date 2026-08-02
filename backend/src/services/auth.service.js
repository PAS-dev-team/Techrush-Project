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
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, passwordHash });

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
}

module.exports = new AuthService();