import { actionTypes } from '../reducers/drag';
import { CarouselThunkAction } from '../types';
import { mod } from '../util';
import { startAnimation, enableFreeScrolling, disableFreeScrolling } from './animation';
import { select } from './slider';

export function dragStart(): CarouselThunkAction {
  return (dispatch) => {
    dispatch({
      type: actionTypes.DRAG_START,
    });
    dispatch(startAnimation());
  };
}

export function dragMove(coord: { x: number; y: number }): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider,
      slider: { slidableWidth, slidableHeight },
      slides,
      options: { direction, loop },
      drag: { startX, startY },
    } = getState();
    const isHorizontal = direction === 'horizontal';
    const axis = isHorizontal ? 'x' : 'y';

    if (loop) {
      dispatch({
        type: actionTypes.DRAG_MOVE,
        payload: isHorizontal
          ? // if you drag too far in one direction, keep x within normal range.
            { x: coord.x % slidableWidth, y: coord.y }
          : { x: coord.x, y: coord.y % slidableHeight },
      });
      return;
    }

    if (-slides[0].target < slider[axis]) {
      // stick to the left/top boundary
      dispatch({
        type: actionTypes.DRAG_MOVE,
        payload: isHorizontal
          ? { x: (coord.x - slides[0].target - startX) / 2, y: coord.y }
          : { x: coord.x, y: (coord.y - slides[0].target - startY) / 2 },
      });
    } else if (slider[axis] < -slides[slides.length - 1].target) {
      // stick to the right/bottom boundary
      dispatch({
        type: actionTypes.DRAG_MOVE,
        payload: isHorizontal
          ? { x: (coord.x - startX - slides[slides.length - 1].target) / 2, y: coord.y }
          : { x: coord.x, y: (coord.y - startY - slides[slides.length - 1].target) / 2 },
      });
    } else {
      dispatch({
        type: actionTypes.DRAG_MOVE,
        payload: coord,
      });
    }
  };
}

export function dragEnd(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      slider,
      slider: { selectedSlideIndex, slidableWidth, slidableHeight },
      slides,
      drag: { startTime, dx, dy },
      options: { direction, freeScrollFriction, friction, freeScroll, loop },
      animation,
    } = getState();
    const isHorizontal = direction === 'horizontal';
    const axis = isHorizontal ? 'x' : 'y';
    const v = isHorizontal ? 'vx' : 'vy';

    dispatch({
      type: actionTypes.DRAG_END,
    });
    /**
     * If the slider slides naturally at the current velocity, the end will be
     * slider.x = slider.x + velocity; velocity *= (1 - friction), until the velocity is close to a small number.
     * assume that a is velocity and b is (1-friction).
     * a*b^0 + a*b^1 + a*b^2 + a*b^3 + ... + a*b^n   (b<1)
     * we can conclude that: b^0 + b^1 + b^2 + ... + b^n = 1/(1-b)
     * prove:
     * (b^0 + b^1 + b^2 + ... + b^n)(1-b) = 1 - b^(n+1) = 1
     * b<1 => b^(n+1) =>0
     */
    const end = slider[axis] + animation[v] / (freeScroll ? freeScrollFriction : friction);
    let lMinDistance = Infinity;
    let lTargetIndex = selectedSlideIndex;

    for (let l = selectedSlideIndex; ; l--) {
      let index = l;

      if (index < 0) {
        if (!loop) {
          break;
        }

        index = mod(index, slides.length);
      }
      /**
       * in loop mode, there are 5 slides. the width of each slide is 1. slidableWidth is 5.
       * so the targets of slides are 0, 1, 2, 3, 4
       * current slide index is 0,
       * 4 [0] 1 2 3
       * drag to the right, end=0.8, next index should be 4.
       * 1 2 3 [4] 0
       * but target of the fifth slide is 4, |-4-end| > |0-end|, so the slide can't be selected.
       * -4 -3 -2 [-1] 0
       * actually, in this situation, the target should be 4 + Math.floor(-1/length) * slidableWidth = -1
       * |1-end| < |0-end|
       */
      const adjustment = loop
        ? Math.floor(l / slides.length) * (isHorizontal ? slidableWidth : slidableHeight)
        : 0;
      const distance = Math.abs(-slides[index].target - adjustment - end);

      if (distance >= lMinDistance) {
        break;
      }

      lMinDistance = distance;
      lTargetIndex = l;
    }

    let rMinDistance = Infinity;
    let rTargetIndex = selectedSlideIndex;

    for (let r = selectedSlideIndex; ; r++) {
      let index = r;

      if (r >= slides.length) {
        if (!loop) {
          break;
        }

        index = mod(index, slides.length);
      }

      const adjustment = loop
        ? Math.floor(r / slides.length) * (isHorizontal ? slidableWidth : slidableHeight)
        : 0;
      const distance = Math.abs(-slides[index].target - adjustment - end);

      if (distance >= rMinDistance) {
        break;
      }

      rMinDistance = distance;
      rTargetIndex = r;
    }

    let targetIndex = lMinDistance < rMinDistance ? lTargetIndex : rTargetIndex;

    if (!freeScroll && targetIndex === selectedSlideIndex && Date.now() - startTime < 100) {
      targetIndex += (isHorizontal ? dx : dy) > 0 ? -1 : 1;
    }

    if (freeScroll) {
      dispatch(enableFreeScrolling());

      if (!loop && (end > -slides[0].target || end < -slides[slides.length - 1].target)) {
        dispatch(disableFreeScrolling());
      }
    }

    dispatch(select(targetIndex));
  };
}

export function pointerDown(): CarouselThunkAction {
  return (dispatch, getState) => {
    const { x, y } = getState().slider;

    dispatch({
      type: actionTypes.POINTER_DOWN,
      payload: {
        startX: x,
        startY: y,
      },
    });
  };
}

export function pointerCancel() {
  return {
    type: actionTypes.POINTER_CANCEL,
  };
}

export function pointerUp() {
  return {
    type: actionTypes.POINTER_UP,
  };
}
