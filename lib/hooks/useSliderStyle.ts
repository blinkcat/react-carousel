import React from 'react';
import { alignPositionSelector, createSelector, sliderPositionSelector } from '../core/selector';
import useSelector, { shallow } from './useSelector';

export default function useSliderStyle(): React.CSSProperties {
  return useSelector((state) => {
    const {
      options: { effect },
    } = state;

    switch (effect) {
      case 'fade':
        return fadeStyle(state);
      case 'stack':
        return stackStyle(state);
      default:
        return defaultStyle(state);
    }
  }, shallow);
}

const defaultStyle = createSelector<React.CSSProperties>((state) => {
  const { x, y } = sliderPositionSelector(state);

  return { transform: `translate(${x}px, ${y}px)` };
});

const fadeStyle = createSelector<React.CSSProperties>((state) => {
  const { slides } = state;

  if (slides.length) {
    return {
      transform: `translate(${-slides[0].target + alignPositionSelector(state)}px, 0)`,
    };
  }

  return {};
});

const stackStyle = createSelector<React.CSSProperties>((state) => {
  const { slides } = state;

  if (slides.length) {
    return {
      perspective: 1200,
      transform: `translate(${-slides[0].target + alignPositionSelector(state)}px, 0)`,
    };
  }

  return {
    perspective: 1200,
  };
});
