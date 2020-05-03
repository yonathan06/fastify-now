import fastify from 'fastify';
import fastifyNow from '../../../index';

export const initServer = async (port: number) => {
  const server = fastify();
  server.register(fastifyNow);
  await server.listen(port);
  return server;
};
