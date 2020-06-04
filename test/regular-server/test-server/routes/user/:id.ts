import fastify from 'fastify';

export const GET: fastify.NowRequestHandler = async (req, rep) => {
  return { userId: req.params.id };
};

export const PUT: fastify.NowRequestHandler = async (req, res) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};
