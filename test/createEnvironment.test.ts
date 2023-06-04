import { assertType, expect, expectTypeOf, test } from 'vitest';
import { createEnvironment } from '../src/createEnvironment';

type CustomRepository = Record<string, () => any>;

type CustomEnvironment = {
  repository: CustomRepository;
};

test('create environment should type the result as the type argument', () => {
  expectTypeOf(createEnvironment<CustomEnvironment>()).toEqualTypeOf<CustomEnvironment>();
});

test('create environment should return just an empty object', () => {
  const environment = createEnvironment<CustomEnvironment>();
  assertType<CustomEnvironment>(environment);
  expect(Object.keys(environment)).toHaveLength(0);
});
