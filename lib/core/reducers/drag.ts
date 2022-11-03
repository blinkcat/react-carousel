import { CarouselAction } from '../types';

export interface State {
  dx: number;
  dy: number;
  startX: number;
  startY: number;
  isDragging: boolean;
  isPointerDown: boolean;
  startTime: number;
}

const initialState: State = {
  dx: 0,
  dy: 0,
  startX: 0,
  startY: 0,
  isDragging: false,
  isPointerDown: false,
  startTime: 0,
};

export function reducer(state = initialState, action: CarouselAction): State {
  switch (action.type) {
    case actionTypes.DRAG_START:
      return {
        ...state,
        isDragging: true,
        startTime: Date.now(),
      };
    case actionTypes.DRAG_MOVE: {
      const {
        payload: { x, y },
      } = action as Required<CarouselAction<{ x: number; y: number }>>;
      return { ...state, dx: x, dy: y };
    }
    case actionTypes.DRAG_END:
      return { ...state, isDragging: false, dx: 0, dy: 0 };
    case actionTypes.POINTER_DOWN: {
      const {
        payload: { startX, startY },
      } = action as Required<CarouselAction<{ startX: number; startY: number }>>;

      return {
        ...state,
        isPointerDown: true,
        startX,
        startY,
      };
    }
    case actionTypes.POINTER_UP:
    case actionTypes.POINTER_CANCEL:
    case actionTypes.POINTER_DONE:
      return { ...state, isPointerDown: false };
    default:
      return state;
  }
}

export const actionTypes = {
  DRAG_START: 'drag/start',
  DRAG_MOVE: 'drag/move',
  DRAG_END: 'drag/end',
  POINTER_DOWN: 'drag/pointer down',
  POINTER_UP: 'drag/pointer up',
  POINTER_CANCEL: 'drag/pointer cancel',
  POINTER_DONE: 'drag/pointer done',
};
