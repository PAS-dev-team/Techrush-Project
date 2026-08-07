const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const { signToken } = require("../config/jwt");
const { verifyGoogleIdToken } = require("../config/google");
const { AppError } = require("../utils/response");

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    roleSelected: user.roleSelected,
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
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      roleSelected: false,
    });

    const token = signToken(user);
    return { token, user: toSafeUser(user) };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user);
    return { token, user: toSafeUser(user) };
  }

  async googleAuth(idToken) {
    let payload;

    try {
      payload = await verifyGoogleIdToken(idToken);
    } catch (err) {
      throw new AppError("Invalid Google credential", 401);
    }

    if (!payload || !payload.email) {
      throw new AppError("Invalid Google credential", 401);
    }

    if (payload.email_verified === false) {
      throw new AppError("Your Google account's email isn't verified", 401);
    }

    let user = await userRepository.findByGoogleId(payload.sub);

    if (!user) {
      // No account linked to this Google identity yet. If an
      // email/password account already exists with the same email,
      // link Google to it instead of creating a duplicate user.
      const existingByEmail = await userRepository.findByEmail(payload.email);

      user = existingByEmail
        ? await userRepository.linkGoogleId(existingByEmail.id, payload.sub)
        : await userRepository.createGoogleUser({
            name: payload.name || payload.email.split("@")[0],
            email: payload.email,
            googleId: payload.sub,
          });
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

  async selectRole(id, role) {
    const existing = await userRepository.findById(id);

    if (!existing) {
      throw new AppError("User not found", 404);
    }

    const prismaRole = role.toUpperCase(); // "organizer" -> "ORGANIZER" etc.
    const user = await userRepository.updateRole(id, prismaRole);

    // Reissue the token so its embedded role claim (and anything the
    // client reads from it) reflects the new role immediately.
    const token = signToken(user);
    return { token, user: toSafeUser(user) };
  }

  async updateProfile(id, { name, phone }) {
    const existing = await userRepository.findById(id);

    if (!existing) {
      throw new AppError("User not found", 404);
    }

    const user = await userRepository.updateProfile(id, {
      name,
      phone: phone ?? null,
    });

    return toSafeUser(user);
  }
}

module.exports = new AuthService();