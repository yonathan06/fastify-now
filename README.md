# Fastify Now - a fastify plugin

![npm badge](https://img.shields.io/npm/v/fastify-now)
![ci badge](https://github.com/yonathan06/fastify-now/workflows/CI/badge.svg)
![license badge](https://img.shields.io/github/license/yonathan06/fastify-now)

File based routing for [fastify](https://www.fastify.io/) (v4).
**If you want to use this library with fastify v3, you should use version 2.X**
**If you want to use this library with fastify v2, you should use version 1.X**

## Example (see example folder)

For the given folder structure

```text
├── src
    ├── routes -- routes folder (can be changed)
    |   ├── user -- user resource endpoint folder
    |   |   └──index.ts -- has POST method function
    |   |   └──[id].ts -- has GET & PUT method functions
    |   └── index.ts
    └── index.ts -- server file
```

will result:

```text
└── / (GET)
    └── user (POST)
        └── /
            └── :id (GET)
                :id (PUT)
```

Path params can also be prefixed with `:` E.g. `:id` instead of `[id]`

The plugin will ignore any `.{test|spec|bench}.js` files when loading routes

## Install

### Versions

The latest version is 2.X which supports fastify v3.
**If you want to use this library with fastify v2, you should use version 1.X**

```sh
npm install fastify-now
```

## Use

In your main server file (can see in example folder)

```javascript
import fastify from 'fastify';
import path from 'path';
import fastifyNow from 'fastify-now';

const server = fastify({ logger: true });
server.register(fastifyNow, {
  routesFolder: path.join(__dirname, './routes'),
  /**
   * Can also provide a prefix
   */
  // pathPrefix: '/api'
});
const PORT = Number(process.env.PORT) || 5000;
server.listen({ port: PORT }).then(() => {
  // ...
});
```

In each route file, you need to export a function with a supported HTTP method as the function name, in uppercase letters

Currently supported HTTP methods: `GET, POST, DELETE & PUT`

In `/routes/user/:id/index.ts`:

```typescript
import { NowRequestHandler } from 'fastify-now';

export const GET: NowRequestHandler<{ Params: { id: string } }> = async (req, rep) => {
  return { userId: req.params.id };
};

export const PUT: NowRequestHandler<{ Params: { id: string } }> = async (req, res) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};

// with the server instance as the context (aka this)
export const POST: NowRequestHandler<{ Body: { name: string } }> = async function(req, res) {
  // this = fastify instance
  const [user] = await this.db.query(`SELECT * FROM users WHERE name = ${req.body.name}`);
  // ... rest of code
}
```

Dynamic params are specified in the file name, or the folder name.

`routes/user/:id/index.ts` - will resolve to `/user/:id`
`routes/book/:id/chapter/:chapterId.ts` - will resolve to `/book/:id/chapter/:chapterId`

You can also add endpoint fastify opts.
For that, I created a new interface called `NowRequestHandler`.

in `/routes/user/index.ts`:

```typescript
import { NowRequestHandler } from 'fastify-now';

type Post = NowRequestHandler<{
  Body: { name: string };
  Params: { id: string };
  Reply: { message: string } | { userId: string };
}>;

export const POST: Post = async (req, rep) => {
  if (req.body.name === 'Jon Doe') {
    /**
     * in async function, you can return undefined if you already sent a response
     * then it won't try to send a response again with the returned value;
     */
    rep.status(400).send({ message: 'Name can not be Jon Doe' });
    return;
  }
  return { userId: req.params.id };
};

POST.opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
  },
};
```

## License

Licensed under [MIT](./LICENSE)
