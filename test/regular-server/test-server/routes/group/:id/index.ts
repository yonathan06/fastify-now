import { NowRequestHandler } from '../../../../../../index';

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, rep) => {
  return { id: req.params.id };
};
