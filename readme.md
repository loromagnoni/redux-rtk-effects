# Redux RTK Effects

Centralize your Redux application logic in one place.

## Description

**redux-rtk-effects** enables developers to centralize their Redux application logic inside the reducer. It does so, providing a fully typed reducer API that allows to define action handlers with associated effects.

```typescript

reducer: {
  onModuleInit: {
    handler: (state) => {
      state.isLoading = true;
    },
    effect: async (_, { dispatch, extra }) => {
      const user = await extra.environment.userRepository.getUser();
      dispatch(extra.actions.handleUserResponse(user));
    },
  },
  handleUserResponse: (state, { payload }) => {
      state.user = payload;
      state.isLoading = false;
  },
}
```

## Installation

You can install the package with npm:

```
npm install redux-rtk-effects
```

or yarn:

```
yarn add redux-rtk-effects
```

## Example usage

To use **redux-rtk-effects** in your application, follow the example below:

```typescript
import { createAction } from '@reduxjs/toolkit';
import { createStoreFactory, createEnvironment } from 'redux-rtk-effects';

// Define dependencies needed inside side-effects.
interface Environment {
  userRepository: {
    getUser: () => Promise<{
      name: string;
    }>;
  };
}

// Create store factory using createStoreFactory API
const { factory } = createStoreFactory({
  initialState: { user: null as null | User, isLoading: false },
  actions: {
    onModuleInit: createAction('onModuleInit'),
    handleUserResponse: createAction<User>('handleUserResponse'),
  },
  environment: createEnvironment<Environment>(),
  reducer: {
    // You can define action handlers as simple functions
    handleUserResponse: (state, { payload }) => {
      state.user = payload;
      state.isLoading = false;
    },
    // Or, you can definec action handlers with associated effects
    onModuleInit: {
      handler: (state) => {
        state.isLoading = true;
      },
      // Effect that will be triggered once
      // the onModuleInit action is dispatched
      effect: async (_, { dispatch, extra }) => {
        const user = await extra.environment.userRepository.getUser();
        dispatch(extra.actions.handleUserResponse(user));
      },
    },
  },
});

// Create the store using the factory function and inject in the environment
const environment: Environment = {
  userRepository: {
    getUser: () => Promise.resolve({ name: 'John Doe' }),
  },
};

// Here you have your RTK store! With effects configuration setup.
const store = factory(environment);
```

## Why another Redux side-effect library?

Looking at the most used alternatives, they all handle side effects inside middlewares, scattering application logic between those and the reducer.

Taking inspiration from the [Elm architecture](https://guide.elm-lang.org/architecture/) and [Swift Composable Architecture](https://github.com/pointfreeco/swift-composable-architecture), **redux-rtk-effects** aims to centralize application logic inside the reducer, providing a fully typed API to define action handlers with associated effects.

At the same time, the Redux ecosystem is evolving toward the usage of Redux Toolkit as suggested solution, for this reason **redux-rtk-effects** is built on top of it, and fully compatible with its features.

In fact, the effects defined adhere to the [Listener API](https://redux-toolkit.js.org/api/createListenerMiddleware#listener-api) exposed by [Redux Toolkit](https://redux-toolkit.js.org/), which covers several advanced side effects use cases, and support dependency injection by design.

## API

### `createStoreFactory`

A function that creates a store factory. The factory accepts a paramether which match the environment defined type. The store created is a RTK store, with the effects middleware applied.

### `createEffectsMiddleware`

A function that creates a `ListenerMiddlewareInstance` , middleware that can be applied to a Redux store. This middleware binds effects to their actions, so that once an action is dispatched, the associated effect is triggered.

### `createEnvironment`

A function that creates a typed object. This object can be used to type the environment required by the store factory.

### `createReducerWithEffects`

A function that creates a Redux reducer end its effects, given a reducer with effect definition.
