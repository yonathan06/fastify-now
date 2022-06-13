import { NowRequestHandler } from '../../../../../../index';

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req) => {
  return { id: req.params.id };
};
