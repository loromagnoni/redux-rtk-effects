import { Dispatch, ListenerEffect, configureStore, createReducer } from '@reduxjs/toolkit';
import { CustomReducer } from './createReducerWithEffects';
import { createEffectsMiddleware } from '.';

export function createStoreFactory<TState, TAction extends Record<string, any>, TEnvironment extends object>(config: {
  initialState: TState;
  actions: TAction;
  environment: TEnvironment;
  reducer: CustomReducer<TState, TAction, TEnvironment>;
}): ReturnType<typeof _createStoreFactory<TState, TAction, TEnvironment>>;
export function createStoreFactory<TState, TAction extends Record<string, any>, TEnvironment extends object>(
  initialState: TState,
  actions: TAction,
  customReducer: CustomReducer<TState, TAction, TEnvironment>,
): ReturnType<typeof _createStoreFactory<TState, TAction, TEnvironment>>;
export function createStoreFactory(arg: any, actions?: any, reducer?: any) {
  if (actions === undefined && reducer === undefined)
    return _createStoreFactory(arg.initialState, arg.actions, arg.reducer);
  return _createStoreFactory(arg, actions, reducer);
}

const _createStoreFactory = <TState, TAction extends Record<string, (args?: any) => any>, TEnvironment extends object>(
  initialState: TState,
  actions: TAction,
  customReducer: CustomReducer<TState, TAction, TEnvironment>,
) => {
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
        getDefaultMiddleware().concat(createEffectsMiddleware(actions, effects, { environment, actions }).middleware),
    });

  return { factory, actions, reducer, effects };
};
