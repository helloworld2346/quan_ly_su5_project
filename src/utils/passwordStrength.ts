export const MIN_PASSWORD_LENGTH = 6;

export type StrengthLevel = "weak" | "medium" | "strong";

export type PasswordStrength = {
  level: StrengthLevel;
  label: string;
} | null;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return null;

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", label: "Yếu" };
  if (score <= 3) return { level: "medium", label: "Trung bình" };
  return { level: "strong", label: "Mạnh" };
}
