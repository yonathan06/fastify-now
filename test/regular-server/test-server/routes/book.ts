import { NowRequestHandler } from '../../../../index';

export const GET: NowRequestHandler = async (req, rep) => {
  return { message: 'hello world' };
};

GET.opts = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  },
};
