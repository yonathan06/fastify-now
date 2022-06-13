import { NowRequestHandler } from 'fastify-now';

export const GET: NowRequestHandler = async () => {
  return { message: 'hello world' };
};
