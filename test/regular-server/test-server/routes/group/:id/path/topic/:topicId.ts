import { NowRequestHandler } from '../../../../../../../../index';

export const GET: NowRequestHandler = async (req, rep) => {
  return { groupId: req.params.id, topicId: req.params.topicId };
};
