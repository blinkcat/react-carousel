import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { createStore } from './createStore';
import { rootReducer } from './reducers';

export enum CssDirection {
  Top,
  Right,
  Down,
  Left,
}

export interface CarouselAction<P = any> extends Action<string> {
  payload?: P;
}

export type RootState = ReturnType<typeof rootReducer>;

export type CarouselThunkAction<R = void> = ThunkAction<R, RootState, void, CarouselAction>;

export interface ElementSize {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  borderLeftWidth: number;
  borderRightWidth: number;
  borderTopWidth: number;
  borderBottomWidth: number;
}

export type CarouselStore = ReturnType<typeof createStore>;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

export type CarouselState = ExtractState<CarouselStore>;

export interface CarouselDispatch {
  (action: CarouselAction | CarouselThunkAction): CarouselAction | CarouselThunkAction;
}

export interface Selector<Selected> {
  (state: RootState): Selected;
}
