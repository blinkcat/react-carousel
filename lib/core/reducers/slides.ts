import { CarouselAction } from '../types';
import { Cell } from './cells';

export interface Slide {
  x: number;
  y: number;
  target: number;
  cells: Cell['id'][];
  size: {
    outerWidth: number;
    outerHeight: number;
    margin: number[];
  };
}

export type State = Slide[];

const initialState: State = [];

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.SET:
      return (action as Required<CarouselAction<Slide[]>>).payload;
    default:
      return state;
  }
}

export const actionTypes = {
  SET: 'slides/set new slides',
};
