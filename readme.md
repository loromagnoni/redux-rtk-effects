# Package Name

redux-rtk-effects

## Description

**redux-rtk-effects** is an npm package that enable the creation of reducers with effects definition for the [@reduxjs/toolkit](https://redux-toolkit.js.org/) library. It allows you to define custom reducers with associated effects, and creates a store factory function that sets up the store with the necessary middleware to handle these effects.

## Installation

Use npm to install the package:

```
npm install redux-rtk-effects
```

## Usage

To use redux-rtk-effects in your Redux application, follow the example below:

```typescript
import { createAction } from '@reduxjs/toolkit';
import { createStoreFactory, createEnvironment } from 'redux-rtk-effects';

// Define your data models and environment interfaces
interface User {
  name: string;
  email: string;
  avatarSrc: string;
}

interface Environment {
  userRepository: {
    getUser: () => Promise<User>;
  };
}

// Create store factory using createStoreFactory function
const { factory } = createStoreFactory({
  initialState: { user: null as null | User, isLoading: false },
  actions: {
    onModuleInit: createAction('onModuleInit'),
    handleUserResponse: createAction<User>('handleUserResponse'),
  },
  environment: createEnvironment<Environment>(),
  reducer: {
    onModuleInit: {
      handler: (state) => {
        state.isLoading = true;
      },
      // Define effect to be triggered once the actions is dispatched
      effect: async (_, { dispatch, extra }) => {
        const user = await extra.environment.userRepository.getUser();
        dispatch(extra.actions.handleUserResponse(user));
      },
    },
    handleUserResponse: (state, { payload }) => {
      state.user = payload;
      state.isLoading = false;
    },
  },
});

// Create the store using the factory function and pass in the environment
const environment: Environment = {
  userRepository: {
    getUser: () => Promise.resolve({ name: 'John Doe', email: 'john.doe@example.com', avatarSrc: 'avatar.jpg' }),
  },
};

const store = factory(environment);
```

In the example above, we define two actions (`onModuleInit` and `handleUserResponse`) and a custom reducer with associated effects. The `onModuleInit` action is dispatched when the module initializes, triggering the associated effect. The effect retrieves user data asynchronously from the environment and dispatches the `handleUserResponse` action with the received data.

The `createEnvironment` function is used to create an empty environment object, which is then passed to the store factory function along with the initial state, actions, and custom reducer. Finally, the store is created by calling the factory function and passing in the environment.

## API

### `createStoreFactory`

A function that creates a store factory with the necessary middleware to handle effects.

**Signature:**

```javascript
function createStoreFactory<TState, TAction extends Record<string, any>, TEnvironment extends Object>(
  config: {
    initialState: TState;
    actions: TAction;
    environment: TEnvironment;
    reducer: CustomReducer<TState, TAction, TEnvironment>;
  }
): ReturnType<typeof _createStoreFactory<TState, TAction, TEnvironment>>;
```
