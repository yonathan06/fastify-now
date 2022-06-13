import { FastifyRequest, FastifyReply } from 'fastify';
export function GET(
  req: FastifyRequest,
  rep: FastifyReply,
): Promise<{
  userId: string;
}>;
export function PUT(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<{
  message: string;
}>;
