# Fastify Now

Load endpoints dynamically from a folder in your project

```sh
├── src
    ├── routes
    |   ├── user
    |   |   └──index.ts
    |   |   └──:id.ts
    |   └── index.ts
    └── index.ts
```

will result:

```sh
GET /
GET /user
POST /user
GET /user/:id
```

## Install

```sh
npm install fastify-now
```

## Use

In your main server file (can see in example folder)

```javascript
import fastify from 'fastify';
import path from 'path';
import fastifyNow from '../../.build';

async () => {
  const server = fastify({ logger: true });
  server.register(fastifyNow, {
    /* This is the default routes folder
     * if non is  specified
     */
    routesFolder: path.join(__dirname, './routes'),
    /**
     * Can also provide a prefix
     */
    // prefix: '/api'
  });
  const PORT = Number(process.env.PORT) || 5000;
  await server.listen(PORT);
};
```

In each route file, you need to export a function with a supported HTTP method as the function name, in uppercase letters

Currently supported HTTP methods: `GET, POST, DELETE & PUT`

In `/routes/user/:id/index.ts`:

```javascript
import fastify from 'fastify';

export const GET: fastify.NowRequestHandler = async (req, rep) => {
  return { userId: req.params.id };
};

export const PUT: fastify.NowRequestHandler = async (req, res) => {
  req.log.info(`updating user with id ${req.params.id}`);
  return { message: 'user updated' };
};
```

Dynamic params are specified in the file name, or the folder name.

`routes/user/:id/index.ts` - will resolve to `/user/:id`
`routes/book/:id/chapter/:chapterId.ts` - will resolve to `/book/:id/chapter/:chapterId`

You can also add endpoint fastify opts.
For that, I created a new interface called `NowRequestHandler`.

in `/routes/user/index.ts`:

```javascript
import fastify from 'fastify';

export const POST: fastify.NowRequestHandler = async (req, rep) => {
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

### in async function, you can return undefined if you already sent a response, then it won't try to send a response again with the returned value

## License

Licensed under [MIT](./LICENSE)
