import { NowRequestHandler } from '../../../../../../../../index';
export declare const GET: NowRequestHandler<{
  Params: {
    id: string;
    topicId: string;
  };
  Reply: {
    groupId: string;
    topicId: string;
  };
}>;
