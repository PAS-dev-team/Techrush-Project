const prisma = require("../config/db");

class UserRepository {
  create(data) {
    return prisma.user.create({ data });
  }

  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByGoogleId(googleId) {
    return prisma.user.findUnique({ where: { googleId } });
  }

  findAll() {
    return prisma.user.findMany();
  }

  updateRole(id, role) {
    return prisma.user.update({ where: { id }, data: { role, roleSelected: true } });
  }

  linkGoogleId(id, googleId) {
    return prisma.user.update({ where: { id }, data: { googleId } });
  }

  createGoogleUser({ name, email, googleId }) {
    return prisma.user.create({
      data: { name, email, googleId, roleSelected: false },
    });
  }

  updateProfile(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserRepository();