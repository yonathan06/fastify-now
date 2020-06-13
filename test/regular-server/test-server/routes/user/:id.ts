import { NowRequestHandler } from '../../../../../index';

export const GET: NowRequestHandler = async (req, rep) => {
  return { userId: req.params.id };
};

export const PUT: NowRequestHandler = async (req, res) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};
