import { Cell } from './reducers/cells';
import { Selector } from './types';
import { cells2Array, mod } from './util';

// for typescript
function createSelector<T>(selector: Selector<T>): Selector<T> {
  return selector;
}

function createSelectorWithArgs<T, A>(f: (arg0: A) => Selector<T>): (arg0: A) => Selector<T>;
function createSelectorWithArgs<T, A, B>(
  f: (arg0: A, arg1: B) => Selector<T>
): (arg0: A, arg1: B) => Selector<T>;
function createSelectorWithArgs<T, A, B, C>(
  f: (arg0: A, args1: B, arg2: C) => Selector<T>
): (arg0: A, args1: B, arg2: C) => Selector<T>;
function createSelectorWithArgs(f: any) {
  return f;
}

export const cellAlignFactorSelector = createSelector(
  (state) =>
    ({
      left: 0,
      center: 0.5,
      right: 1,
    }[state.options.cellAlign])
);

export const cellPositionSelectorWithId = createSelectorWithArgs((id: Cell['id']) => (state) => {
  const {
    cells,
    slider: {
      cellsShouldBeMovedForward: cellsNeedToBeMovedToTheLeft,
      cellsShouldBeMovedBackward: cellsNeedToBeMovedToTheRight,
      slidableWidth,
      slidableHeight,
    },
    options: { loop, direction },
  } = state;
  const isHorizontal = direction === 'horizontal';

  if (loop && cellsNeedToBeMovedToTheLeft.includes(id)) {
    return isHorizontal
      ? {
          x: (cells[id]?.x || 0) - slidableWidth,
          y: cells[id]?.y || 0,
        }
      : {
          x: cells[id]?.x || 0,
          y: (cells[id]?.y || 0) - slidableHeight,
        };
  }

  if (loop && cellsNeedToBeMovedToTheRight.includes(id)) {
    return isHorizontal
      ? {
          x: (cells[id]?.x || 0) + slidableWidth,
          y: cells[id]?.y || 0,
        }
      : {
          x: cells[id]?.x || 0,
          y: (cells[id]?.y || 0) + slidableHeight,
        };
  }

  return {
    x: cells[id]?.x || 0,
    y: cells[id]?.y || 0,
  };
});

export const alignPositionSelector = createSelector((state) => {
  const {
    carousel: {
      size: { width, height },
    },
    options: { direction },
  } = state;

  return (direction === 'horizontal' ? width : height) * cellAlignFactorSelector(state);
});

export const sliderPositionSelector = createSelector((state) => {
  const {
    slider,
    slider: { slidableWidth, slidableHeight },
    options: { direction, loop },
  } = state;
  const alignPosition = alignPositionSelector(state);

  if (direction === 'horizontal') {
    let x = slider.x;
    if (loop) {
      /**
       * assume there are 5 slides，and the width of each slide is 1.
       * so the targets are 0, 1, 2, 3, 4. slidableWidth is 5.
       * to the left, x is from 0 to -infinity. to the right, x is from 0 to infinity.
       * -6 -5 -4 -3 -2 -1  0  1  2  3  4  5  6   <= x
       * -1 -5 -4 -3 -2 -1 -5 -4 -3 -2 -1 -5 -4   <= after calculation
       */
      x = mod(x, slidableWidth) - slidableWidth;
    }
    return { x: x + alignPosition, y: 0 };
  }

  let y = slider.y;

  if (loop) {
    y = mod(y, slidableHeight) - slidableHeight;
  }

  return { x: 0, y: y + alignPosition };
});

export const cellsOrderByIndexSelector = createSelector((state) => cells2Array(state.cells));
