import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};
