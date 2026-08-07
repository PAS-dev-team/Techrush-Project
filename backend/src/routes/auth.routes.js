const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema, selectRoleSchema, updateProfileSchema } = require("../validators/auth.validator");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.patch("/role", authenticate, validate(selectRoleSchema), authController.selectRole);
router.patch("/profile", authenticate, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;

