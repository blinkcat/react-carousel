import { actionTypes, State } from '../reducers/carousel';
import { CarouselAction, CarouselThunkAction, ElementSize } from '../types';
import { within } from '../util';
import { positionCells } from './cells';
import { findCellsMayBeMoved, select } from './slider';
import { updateSlides } from './slides';

export function updateMaxCellHeight(height: number): CarouselAction<State['maxCellHeight']> {
  return {
    type: actionTypes.UPDATE_MAX_CELL_HEIGHT,
    payload: height,
  };
}

export function updateMaxCellWidth(width: number) {
  return {
    type: actionTypes.UPDATE_MAX_CELL_HEIGHT,
    payload: width,
  };
}

export function updateCarouselSize(size: ElementSize) {
  return {
    type: actionTypes.UPDATE_CAROUSEL_SIZE,
    payload: {
      width: size.width,
      height: size.height,
    },
  };
}

export function activate(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      options: { initialIndex = 0, loop },
      slides,
    } = getState();

    dispatch(positionCells());

    if (loop) {
      dispatch(findCellsMayBeMoved());
    }

    dispatch(updateSlides());
    dispatch({
      type: actionTypes.ACTIVATE,
    });
    dispatch(select(within(initialIndex, 0, slides.length - 1), true));
  };
}

export enum ReLayoutReason {
  Resize,
  CellsChanged,
  CarouselSizeChanged,
  OptionsChanged,
  User,
  Unknown,
}

export function reLayout(reason = ReLayoutReason.Unknown): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider: { selectedSlideIndex },
      carousel: { active },
      options: { debug, loop },
    } = getState();

    if (!active) {
      return;
    }

    if (debug) {
      console.log('start reLayout, reason is', ReLayoutReason[reason]);
    }

    dispatch(positionCells());

    if (loop) {
      dispatch(findCellsMayBeMoved());
    }

    dispatch(updateSlides());
    dispatch(select(within(selectedSlideIndex, 0, getState().slides.length - 1)));
  };
}
