import { NowRequestHandler } from '../../../../index';

export const GET: NowRequestHandler<{
  Querystring: { name: string };
  Reply: { name: string } | { message: string };
}> = async (req, rep) => {
  if (req.query.name === 'test') {
    rep.status(400).send({
      message: 'Invalid name',
    });
    return;
  }
  rep.send({ name: req.query.name });
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
    response: {
      '200': {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
  },
};
