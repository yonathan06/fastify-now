import { NowRequestHandler } from '../../../../index';

export const GET: NowRequestHandler = async () => {
  return { message: 'hello world' };
};
