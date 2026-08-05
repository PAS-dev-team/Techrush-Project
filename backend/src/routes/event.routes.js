const { Router } = require("express");
const eventController = require("../controllers/event.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  createEventSchema,
  updateEventSchema,
  assignVolunteerSchema,
  updateVolunteerStatusSchema,
  checkInSchema,
  verifyQrSchema,
} = require("../validators/event.validator");

const router = Router();

// All event routes require authentication
router.use(authenticate);

// Public/Available volunteers lookup
router.get("/volunteers/available", eventController.getAvailableVolunteers);

// Event CRUD
router.post("/", authorize("ORGANIZER", "ADMIN"), validate(createEventSchema), eventController.create);
router.get("/", authorize("ORGANIZER", "ADMIN"), eventController.getAll);
router.get("/:id", eventController.getOne);
router.put("/:id", authorize("ORGANIZER", "ADMIN"), validate(updateEventSchema), eventController.update);
router.delete("/:id", authorize("ORGANIZER", "ADMIN"), eventController.delete);

// Event Attendee Registrations & Attendance Check-in
router.get("/:eventId/registrations", authorize("ORGANIZER", "ADMIN", "VOLUNTEER"), eventController.getRegistrations);
router.patch(
  "/:eventId/registrations/:id/checkin",
  authorize("ORGANIZER", "ADMIN", "VOLUNTEER"),
  validate(checkInSchema),
  eventController.checkInAttendee
);
router.post(
  "/:eventId/registrations/verify-qr",
  authorize("ORGANIZER", "ADMIN", "VOLUNTEER"),
  validate(verifyQrSchema),
  eventController.verifyQrToken
);

// Event Volunteers Management & Attendance
router.get("/:eventId/volunteers", authorize("ORGANIZER", "ADMIN"), eventController.getVolunteers);
router.post(
  "/:eventId/volunteers",
  authorize("ORGANIZER", "ADMIN"),
  validate(assignVolunteerSchema),
  eventController.assignVolunteer
);
router.patch(
  "/:eventId/volunteers/:id/status",
  authorize("ORGANIZER", "ADMIN", "VOLUNTEER"),
  validate(updateVolunteerStatusSchema),
  eventController.updateVolunteerStatus
);
router.patch(
  "/:eventId/volunteers/:id/checkin",
  authorize("ORGANIZER", "ADMIN"),
  validate(checkInSchema),
  eventController.checkInVolunteer
);

module.exports = router;
