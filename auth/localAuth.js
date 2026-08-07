const users = [];

export function registerUser({ name, email, phone, password }) {
  const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, message: 'Email sudah terdaftar.' };
  }
  users.push({ name, email: email.toLowerCase(), phone, password });
  return { success: true };
}

export function findUser(email, password) {
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
}

export function isEmailRegistered(email) {
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
}
