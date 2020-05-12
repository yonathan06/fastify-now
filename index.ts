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

export function registerRoutes(server: FastifyInstance, folder, pathPrefix = '') {
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
  const handler = module[method] as fastify.NowRequestHandler;
  if (handler) {
    const methodFunctionName = method.toLowerCase();
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    server[methodFunctionName](
      fileRouteServerPath,
      handler.opts || {},
      (req: FastifyRequest, reply: FastifyReply<Http.ServerResponse>) => {
        handler.bind(server)(req, reply)
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
  routesFolder: string;
  pathPrefix?: string;
}

function fastifyNow(
  server: FastifyInstance,
  opts: FastifyNowOpts,
  next?: (error?: any) => void
) {
  if (!(opts && opts.routesFolder)) {
    next(new Error('fastify-now: must provide opts.routesFolder'));
    return;
  }
  try {
    registerRoutes(server, opts.routesFolder, opts.pathPrefix);
    next();
  } catch (error) {
    next(new Error(`fastify-now: error registering routers: ${error.message}`))
  }
}

declare module 'fastify' {
  interface NowRequestHandler extends fastify.RequestHandler {
    opts?: fastify.RouteShorthandOptions;
  }
}

export default fp(fastifyNow);
