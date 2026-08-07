const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(20, "A valid Google credential is required"),
});

// Self-service role selection is limited to the three roles the
// role-selection page offers. ADMIN is intentionally excluded — it
// must never be settable by a user through this endpoint.
const selectRoleSchema = z.object({
  role: z.enum(["organizer", "volunteer", "attendee"], {
    errorMap: () => ({ message: "Role must be one of: organizer, volunteer, attendee" }),
  }),
});

// Email and role are intentionally excluded here — email changes need
// their own (unbuilt) verification flow, and role changes go through
// selectRoleSchema/PATCH /role instead.
const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number looks too long")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

module.exports = { registerSchema, loginSchema, googleAuthSchema, selectRoleSchema, updateProfileSchema };