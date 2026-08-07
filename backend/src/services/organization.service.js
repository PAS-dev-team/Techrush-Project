const organizationRepository = require("../repositories/organization.repository");

class OrganizationService {
  async getMine(organizerId) {
    const org = await organizationRepository.findByOrganizerId(organizerId);
    return org || null;
  }

  async saveMine(organizerId, { name, type, contactEmail, address }) {
    return organizationRepository.upsertForOrganizer(organizerId, {
      name,
      type,
      contactEmail: contactEmail ?? null,
      address: address ?? null,
    });
  }
}

module.exports = new OrganizationService();
