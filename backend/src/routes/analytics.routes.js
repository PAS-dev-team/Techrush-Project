const { Router } = require("express");
const analyticsController = require("../controllers/analytics.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = Router();

router.use(authenticate);

router.get("/dashboard", authorize("ORGANIZER", "ADMIN"), analyticsController.getDashboardSummary);
router.get("/events/:eventId", authorize("ORGANIZER", "ADMIN"), analyticsController.getEventAnalytics);

module.exports = router;
