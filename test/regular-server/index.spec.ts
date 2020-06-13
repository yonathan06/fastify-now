import test from 'ava';
import { initServer } from './test-server';
import { FastifyInstance } from 'fastify';

test.before(async (t) => {
  t.context['server'] = await initServer(5000);
});

test.after.always(async (t) => {
  (t.context['server'] as FastifyInstance).close();
});

test('Server should not be null', (t) => {
  const server = t.context['server'] as FastifyInstance;
  server.printRoutes();
  t.truthy(server);
});

test('/ GET should exist', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: '/',
    method: 'GET',
  });
  const json = JSON.parse(res.body);
  t.is(json.message, 'hello world');
});

test('/user POST should exist', async (t) => {
  const name = 'my name';
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: '/user',
    method: 'POST',
    payload: {
      name,
    },
  });
  const json = JSON.parse(res.body);
  t.is(json.name, name);
});

test('/user POST fail over schema validation', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: '/user',
    method: 'POST',
  });
  t.is(res.statusCode, 400);
});

test('/user POST fail over bad payload', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: '/user',
    method: 'POST',
    payload: {
      name: 'Jon Doe',
    },
  });
  t.is(res.statusCode, 400);
});

test('/user/:id PUT should exist', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: '/user/some-id',
    method: 'PUT',
  });
  const json = JSON.parse(res.body);
  t.is(json.message, 'user updated');
});

test('/user/:id GET should exist', async (t) => {
  const userId = 'some-id';
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: `/user/${userId}`,
    method: 'GET',
  });
  const json = JSON.parse(res.body);
  t.is(json.userId, userId);
});

test('/books GET should fail over no query string schema validation', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: `/book`,
    method: 'GET',
  });
  t.is(
    res.body,
    `{"statusCode":400,"error":"Bad Request","message":"querystring should have required property 'name'"}`,
  );
  t.is(res.statusCode, 400);
});

test('/group/:id GET should exist', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: `/group/123`,
    method: 'GET',
  });
  t.is(res.statusCode, 200);
  t.deepEqual(res.json(), { id: '123' });
});

test('/group/:id/path/topic/:topicId GET should exist', async (t) => {
  const server = t.context['server'] as FastifyInstance;
  const res = await server.inject({
    path: `/group/123/path/topic/456`,
    method: 'GET',
  });
  t.is(res.statusCode, 200);
  t.deepEqual(res.json(), { groupId: '123', topicId: '456' });
});
