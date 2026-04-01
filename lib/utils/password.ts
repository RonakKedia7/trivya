import 'server-only';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

export function isStrongPassword(password: string) {
  return PASSWORD_REGEX.test(password);
}

export function getPasswordValidationMessage() {
  return 'Password must be 8-64 characters and include uppercase, lowercase, number, and special character.';
}

export function generateTemporaryPassword(length = 14) {
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}';
  const all = `${lowercase}${uppercase}${numbers}${symbols}`;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(lowercase), pick(uppercase), pick(numbers), pick(symbols)];
  const remaining = Array.from({ length: Math.max(length - required.length, 0) }, () => pick(all));
  const raw = [...required, ...remaining];

  for (let i = raw.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]];
  }

  return raw.join('');
}
