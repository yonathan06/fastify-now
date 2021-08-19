import { NowRequestHandler } from '../../../../index';

export const GET: NowRequestHandler = async (req, rep) => {
  return { message: 'hello world' };
};
