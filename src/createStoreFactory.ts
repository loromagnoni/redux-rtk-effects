import {
  AnyAction,
  Dispatch,
  ListenerEffect,
  ListenerMiddleware,
  MiddlewareArray,
  ThunkMiddleware,
  configureStore,
  createReducer,
} from '@reduxjs/toolkit';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { ReducerWithInitialState } from '@reduxjs/toolkit/dist/createReducer';
import { createEffectsMiddleware } from '.';
import { CustomReducer } from './createReducerWithEffects';

export function createStoreFactory<
  TState,
  TAction extends Record<string, any>,
  TEnvironment extends object,
>(config: {
  initialState: TState;
  actions: TAction;
  environment: TEnvironment;
  reducer: CustomReducer<TState, TAction, TEnvironment>;
}): StoreFactoryResult<TState, TAction, TEnvironment>;
export function createStoreFactory<
  TState,
  TAction extends Record<string, any>,
  TEnvironment extends object,
>(
  initialState: TState,
  actions: TAction,
  customReducer: CustomReducer<TState, TAction, TEnvironment>,
): StoreFactoryResult<TState, TAction, TEnvironment>;
export function createStoreFactory(arg: any, actions?: any, reducer?: any) {
  if (actions === undefined && reducer === undefined)
    return _createStoreFactory(arg.initialState, arg.actions, arg.reducer);
  return _createStoreFactory(arg, actions, reducer);
}

type StoreFactoryResult<
  TState,
  TAction extends Record<string, (args?: any) => any>,
  TEnvironment extends object,
> = {
  factory: (
    environment: TEnvironment,
  ) => ToolkitStore<
    TState,
    AnyAction,
    MiddlewareArray<
      [
        ThunkMiddleware<TState, AnyAction>,
        ListenerMiddleware<
          TState,
          Dispatch<ReturnType<TAction[keyof TAction]>>,
          { environment: TEnvironment; actions: TAction }
        >,
      ]
    >
  >;
  actions: TAction;
  reducer: ReducerWithInitialState<TState>;
  effects: Record<
    keyof TAction,
    ListenerEffect<
      ReturnType<TAction[keyof TAction]>,
      TState,
      Dispatch<ReturnType<TAction[keyof TAction]>>,
      { environment: TEnvironment; actions: TAction }
    >
  >;
};

const _createStoreFactory = <
  TState,
  TAction extends Record<string, (args?: any) => any>,
  TEnvironment extends object,
>(
  initialState: TState,
  actions: TAction,
  customReducer: CustomReducer<TState, TAction, TEnvironment>,
): StoreFactoryResult<TState, TAction, TEnvironment> => {
  const reducer = createReducer(initialState, (reducerBuilder) =>
    Object.keys(customReducer).reduce(
      (builder, key) =>
        builder.addCase(actions[key] as any, (state, action) => {
          typeof customReducer[key] === 'function'
            ? (customReducer[key] as any)(state, action)
            : (customReducer[key] as any).handler(state, action);
          return;
        }),
      reducerBuilder,
    ),
  );

  const effects = Object.fromEntries(
    Object.entries(customReducer)
      .filter(([, handler]) => handler.effect)
      .map(([k, handler]) => [k, handler.effect]),
  ) as Record<
    keyof TAction,
    ListenerEffect<
      ReturnType<TAction[keyof TAction]>,
      TState,
      Dispatch<ReturnType<TAction[keyof TAction]>>,
      { environment: TEnvironment; actions: TAction }
    >
  >;
  const factory = (environment: TEnvironment) =>
    configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
          createEffectsMiddleware(actions, effects, { environment, actions })
            .middleware,
        ),
    });

  return { factory, actions, reducer, effects };
};
