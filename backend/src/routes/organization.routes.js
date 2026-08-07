const { Router } = require("express");
const organizationController = require("../controllers/organization.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/role");
const validate = require("../middleware/validate");
const { upsertOrganizationSchema } = require("../validators/organization.validator");

const router = Router();

// Organization details are an organizer-only concept for now.
router.use(authenticate, authorize("ORGANIZER"));

router.get("/me", organizationController.getMine);
router.put("/me", validate(upsertOrganizationSchema), organizationController.saveMine);

module.exports = router;
