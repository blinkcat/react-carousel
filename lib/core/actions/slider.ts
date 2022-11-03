import { Cell } from '../reducers/cells';
import { actionTypes } from '../reducers/slider';
import { alignPositionSelector, sliderPositionSelector } from '../selector';
import { CarouselThunkAction } from '../types';
import { cells2Array, mod } from '../util';
import { startAnimation, disableFreeScrolling } from './animation';

export function updateSelectedSlideIndex(index: number) {
  return {
    type: actionTypes.UPDATE_SELECTED_SLIDE_INDEX,
    payload: index,
  };
}

export function updateSliderPosition(x?: number, y?: number) {
  return {
    type: actionTypes.UPDATE_SLIDER_POSITION,
    payload: {
      x,
      y,
    },
  };
}

export function updateSlidableWidth(w: number) {
  return {
    type: actionTypes.UPDATE_SLIDABLE_WIDTH,
    payload: w,
  };
}

export function updateSlidableHeight(h: number) {
  return {
    type: actionTypes.UPDATE_SLIDABLE_HEIGHT,
    payload: h,
  };
}

export function select(index = 0, instant = false): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider: { x, y, slidableWidth, slidableHeight },
      slides,
      carousel: { active },
      options: { direction, loop },
    } = getState();

    if (active !== true) {
      return;
    }

    const isHorizontal = direction === 'horizontal';

    if (loop) {
      /**
       * 1 2 3 4 [0] 1 2 3 4
       * find the shortest route
       */
      // const distance = Math.abs(selectedSlideIndex - index);
      // const rDistance = Math.abs(selectedSlideIndex + slides.length - index);
      // const lDistance = Math.abs(selectedSlideIndex - slides.length - index);

      // if (rDistance < distance) {
      //   dispatch(
      //     isHorizontal
      //       ? updateSliderPosition(x - slidableWidth, 0)
      //       : updateSliderPosition(0, y - slidableHeight)
      //   );
      // }

      // if (lDistance < distance) {
      //   dispatch(
      //     isHorizontal
      //       ? updateSliderPosition(x + slidableWidth, 0)
      //       : updateSliderPosition(0, y + slidableHeight)
      //   );
      // }

      if (index < 0) {
        dispatch(
          isHorizontal
            ? updateSliderPosition(x - slidableWidth, 0)
            : updateSliderPosition(0, y - slidableHeight)
        );
      }

      if (index >= slides.length) {
        dispatch(
          isHorizontal
            ? updateSliderPosition(x + slidableWidth, 0)
            : updateSliderPosition(0, y + slidableHeight)
        );
      }

      index = mod(index, slides.length);
    }

    const slide = slides[index];

    if (slide == null) {
      return;
    }

    dispatch(updateSelectedSlideIndex(index));

    if (instant) {
      dispatch(
        isHorizontal
          ? updateSliderPosition(-slide.target, 0)
          : updateSliderPosition(0, -slide.target)
      );

      if (loop) {
        dispatch(findCellsShouldBeMoved());
      }
    } else {
      dispatch(startAnimation());
    }
  };
}

export function previous(instant = false): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider: { selectedSlideIndex },
    } = getState();
    const prevIndex = selectedSlideIndex - 1;

    dispatch(disableFreeScrolling());
    dispatch(select(prevIndex, instant));
  };
}

export function next(instant = false): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider: { selectedSlideIndex },
    } = getState();
    const nextIndex = selectedSlideIndex + 1;

    dispatch(disableFreeScrolling());
    dispatch(select(nextIndex, instant));
  };
}

export function findCellsMayBeMoved(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      cells,
      options: { direction },
      carousel: {
        size: { width, height },
      },
    } = getState();
    const isHorizontal = direction === 'horizontal';
    const cellsArr = cells2Array(cells);
    const alignPosition = alignPositionSelector(getState());

    const left: Cell['id'][] = [];
    let leftGap = alignPosition;

    for (let i = cellsArr.length - 1; i >= 0; i--) {
      if (leftGap <= 0) {
        break;
      }
      left.push(cellsArr[i].id);
      leftGap -= cellsArr[i].size[isHorizontal ? 'outerWidth' : 'outerHeight'];
    }

    dispatch({
      type: actionTypes.UPDATE_CELLS_MAY_BE_MOVED_FORWARD,
      payload: left,
    });

    const right: Cell['id'][] = [];
    let rightGap = (isHorizontal ? width : height) - alignPosition;

    for (let i = 0; i < cellsArr.length; i++) {
      if (rightGap <= 0) {
        break;
      }
      right.push(cellsArr[i].id);
      rightGap -= cellsArr[i].size[isHorizontal ? 'outerWidth' : 'outerHeight'];
    }

    dispatch({
      type: actionTypes.UPDATE_CELLS_MAY_BE_MOVED_BACKWARD,
      payload: right,
    });
  };
}

export function findCellsShouldBeMoved(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      cells,
      slider: { cellsMayBeMovedForward, cellsMayBeMovedBackward, slidableWidth, slidableHeight },
      options: { direction },
      carousel: {
        size: { width, height },
      },
    } = getState();
    const { x, y } = sliderPositionSelector(getState());
    const isHorizontal = direction === 'horizontal';

    const collect = (gap: number, ids: Cell['id'][]) => {
      const res: Cell['id'][] = [];

      for (let i = 0; i < ids.length && gap > 0; i++) {
        res.push(ids[i]);
        gap -= cells[ids[i]].size[isHorizontal ? 'outerWidth' : 'outerHeight'];
      }

      return res;
    };

    dispatch({
      type: actionTypes.UPDATE_CELLS_SHOULD_BE_MOVED_FORWARD,
      payload: collect(isHorizontal ? x : y, cellsMayBeMovedForward),
    });

    dispatch({
      type: actionTypes.UPDATE_CELLS_SHOULD_BE_MOVED_BACKWARD,
      payload: collect(
        isHorizontal ? width - (x + slidableWidth) : height - (y + slidableHeight),
        cellsMayBeMovedBackward
      ),
    });
  };
}
