import { FastifyRequest, FastifyReply } from 'fastify';
export function POST(req: FastifyRequest, rep: FastifyReply): Promise<Record<string, string>>;
export namespace POST {
  export namespace opts {
    export namespace schema {
      export const body: {
        type: string;
        properties: {
          name: {
            type: string;
          };
        };
        required: string[];
      };
    }
  }
}
