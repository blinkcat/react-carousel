import { CarouselAction } from '../types';

export interface State {
  isAnimating: boolean;
  isFreeScrolling: boolean;
  // velocity
  vx: number;
  vy: number;
}

const initialState: State = { isAnimating: false, vx: 0, vy: 0, isFreeScrolling: false };

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.START_ANIMATION:
      return { ...state, isAnimating: true };
    case actionTypes.STOP_ANIMATION:
      return { ...state, isAnimating: false };
    case actionTypes.UPDATE_VELOCITY_POSITION: {
      const {
        payload: { vx, vy },
      } = action as Required<
        CarouselAction<{
          x?: number;
          vx?: number;
          y?: number;
          vy?: number;
        }>
      >;
      return { ...state, vx: vx ?? state.vx, vy: vy ?? state.vy };
    }
    case actionTypes.ENABLE_FREE_SCROLLING:
      return { ...state, isFreeScrolling: true };
    case actionTypes.DISABLE_FREE_SCROLLING:
      return { ...state, isFreeScrolling: false };
    default:
      return state;
  }
}

export const actionTypes = {
  START_ANIMATION: 'animation/start',
  STOP_ANIMATION: 'animation/stop',
  UPDATE_VELOCITY_POSITION: 'animation/update velocity and position',
  ENABLE_FREE_SCROLLING: 'animation/enable free scrolling',
  DISABLE_FREE_SCROLLING: 'animation/disable free scrolling',
};
