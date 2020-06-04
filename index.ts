import path from "path";
import fs from "fs";
import Http from "http";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";

enum HTTPMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  OPTIONS = "options",
  PATCH = "patch",
  HEAD = "head",
  CONNECT = "connect",
  TRACE = "trace",
}

export function registerRoutes(
  server: FastifyInstance,
  folder: string,
  pathPrefix = ""
) {
  fs.readdirSync(folder, { withFileTypes: true }).forEach((folderOrFile) => {
    const currentPath = path.join(folder, folderOrFile.name);
    const routeServerPath = `${pathPrefix}/${folderOrFile.name}`;
    if (folderOrFile.isDirectory()) {
      registerRoutes(server, currentPath, routeServerPath);
    } else if (folderOrFile.isFile()) {
      if (!folderOrFile.name.endsWith(".js")) {
        return;
      }
      let fileRouteServerPath = pathPrefix;
      if (folderOrFile.name !== "index.js") {
        fileRouteServerPath += "/" + folderOrFile.name.replace(".js", "");
      }
      if (fileRouteServerPath.length === 0) {
        fileRouteServerPath = "/";
      }
      let module = require(currentPath);
      Object.values(HTTPMethod).forEach((method) => {
        addModuleMethod(module, method, server, fileRouteServerPath);
      });
    }
  });
}

function addModuleMethod(
  module: any,
  method: HTTPMethod,
  server: fastify.FastifyInstance,
  fileRouteServerPath: string
) {
  const handler = module[method.toUpperCase()] as fastify.NowRequestHandler;
  if (handler) {
    server.log.debug(`${method.toUpperCase()} ${fileRouteServerPath}`);
    server[method](fileRouteServerPath, handler.opts || {}, handler);
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
    next(new Error("fastify-now: must provide opts.routesFolder"));
    return;
  }
  try {
    registerRoutes(server, opts.routesFolder, opts.pathPrefix);
    next();
  } catch (error) {
    next(new Error(`fastify-now: error registering routers: ${error.message}`));
  }
}

declare module "fastify" {
  interface NowRequestHandler extends fastify.RequestHandler {
    opts?: fastify.RouteShorthandOptions;
  }
}

export default fp(fastifyNow);
