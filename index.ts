import path from 'path';
import fs from 'fs';
import {
  FastifyInstance,
  RawServerBase,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RequestGenericInterface,
  ContextConfigDefault,
  RouteHandlerMethod,
  RouteShorthandOptions,
} from 'fastify';
import fp from 'fastify-plugin';

enum HTTPMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTIONS = 'options',
  PATCH = 'patch',
  HEAD = 'head',
  CONNECT = 'connect',
  TRACE = 'trace',
}

function addRequestHandler(
  module: any,
  method: HTTPMethod,
  server: FastifyInstance,
  fileRouteServerPath: string,
) {
  server.get();
  const handler = module[method.toUpperCase()] as NowRequestHandler;
  if (handler) {
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    server[method](fileRouteServerPath, handler.arguments[0] || {}, handler);
  }
}

export function registerRoutes(server: FastifyInstance, folder: string, pathPrefix = '') {
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
      const module = require(currentPath);
      Object.values(HTTPMethod).forEach((method) => {
        addRequestHandler(module, method, server, fileRouteServerPath);
      });
    }
  });
}

interface FastifyNowOpts {
  routesFolder: string;
  pathPrefix?: string;
}

function fastifyNow(server: FastifyInstance, opts: FastifyNowOpts, next?: (error?: any) => void) {
  if (!(opts && opts.routesFolder)) {
    next(new Error('fastify-now: must provide opts.routesFolder'));
    return;
  }
  try {
    registerRoutes(server, opts.routesFolder, opts.pathPrefix);
    next();
  } catch (error) {
    next(new Error(`fastify-now: error registering routers: ${error.message}`));
  }
}

export interface NowRequestHandler<
  RequestGeneric extends RequestGenericInterface = RequestGenericInterface,
  ContextConfig = ContextConfigDefault
> extends RouteHandlerMethod<RawServer, RawRequest, RawReply, RequestGeneric, ContextConfig> {
  opts?: RouteShorthandOptions<RawServer, RawRequest, RawReply, RequestGeneric, ContextConfig>;
}

export default fp(fastifyNow);
