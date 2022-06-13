import path from 'path';
import fs from 'fs';
import fp from 'fastify-plugin';
import type {
  FastifyInstance,
  RawServerBase,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault,
  RouteShorthandOptions,
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
  HTTPMethods,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

const methods: HTTPMethods[] = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'];

const typeScriptEnabled = Boolean(
  // @ts-expect-error 7053 https://github.com/TypeStrong/ts-node/issues/846#issuecomment-631828160
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
  module: { [key in HTTPMethods]: NowRequestHandler },
  method: HTTPMethods,
  server: FastifyInstance,
  fileRouteServerPath: string,
) {
  const handler = module[method] as NowRequestHandler;
  if (handler) {
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    // @ts-expect-error 2551
    server[method.toLowerCase()](fileRouteServerPath, handler.opts || {}, handler);
  }
}

export async function registerRoutes(server: FastifyInstance, folder: string, pathPrefix = '') {
  const registerRoutesFolders = fs
    .readdirSync(folder, { withFileTypes: true })
    .map(async (folderOrFile) => {
      const currentPath = path.join(folder, folderOrFile.name);
      const routeServerPath = `${pathPrefix}/${folderOrFile.name
        .replace('[', ':')
        .replace(']', '')}`;
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
        const module = await import(currentPath);
        Object.values(methods).forEach((method) => {
          addRequestHandler(module, method as HTTPMethods, server, fileRouteServerPath);
        });
      }
    });
  await Promise.all(registerRoutesFolders);
}

interface FastifyNowOpts {
  routesFolder: string;
  pathPrefix?: string;
}

const fastifyNow: FastifyPluginAsync<FastifyNowOpts> = async (
  server: FastifyInstance,
  opts: FastifyNowOpts,
) => {
  if (!(opts && opts.routesFolder)) {
    throw new Error('fastify-now: should provide opts.routesFolder');
  }
  try {
    await registerRoutes(server, opts.routesFolder, opts.pathPrefix);
  } catch (error) {
    const { message } = error as Error;
    throw new Error(`fastify-now: error registering routers: ${message}`);
  }
};

type NowRouteHandlerMethod<
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault,
> = (
  this: FastifyInstance<RawServer, RawRequest, RawReply>,
  request: FastifyRequest<RouteGeneric, RawServer, RawRequest>,
  reply: FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>,
  server: FastifyInstance<RawServer, RawRequest, RawReply>,
) => void | RouteGeneric['Reply'] | Promise<RouteGeneric['Reply'] | void>;

export interface NowRequestHandler<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault,
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
> extends NowRouteHandlerMethod<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig> {
  opts?: RouteShorthandOptions<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>;
}

export default fp<FastifyNowOpts>(fastifyNow);
