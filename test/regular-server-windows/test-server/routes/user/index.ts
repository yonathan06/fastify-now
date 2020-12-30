import { NowRequestHandler } from '../../../../../index';

export const POST: NowRequestHandler<{ Body: { name: string } }> = async (req, rep) => {
  if (req.body.name === 'Jon Doe') {
    /**
     * in async function, you can return undefined if you already sent a response
     * then it won't try to send a response again with the returned value;
     */
    rep.status(400);
    return { message: 'Name can not be Jon Doe' };
  }
  return { ...req.body };
};

POST.opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
  },
};
