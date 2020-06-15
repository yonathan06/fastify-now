import { NowRequestHandler } from 'fastify-now';

export const GET: NowRequestHandler = async (req, rep) => {
  return { message: 'hello world' };
};
