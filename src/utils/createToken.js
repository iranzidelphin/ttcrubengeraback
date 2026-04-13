import jwt from 'jsonwebtoken';

export function createToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing. Add it to backend/.env');
  }

  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });
}
