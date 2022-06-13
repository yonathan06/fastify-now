import { NowRequestHandler } from '../../../../../index';

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req) => {
  return { userId: req.params.id };
};

export const PUT: NowRequestHandler<{ Params: { id: string } }> = async (req) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};
