import path from 'path';
import fs from 'fs';
import {
  FastifyInstance,
  RawServerBase,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault,
  RouteShorthandOptions,
  FastifyPluginCallback,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';
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

const typeScriptEnabled = Boolean(
  process[Symbol.for('ts-node.register.instance')] || process.env.TS_NODE_DEV,
);

const extensions = ['.js'];
if (typeScriptEnabled) {
  extensions.push('.ts');
}

const isRoute = (ext: string) => extensions.includes(ext);
const isTest = (name: string) => name.endsWith('.test') || name.endsWith('.spec');
const isDeclaration = (name: string, ext: string) => ext === '.ts' && name.endsWith('.d');

function addRequestHandler(
  module: { [key in HTTPMethod]: NowRequestHandler },
  method: HTTPMethod,
  server: FastifyInstance,
  fileRouteServerPath: string,
) {
  const handler = module[method.toUpperCase()] as NowRequestHandler;
  if (handler) {
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    server[method](fileRouteServerPath, handler.opts || {}, handler);
  }
}

export function registerRoutes(server: FastifyInstance, folder: string, pathPrefix = '') {
  fs.readdirSync(folder, { withFileTypes: true }).forEach((folderOrFile) => {
    const currentPath = path.join(folder, folderOrFile.name);
    const routeServerPath = `${pathPrefix}/${folderOrFile.name.replace('[', ':').replace(']', '')}`;
    if (folderOrFile.isDirectory()) {
      registerRoutes(server, currentPath, routeServerPath);
    } else if (folderOrFile.isFile()) {
      const { ext, name } = path.parse(folderOrFile.name);
      if (!isRoute(ext) || isTest(name) || isDeclaration(name, ext)) {
        return;
      }
      let fileRouteServerPath = pathPrefix;
      if (name !== 'index') {
        fileRouteServerPath += '/' + name.replace('[', ':').replace(/\]?$/, '');
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

const fastifyNow: FastifyPluginCallback<FastifyNowOpts> = (
  server: FastifyInstance,
  opts: FastifyNowOpts,
  next: (error?: any) => void,
) => {
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
};

type NowRouteHandlerMethod<
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<
    RawServer
  >,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault
> = (
  this: FastifyInstance<RawServer, RawRequest, RawReply>,
  request: FastifyRequest<RouteGeneric, RawServer, RawRequest>,
  reply: FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>,
  server: FastifyInstance<RawServer, RawRequest, RawReply>,
) => RouteGeneric['Reply'] | Promise<RouteGeneric['Reply']>;

export interface NowRequestHandler<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault,
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<
    RawServer
  >,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>
> extends NowRouteHandlerMethod<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig> {
  opts?: RouteShorthandOptions<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>;
}

export default fp<FastifyNowOpts>(fastifyNow);
