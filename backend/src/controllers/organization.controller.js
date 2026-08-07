const organizationService = require("../services/organization.service");
const { success } = require("../utils/response");

class OrganizationController {
  async getMine(req, res, next) {
    try {
      const org = await organizationService.getMine(req.user.id);
      return success(res, org, "Organization details");
    } catch (err) {
      next(err);
    }
  }

  async saveMine(req, res, next) {
    try {
      const org = await organizationService.saveMine(req.user.id, req.body);
      return success(res, org, "Organization details saved");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrganizationController();
