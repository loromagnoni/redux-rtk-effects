import {
  Dispatch,
  ListenerEffect,
  ListenerMiddlewareInstance,
  ThunkDispatch,
  createListenerMiddleware,
} from '@reduxjs/toolkit';

export const createEffectsMiddleware = <
  TState,
  TAction extends Record<string, (...args: any) => any>,
  TEnvironment,
>(
  actions: TAction,
  effects: Record<
    keyof TAction,
    ListenerEffect<
      ReturnType<TAction[keyof TAction]>,
      TState,
      Dispatch<ReturnType<TAction[keyof TAction]>>,
      TEnvironment
    >
  >,
  environment: TEnvironment,
) => {
  const customListenerMiddleware = createListenerMiddleware({
    extra: environment,
  });
  Object.entries(effects).forEach(([action, effect]) => {
    customListenerMiddleware.startListening({
      actionCreator: actions[action] as any,
      effect: effect as any,
    });
  });
  return customListenerMiddleware as ListenerMiddlewareInstance<
    TState,
    ThunkDispatch<TState, TEnvironment, ReturnType<TAction[keyof TAction]>>,
    TEnvironment
  >;
};
