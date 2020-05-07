import fastify from "fastify";

export const GET: fastify.NowRequestHandler = async (req, rep) => {
  return { message: 'hello world' };
}

GET.opts = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      },
      required: ['name']
    }
  }
}