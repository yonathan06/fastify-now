import fastify from "fastify";

export const GET: fastify.NowRequestHandler = async (req, rep) => {
  return { message: 'hello world' };
}