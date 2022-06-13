import { NowRequestHandler } from '../../../../../../../../index';

type Get = NowRequestHandler<{
  Params: { id: string; topicId: string };
  Reply: { groupId: string; topicId: string };
}>;

export const GET: Get = async (req) => {
  return { groupId: req.params.id, topicId: req.params.topicId };
};
