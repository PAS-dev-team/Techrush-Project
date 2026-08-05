const analyticsService = require("../services/analytics.service");
const { success } = require("../utils/response");

class AnalyticsController {
  async getDashboardSummary(req, res, next) {
    try {
      const data = await analyticsService.getDashboardSummary(req.user.id);
      return success(res, data, "Dashboard summary metrics retrieved");
    } catch (err) {
      next(err);
    }
  }

  async getEventAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getEventAnalytics(req.params.eventId);
      return success(res, data, "Event analytics retrieved");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
