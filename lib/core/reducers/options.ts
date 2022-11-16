import { CarouselAction } from '../types';

export interface State {
  draggable: boolean;
  groupCells: number;
  attraction: number;
  friction: number;
  initialIndex: number;
  freeScroll: boolean;
  freeScrollFriction: number;
  cellAlign: 'left' | 'center' | 'right';
  loop: boolean;
  direction: 'horizontal' | 'vertical';
  debug: boolean;
  setCarouselSize: boolean;
  effect: 'default' | 'lift' | 'fade' | 'stack';
}

export const initialState: State = {
  draggable: true,
  groupCells: 1,
  attraction: 0.025,
  friction: 0.28,
  initialIndex: 0,
  freeScroll: false,
  freeScrollFriction: 0.075,
  cellAlign: 'center',
  loop: false,
  direction: 'horizontal',
  debug: false,
  setCarouselSize: true,
  effect: 'default',
};

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.update: {
      const { payload } = action as Required<CarouselAction<Partial<State>>>;
      return { ...state, ...payload };
    }
    default:
      return state;
  }
}

export const actionTypes = {
  update: 'options/update',
};
