import test from 'ava';
import { initServer } from './test-server';

test('Should throw an error when no routeFolder is provided', async (t) => {
  const error = await t.throwsAsync(() => initServer(5001));
  t.is(error?.message, 'fastify-now: should provide opts.routesFolder');
});
