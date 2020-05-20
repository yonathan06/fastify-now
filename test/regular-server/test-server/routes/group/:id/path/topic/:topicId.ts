import fastify from 'fastify';

export const GET: fastify.NowRequestHandler = async (req, rep) => {
  return { groupId: req.params.id, topicId: req.params.topicId };
};
