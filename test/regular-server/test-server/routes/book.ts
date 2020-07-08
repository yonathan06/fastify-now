import { NowRequestHandler } from '../../../../index';

export const GET: NowRequestHandler<{ Querystring: { name: string } }> = async (req, rep) => {
  return { name: req.query.name };
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
