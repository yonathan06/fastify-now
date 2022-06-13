import fastify from 'fastify';
import path from 'path';
import fastifyNow from '../../../index';

export const initServer = async (port: number) => {
  const server = fastify();
  server.register(fastifyNow, {
    routesFolder: path.join(__dirname, './routes'),
  });
  await server.listen({ port });
  return server;
};
