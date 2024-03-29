import { NowRequestHandler } from '../../../../../../../../index';

export const GET: NowRequestHandler<{ Params: { id: string; topicId: string } }> = async (req) => {
  return { groupId: req.params.id, topicId: req.params.topicId };
};
