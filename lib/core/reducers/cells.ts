import { CarouselAction } from '../types';

export interface Cell {
  id: string;
  index: number;
  x: number;
  y: number;
  size: {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    outerWidth: number;
    outerHeight: number;
    margin: number[];
  };
}

export interface State {
  [id: Cell['id']]: Cell;
}

export function reducer(state: State = {}, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.ADD_CELL: {
      const { payload } = action as Required<CarouselAction<Cell>>;

      return { ...state, [payload.id]: payload };
    }
    case actionTypes.UPDATE_CELL_SIZE: {
      const {
        payload: { id, size },
      } = action as Required<CarouselAction<{ id: Cell['id']; size: Cell['size'] }>>;

      if (state[id] == null) {
        return state;
      }

      return { ...state, [id]: { ...state[id], size } };
    }
    case actionTypes.UPDATE_CELL_POSITION: {
      const {
        payload: { id, x, y },
      } = action as Required<CarouselAction<{ id: Cell['id']; x: Cell['x']; y: Cell['y'] }>>;

      if (state[id] == null) {
        return state;
      }

      return {
        ...state,
        [id]: {
          ...state[id],
          x: x ?? state[id].x,
          y: y ?? state[id].y,
        },
      };
    }
    case actionTypes.UPDATE_CELL_INDEX: {
      const {
        payload: { id, index },
      } = action as Required<CarouselAction<{ id: Cell['id']; index: Cell['index'] }>>;

      if (state[id] == null) {
        return state;
      }

      return { ...state, [id]: { ...state[id], index } };
    }
    case actionTypes.REMOVE_CELL: {
      const { payload } = action as Required<CarouselAction<Cell['id']>>;

      if (state[payload] == null) {
        return state;
      }

      const newState = { ...state };
      delete newState[payload];
      return newState;
    }
    default:
      return state;
  }
}

export const actionTypes = {
  ADD_CELL: 'cells/add',
  UPDATE_CELL_SIZE: 'cells/update size',
  UPDATE_CELL_POSITION: 'cells/update position',
  UPDATE_CELL_INDEX: 'cells/update index',
  REMOVE_CELL: 'cells/remove',
};
