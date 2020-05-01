import fastify from 'fastify';
import path from "path";
import fastifyNow from 'fastify-now';

(async () => {
  const server = fastify({ logger: true });
  server.register(fastifyNow, {
    routesFolder: path.join(__dirname, './routes')
  });
  const PORT = Number(process.env.PORT) || 5000;
  await server.listen(PORT);
})().catch(console.error);
