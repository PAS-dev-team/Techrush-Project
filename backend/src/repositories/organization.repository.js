const prisma = require("../config/db");

class OrganizationRepository {
  findByOrganizerId(organizerId) {
    return prisma.organization.findUnique({ where: { organizerId } });
  }

  upsertForOrganizer(organizerId, data) {
    return prisma.organization.upsert({
      where: { organizerId },
      create: { ...data, organizerId },
      update: data,
    });
  }
}

module.exports = new OrganizationRepository();
