import { Cell } from '../reducers/cells';
import { actionTypes, Slide } from '../reducers/slides';
import { cellAlignFactorSelector, cellsOrderByIndexSelector } from '../selector';
import { CssDirection, CarouselThunkAction } from '../types';

function createSlide(): Slide {
  return {
    x: 0,
    y: 0,
    target: 0,
    cells: [],
    size: { outerWidth: 0, outerHeight: 0, margin: [0, 0, 0, 0] },
  };
}

export function updateSlides(): CarouselThunkAction {
  return (dispatch, getState) => {
    const {
      options: { groupCells, direction },
    } = getState();
    const isHorizontal = direction === 'horizontal';
    const cellAlignFactor = cellAlignFactorSelector(getState());

    const canFit = (index: number) => {
      return index % groupCells !== 0;
    };

    let slide = createSlide();
    const slides: Slide[] = [];

    slides.push(slide);

    cellsOrderByIndexSelector(getState()).forEach((cell, index) => {
      if (slide.cells.length === 0) {
        pushCellIntoSlide(slide, cell, isHorizontal);
        return;
      }
      if (canFit(index)) {
        pushCellIntoSlide(slide, cell, isHorizontal);
      } else {
        updateSlideTarget(slide, cellAlignFactor, isHorizontal);
        slide = createSlide();
        slides.push(slide);
        pushCellIntoSlide(slide, cell, isHorizontal);
      }
    });

    updateSlideTarget(slide, cellAlignFactor, isHorizontal);
    dispatch({
      type: actionTypes.SET,
      payload: slides,
    });
  };
}

function pushCellIntoSlide(slide: Slide, cell: Cell, isHorizontal: boolean) {
  const axis = isHorizontal ? 'x' : 'y';
  const {
    cells,
    size,
    size: { margin },
  } = slide;

  if (cells.length === 0) {
    slide[axis] = cell[axis];
    if (isHorizontal) {
      margin[CssDirection.Left] = cell.size.margin[CssDirection.Left];
    } else {
      margin[CssDirection.Top] = cell.size.margin[CssDirection.Top];
    }
  }
  cells.push(cell.id);
  if (isHorizontal) {
    margin[CssDirection.Right] = cell.size.margin[CssDirection.Right];
    size.outerWidth += cell.size.outerWidth;
    size.outerHeight = Math.max(cell.size.outerHeight, slide.size.outerHeight);
  } else {
    margin[CssDirection.Down] = cell.size.margin[CssDirection.Down];
    size.outerHeight += cell.size.outerHeight;
    size.outerWidth = Math.max(cell.size.outerWidth, slide.size.outerWidth);
  }
}

function updateSlideTarget(slide: Slide, facotr: number, isHorizontal: boolean) {
  const {
    x,
    y,
    size: { margin, outerHeight, outerWidth },
  } = slide;

  if (isHorizontal) {
    // when slider.x approaches -slide.target, this slide will be displayed.
    slide.target =
      x +
      margin[CssDirection.Left] +
      (outerWidth - margin[CssDirection.Left] - margin[CssDirection.Right]) * facotr;
  } else {
    slide.target =
      y +
      margin[CssDirection.Top] +
      (outerHeight - margin[CssDirection.Top] - margin[CssDirection.Down]) * facotr;
  }
}
