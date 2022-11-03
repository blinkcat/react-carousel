import { actionTypes } from '../reducers/animation';
import { CarouselThunkAction } from '../types';
import { findCellsShouldBeMoved } from './slider';

export function startAnimation(): CarouselThunkAction {
  return (dispatch, getState) => {
    const { isAnimating } = getState().animation;

    if (isAnimating) {
      return;
    }

    dispatch({
      type: actionTypes.START_ANIMATION,
    });
    dispatch(animate());
  };
}

export function enableFreeScrolling() {
  return { type: actionTypes.ENABLE_FREE_SCROLLING };
}

export function disableFreeScrolling() {
  return { type: actionTypes.DISABLE_FREE_SCROLLING };
}

function animate(positionCloseCount = 0): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      animation,
      animation: { isAnimating, isFreeScrolling },
      options: { friction, attraction, direction, freeScrollFriction, loop },
      slider,
      slider: { selectedSlideIndex, x, y },
      slides,
      drag: { isPointerDown, dx, startX, dy, startY },
    } = getState();

    const isHorizontal = direction === 'horizontal';
    const axis = isHorizontal ? 'x' : 'y';
    const v = isHorizontal ? 'vx' : 'vy';

    const target = isPointerDown
      ? isHorizontal
        ? dx + startX
        : dy + startY
      : slides[selectedSlideIndex].target;

    const nextV = isPointerDown
      ? target - slider[axis]
      : isFreeScrolling
      ? animation[v]
      : (-target - slider[axis]) * attraction + animation[v];

    const sliderPostion = slider[axis] + nextV;

    dispatch({
      type: actionTypes.UPDATE_VELOCITY_POSITION,
      payload: {
        [axis]: sliderPostion,
        [v]: nextV * (1 - (isFreeScrolling ? freeScrollFriction : friction)),
      },
    });

    if (loop) {
      dispatch(findCellsShouldBeMoved());
    }

    if (
      !isPointerDown &&
      Math.round(sliderPostion * 100) === Math.round((isHorizontal ? x : y) * 100)
    ) {
      positionCloseCount++;
    }

    if (positionCloseCount === 3) {
      dispatch({
        type: actionTypes.STOP_ANIMATION,
      });
      dispatch(disableFreeScrolling());

      return;
    }

    if (isAnimating) {
      requestAnimationFrame(() => dispatch(animate(positionCloseCount)));
    }
  };
}
