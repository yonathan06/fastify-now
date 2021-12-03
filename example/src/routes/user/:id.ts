import { NowRequestHandler } from 'fastify-now';

// Optionally setting the reply type as the handler's return type
export const GET: NowRequestHandler<{ Params: { id: string } }> = async (
  req,
): Promise<{ userId: string }> => {
  return { userId: req.params.id };
};

// Optionally setting the reply type using generics
export const PUT: NowRequestHandler<{
  Params: { id: string };
  Reply: { message: string };
}> = async (req) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};
