export const PASSWORD_POLICY_TEXT =
  '8-64 chars, uppercase, lowercase, number, and special character required.';

export function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/.test(password);
}
