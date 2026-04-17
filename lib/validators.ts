import { z } from "zod";

const NAME_MAX = 60;
const EMAIL_MAX = 254;
const NOTE_MAX = 200;
const PIZZA_TYPE_MAX = 60;
const LOCATION_MAX = 80;
const PASSWORD_MIN = 12;
const PASSWORD_MAX = 128;
const AMOUNT_MIN = 0.25;
const AMOUNT_MAX = 10;
const DATE_MAX_PAST_DAYS = 365;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(EMAIL_MAX)
  .email("Ungültige E-Mail-Adresse.");

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Passwort muss mindestens ${PASSWORD_MIN} Zeichen lang sein.`)
  .max(PASSWORD_MAX, "Passwort ist zu lang.");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name darf nicht leer sein.")
  .max(NAME_MAX, `Name darf maximal ${NAME_MAX} Zeichen lang sein.`);

export const setupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(EMAIL_MAX),
  password: z.string().min(1).max(PASSWORD_MAX),
});

export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export const adminResetPasswordSchema = z.object({
  userId: z.string().min(1).max(64),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(PASSWORD_MAX),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1).max(PASSWORD_MAX),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Neue Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: nameSchema,
});

// Only emojis or a short string (server-side whitelist by regex: emoji / single grapheme)
// Accept 1–8 chars to cover multi-codepoint emojis (ZWJ sequences etc.)
export const avatarSchema = z
  .string()
  .min(1, "Avatar fehlt.")
  .max(8, "Avatar ist zu lang.")
  .refine(
    (s) => !/[<>"'`\\]/.test(s),
    "Avatar enthält ungültige Zeichen."
  );

function maxPastDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const addPizzaEntrySchema = z.object({
  amount: z
    .number()
    .finite()
    .min(AMOUNT_MIN, "Menge zu klein.")
    .max(AMOUNT_MAX, "Menge zu groß."),
  note: z.string().trim().max(NOTE_MAX).optional().nullable(),
  pizzaType: z.string().trim().max(PIZZA_TYPE_MAX).optional().nullable(),
  location: z.string().trim().max(LOCATION_MAX).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  selectedUserIds: z.array(z.string().min(1).max(64)).max(20).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datumsformat.")
    .refine((s) => {
      const d = new Date(`${s}T12:00:00`);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return d <= now && d >= maxPastDate(DATE_MAX_PAST_DAYS);
    }, "Datum liegt außerhalb des erlaubten Bereichs.")
    .optional(),
});

export const optionNameSchema = z
  .string()
  .trim()
  .min(1, "Name darf nicht leer sein.")
  .max(PIZZA_TYPE_MAX);

export const idSchema = z.string().min(1).max(64);

export type AddPizzaEntryInput = z.infer<typeof addPizzaEntrySchema>;

export function formatZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Ungültige Eingabe.";
}
