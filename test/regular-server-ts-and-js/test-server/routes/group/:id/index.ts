import { NowRequestHandler } from '../../../../../../index';

type Get = NowRequestHandler<{
  Params: { id: string };
  Reply: { id: string };
}>;

export const GET: Get = async (req) => {
  return { id: req.params.id };
};
