import { CarouselAction } from '../types';
import { actionTypes as animationActionTypes } from './animation';
import { Cell } from './cells';

export interface State {
  x: number;
  y: number;
  selectedSlideIndex: number;
  slidableWidth: number;
  slidableHeight: number;
  cellsMayBeMovedForward: Cell['id'][];
  cellsMayBeMovedBackward: Cell['id'][];
  cellsShouldBeMovedForward: Cell['id'][];
  cellsShouldBeMovedBackward: Cell['id'][];
}

const initialState: State = {
  x: 0,
  y: 0,
  selectedSlideIndex: 0,
  slidableWidth: 0,
  slidableHeight: 0,
  cellsMayBeMovedForward: [],
  cellsMayBeMovedBackward: [],
  cellsShouldBeMovedForward: [],
  cellsShouldBeMovedBackward: [],
};

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.UPDATE_SELECTED_SLIDE_INDEX:
      return { ...state, selectedSlideIndex: (action as Required<CarouselAction<number>>).payload };
    case actionTypes.UPDATE_SLIDER_POSITION:
    case animationActionTypes.UPDATE_VELOCITY_POSITION: {
      const {
        payload: { x, y },
      } = action as Required<CarouselAction<{ x?: number; y?: number }>>;

      return {
        ...state,
        x: x ?? state.x,
        y: y ?? state.y,
      };
    }
    case actionTypes.UPDATE_SLIDABLE_WIDTH:
      return { ...state, slidableWidth: (action as Required<CarouselAction<number>>).payload };
    case actionTypes.UPDATE_SLIDABLE_HEIGHT:
      return { ...state, slidableHeight: (action as Required<CarouselAction<number>>).payload };
    case actionTypes.UPDATE_CELLS_SHOULD_BE_MOVED_FORWARD:
      return {
        ...state,
        cellsShouldBeMovedForward: (action as Required<CarouselAction<Cell['id'][]>>).payload,
      };

    case actionTypes.UPDATE_CELLS_SHOULD_BE_MOVED_BACKWARD:
      return {
        ...state,
        cellsShouldBeMovedBackward: (action as Required<CarouselAction<Cell['id'][]>>).payload,
      };

    case actionTypes.UPDATE_CELLS_MAY_BE_MOVED_FORWARD:
      return {
        ...state,
        cellsMayBeMovedForward: (action as Required<CarouselAction<Cell['id'][]>>).payload,
      };
    case actionTypes.UPDATE_CELLS_MAY_BE_MOVED_BACKWARD:
      return {
        ...state,
        cellsMayBeMovedBackward: (action as Required<CarouselAction<Cell['id'][]>>).payload,
      };
    default:
      return state;
  }
}

export const actionTypes = {
  UPDATE_SLIDER_POSITION: 'slider/update position',
  UPDATE_SELECTED_SLIDE_INDEX: 'slider/update selected slide index',
  UPDATE_SLIDABLE_WIDTH: 'slider/update slidable width',
  UPDATE_SLIDABLE_HEIGHT: 'slider/update slidable height',
  UPDATE_CELLS_SHOULD_BE_MOVED_FORWARD: 'slider/update cells that should be moved forward',
  UPDATE_CELLS_SHOULD_BE_MOVED_BACKWARD: 'slider/update cells that should be moved backward',
  UPDATE_CELLS_MAY_BE_MOVED_FORWARD: 'slider/update cells that may be moved forward',
  UPDATE_CELLS_MAY_BE_MOVED_BACKWARD: 'slider/update cells that may be moved backward',
};
