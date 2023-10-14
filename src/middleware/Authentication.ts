import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { Context } from '../types';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) {
    throw new Error('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, 'yourSecretKey'); // Use your actual secret key

    context.payload = payload as any;
  } catch (err) {
    throw new Error('Not authenticated');
  }

  return next();
};