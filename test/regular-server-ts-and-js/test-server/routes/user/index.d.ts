export function POST(req: any, rep: any): Promise<any>;
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
