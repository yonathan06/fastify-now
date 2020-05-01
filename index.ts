import path from 'path';
import fs from 'fs';
import Http from 'http';
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';

const SupportedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

function registerRoutes(
  server: FastifyInstance,
  folder = path.join(process.cwd(), './src/routes'),
  pathPrefix = ''
) {
  fs.readdirSync(folder, { withFileTypes: true }).forEach((folderOrFile) => {
    const currentPath = path.join(folder, folderOrFile.name);
    const routeServerPath = `${pathPrefix}/${folderOrFile.name}`;
    if (folderOrFile.isDirectory()) {
      registerRoutes(server, currentPath, routeServerPath);
    } else if (folderOrFile.isFile()) {
      if (!folderOrFile.name.endsWith('.js')) {
        return;
      }
      let fileRouteServerPath = pathPrefix;
      if (folderOrFile.name !== 'index.js') {
        fileRouteServerPath += '/' + folderOrFile.name.replace('.js', '');
      }
      if (fileRouteServerPath.length === 0) {
        fileRouteServerPath = '/';
      }
      let module = require(currentPath);
      SupportedMethods.forEach((method) => {
        addModuleMethod(module, method, server, fileRouteServerPath);
      });
    }
  });
}

function addModuleMethod(
  module: any,
  method: string,
  server: fastify.FastifyInstance,
  fileRouteServerPath: string
) {
  if (module[method]) {
    const methodFunctionName = method.toLowerCase();
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    server[methodFunctionName](
      fileRouteServerPath,
      module[method].opts || {},
      (req: FastifyRequest, reply: FastifyReply<Http.ServerResponse>) => {
        module[method](req, reply)
          .then((response) => {
            if (response) {
              reply.send(response);
            }
          })
          .catch((error) => {
            server.log.error(error);
            if (!reply.sent) {
              reply.status(500).send({ message: 'Internal server error' });
            }
          });
      }
    );
  }
}

interface FastifyNowOpts {
  routesFolder?: string,
  pathPrefix?: string,
}

function fastifyNow(
  server: FastifyInstance,
  opts?: FastifyNowOpts,
  next?: () => void
) {
  try {
    registerRoutes(server, opts.routesFolder, opts.pathPrefix);
  } catch (error) {
    server.log.error(`fastify-now: error registering routers:`);
    server.log.error(error);
  }
  next();
}

declare module 'fastify' {
  interface NowRequestHandler extends fastify.RequestHandler {
    opts?: fastify.RouteShorthandOptions;
  }
}

export default fp(fastifyNow);