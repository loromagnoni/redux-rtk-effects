import { Dispatch, ListenerEffect, ActionCreator, createReducer } from '@reduxjs/toolkit';

export type CustomReducer<
  TState,
  TAction extends Record<string, ActionCreator<any>>,
  TEnvironment extends object = never,
> = {
  [K in keyof TAction]:
    | ((state: TState, action: ReturnType<TAction[K]>) => void)
    | {
        handler: (state: TState, action: ReturnType<TAction[K]>) => void;
        effect: ListenerEffect<
          ReturnType<TAction[K]>,
          TState,
          Dispatch<ReturnType<TAction[keyof TAction]>>,
          { actions: TAction; environment: TEnvironment }
        >;
      };
};

export const createReducerWithEffects = <
  TState,
  TAction extends Record<string, (...args: any) => any>,
  TEnvironment extends object,
>(
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
      TEnvironment
    >
  >;
  return { reducer, actions, effects };
};
