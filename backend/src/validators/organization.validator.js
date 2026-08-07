const { z } = require("zod");

const ORG_TYPES = ["College / University", "Company", "Non-profit", "Community Group"];

const upsertOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  type: z.enum(ORG_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${ORG_TYPES.join(", ")}` }),
  }),
  contactEmail: z
    .string()
    .email("A valid contact email is required")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  address: z
    .string()
    .trim()
    .max(255, "Address looks too long")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

module.exports = { upsertOrganizationSchema, ORG_TYPES };
