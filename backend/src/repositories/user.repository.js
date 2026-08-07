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

  findAll() {
    return prisma.user.findMany();
  }

  updateRole(id, role) {
    return prisma.user.update({ where: { id }, data: { role } });
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