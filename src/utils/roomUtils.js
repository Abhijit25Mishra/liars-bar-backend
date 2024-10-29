export const generateRandomPassword = (length = 6) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
