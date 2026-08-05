const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  venue: z.string().min(2, "Venue is required"),
  capacity: z.coerce.number().positive("Capacity must be a positive number"),
  startTime: z.string().datetime({ message: "Invalid start time format" }),
  endTime: z.string().datetime({ message: "Invalid end time format" }),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  bannerImage: z.string().url("Invalid image URL").optional().nullable(),
});

const updateEventSchema = createEventSchema.partial();

const assignVolunteerSchema = z.object({
  volunteerId: z.coerce.number().positive("Valid volunteer ID is required"),
  task: z.string().min(3, "Task description is required"),
  remarks: z.string().optional(),
});

const updateVolunteerStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  remarks: z.string().optional(),
});

const checkInSchema = z.object({
  checkedIn: z.boolean().optional(),
  checkedOut: z.boolean().optional(),
});

const verifyQrSchema = z.object({
  qrToken: z.string().min(1, "QR token is required"),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  assignVolunteerSchema,
  updateVolunteerStatusSchema,
  checkInSchema,
  verifyQrSchema,
};
