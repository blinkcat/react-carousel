import { actionTypes, Cell } from '../reducers/cells';
import { cellsOrderByIndexSelector } from '../selector';
import { CarouselAction, CarouselThunkAction, ElementSize } from '../types';
import { updateMaxCellHeight, updateMaxCellWidth } from './carousel';
import { updateSlidableHeight, updateSlidableWidth } from './slider';

function createCell(id: Cell['id']): Cell {
  return {
    id,
    index: 0,
    x: 0,
    y: 0,
    size: {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0,
      margin: [0, 0, 0, 0],
    },
  };
}

export function addCell(id: Cell['id']): CarouselAction<Cell> {
  return {
    type: actionTypes.ADD_CELL,
    payload: createCell(id),
  };
}

export function removeCell(id: Cell['id']) {
  return {
    type: actionTypes.REMOVE_CELL,
    payload: id,
  };
}

export function updateCellSize(id: Cell['id'], size: ElementSize) {
  return {
    type: actionTypes.UPDATE_CELL_SIZE,
    payload: {
      id,
      size: {
        width: size.width,
        height: size.height,
        innerWidth: size.innerWidth,
        innerHeight: size.innerHeight,
        outerWidth: size.outerWidth,
        outerHeight: size.outerHeight,
        margin: [size.marginTop, size.marginRight, size.marginBottom, size.marginLeft],
      },
    },
  };
}

export function updateCellIndex(id: Cell['id'], index: Cell['index']) {
  return {
    type: actionTypes.UPDATE_CELL_INDEX,
    payload: {
      id,
      index,
    },
  };
}

export function updateCellPosition(id: Cell['id'], x: number, y: number) {
  return {
    type: actionTypes.UPDATE_CELL_POSITION,
    payload: {
      id,
      x,
      y,
    },
  };
}

export function positionCells(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      options: { direction },
    } = getState();

    let distance = 0;
    let maxCellWidth = 0;
    let maxCellHeight = 0;

    cellsOrderByIndexSelector(getState()).forEach((cell) => {
      if (direction === 'horizontal') {
        dispatch(updateCellPosition(cell.id, distance, 0));
        distance += cell.size.outerWidth;
        maxCellHeight = Math.max(maxCellHeight, cell.size.outerHeight);
      } else {
        dispatch(updateCellPosition(cell.id, 0, distance));
        distance += cell.size.outerHeight;
        maxCellWidth = Math.max(maxCellWidth, cell.size.outerWidth);
      }
    });

    if (direction === 'horizontal') {
      dispatch(updateSlidableWidth(distance));
      dispatch(updateMaxCellHeight(maxCellHeight));
    } else {
      dispatch(updateSlidableHeight(distance));
      dispatch(updateMaxCellWidth(maxCellWidth));
    }
  };
}
