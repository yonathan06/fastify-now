import fastify from 'fastify';
import path from "path";
import fastifyNow from '../../index';

export const initServer = async () => {
  const server = fastify();
  server.register(fastifyNow, {
    routesFolder: path.join(__dirname, './routes')
  });
  const PORT = Number(process.env.PORT) || 5000;
  await server.listen(PORT);
  return server;
};
