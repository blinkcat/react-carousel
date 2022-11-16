import React from 'react';
import { mod } from '../core';
import { Cell } from '../core/reducers/cells';
import {
  cellPositionSelectorWithId,
  createSelectorWithArgs,
  findSlideByCellId,
  getSlideProgressByIndex,
} from '../core/selector';
import useSelector, { shallow } from './useSelector';

export default function useCellStyle(id: Cell['id']) {
  return useSelector((state) => {
    const {
      options: { effect },
    } = state;

    switch (effect) {
      case 'lift':
        return liftStyle(id)(state);
      case 'fade':
        return fadeStyle(id)(state);
      case 'stack':
        return stackStyle(id)(state);
      default:
        return defaultStyle(id)(state);
    }
  }, shallow);
}

const defaultStyle = createSelectorWithArgs<React.CSSProperties, Cell['id']>((id) => (state) => {
  const { x, y } = cellPositionSelectorWithId(id)(state);

  return { transform: `translate(${x}px, ${y}px)` };
});

const liftStyle = createSelectorWithArgs<React.CSSProperties, Cell['id']>((id) => (state) => {
  const { x, y } = cellPositionSelectorWithId(id)(state);
  const indexAndSlide = findSlideByCellId(id)(state);

  let progress = 0;

  if (indexAndSlide) {
    progress = getSlideProgressByIndex(indexAndSlide[0])(state);
  }

  return {
    transform: `translate3d(${x}px, ${y - 20 * progress}px, 0)`,
  };
});

const fadeStyle = createSelectorWithArgs<React.CSSProperties, Cell['id']>((id) => (state) => {
  const { x, y } = state.cells[id];
  const indexAndSlide = findSlideByCellId(id)(state);

  let progress = 0;
  let sx = 0;

  if (indexAndSlide) {
    progress = getSlideProgressByIndex(indexAndSlide[0])(state);
    sx = indexAndSlide[1].x;
  }

  return {
    transform: `translate(${x - sx}px, ${y}px)`,
    opacity: progress,
  };
});

const stackStyle = createSelectorWithArgs<React.CSSProperties, Cell['id']>((id) => (state) => {
  const indexAndSlide = findSlideByCellId(id)(state);
  const {
    slides,
    slider,
    cells,
    options: { loop },
  } = state;

  if (slides.length === 0 || cells[id] == null || indexAndSlide == null) {
    return {};
  }

  let i = 0;

  for (; i < slides.length; i++) {
    if (-slider.x < slides[i].target - 1) {
      break;
    }
  }

  if (i === 0) {
    if (loop) {
      i = slides.length - 1;
    }
  } else {
    i--;
  }

  const {
    x,
    y,
    size: { outerWidth },
  } = cells[id];
  const si = indexAndSlide[0];
  const sx = indexAndSlide[1].x;
  const actualIndex = mod(si - i, slides.length);
  const xStep = 20;
  const zStep = 80;

  let tx = x - sx + actualIndex * xStep;
  let tz = -actualIndex * zStep;

  let progress = 0;

  progress = getSlideProgressByIndex(i)(state);

  if (i === si) {
    tx -= (1 - progress) * outerWidth;
  } else {
    tx -= (1 - progress) * xStep;
    tz += (1 - progress) * zStep;
  }

  return {
    transform: `translate3d(${tx}px, ${y}px, ${tz}px)`,
    zIndex: slides.length - actualIndex,
  };
});
