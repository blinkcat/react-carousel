import { CarouselAction } from '../types';

export interface State {
  size: {
    width: number;
    height: number;
  };
  maxCellHeight: number;
  maxCellWidth: number;
  active: boolean;
}

const initialState: State = {
  maxCellHeight: 0,
  maxCellWidth: 0,
  size: {
    width: 0,
    height: 0,
  },
  active: false,
};

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.RESET:
      return initialState;
    case actionTypes.UPDATE_MAX_CELL_HEIGHT: {
      const { payload } = action as Required<CarouselAction<number>>;

      if (state.maxCellHeight < payload) {
        return { ...state, maxCellHeight: payload };
      }
      return state;
    }
    case actionTypes.UPDATE_MAX_CELL_WIDTH: {
      const { payload } = action as Required<CarouselAction<number>>;

      if (state.maxCellWidth < payload) {
        return { ...state, maxCellWidth: payload };
      }
      return state;
    }
    case actionTypes.UPDATE_CAROUSEL_SIZE: {
      const {
        payload: { width, height },
      } = action as Required<CarouselAction<{ width: number; height: number }>>;

      return {
        ...state,
        size: {
          width: width,
          height: height,
        },
      };
    }
    case actionTypes.ACTIVATE:
      return { ...state, active: true };
    default:
      return state;
  }
}

export const actionTypes = {
  RESET: 'carousel/reset',
  UPDATE_MAX_CELL_HEIGHT: 'carousel/update max cell height',
  UPDATE_MAX_CELL_WIDTH: 'carousel/update max cell width',
  UPDATE_CAROUSEL_SIZE: 'carousel/update container size',
  ACTIVATE: 'carousel/activate',
};
