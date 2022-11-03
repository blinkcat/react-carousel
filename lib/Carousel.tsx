import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { CarouselOptions, createStore } from './core';
import { activate, reLayout, ReLayoutReason, updateCarouselSize } from './core/actions/carousel';
import { updateOptions } from './core/actions/options';
import { cellPositionSelectorWithId, sliderPositionSelector } from './core/selector';
import useCell from './hooks/useCell';
import useDispatch from './hooks/useDispatch';
import useDrag from './hooks/useDrag';
import useSelector, { shallow } from './hooks/useSelector';
import { ReduxStoreContext } from './ReduxStoreContext';
import getSize from './utils/get-size';

interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CarouselWithStore: React.FC<CarouselProps> = (props) => {
  const { debug } = props;
  const store = useMemo(
    () => createStore(debug),
    // it's fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ReduxStoreContext.Provider value={store}>
      <Carousel {...props} />
    </ReduxStoreContext.Provider>
  );
};

export interface CarouselProps extends BaseProps, Partial<CarouselOptions> {
  extra?: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children, className, style, extra, ...options }) => {
  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'relative',
      userSelect: options.draggable ? 'none' : 'auto',
      ...style,
    }),
    [style, options.draggable]
  );
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(updateOptions(options));
  }, [options, dispatch]);

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      dispatch(updateCarouselSize(getSize(ref.current)));
    }
    dispatch(activate());
  }, [dispatch]);

  return (
    <div className={className} style={mergedStyle} ref={ref}>
      <Viewport>
        <Slider>{children}</Slider>
      </Viewport>
      {extra}
    </div>
  );
};

interface ViewportProps extends BaseProps {}

const Viewport: React.FC<ViewportProps> = ({ className, style, children }) => {
  const mergedStyle = useSelector<React.CSSProperties>((state) => {
    const {
      slider: { selectedSlideIndex },
      slides,
      options: { direction },
    } = state;

    return {
      overflow: 'hidden',
      position: 'relative',
      ...style,
      ...(direction === 'horizontal'
        ? { height: slides[selectedSlideIndex]?.size.outerHeight || '100%' }
        : { width: slides[selectedSlideIndex]?.size.outerWidth || '100%', height: '100%' }),
    };
  }, shallow);

  const ref = useRef<HTMLDivElement>(null);

  useDrag(ref.current);

  return (
    <div className={className} style={mergedStyle} ref={ref}>
      {children}
    </div>
  );
};

interface SliderProps extends BaseProps {}

const Slider: React.FC<SliderProps> = ({ className, style, children }) => {
  const mergedStyle = useSelector<React.CSSProperties>((state) => {
    const { x, y } = sliderPositionSelector(state);

    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      ...style,
      transform: `translate(${x}px, ${y}px)`,
    };
  });

  const [keys, cells] = useMemo(() => {
    const keys: Array<string | number> = [];
    const cells = collectCellsFromChildren(children).map((child, index) => {
      keys.push(child.key || index);

      return (
        <CarouselCell index={index} key={child.key || index}>
          {child}
        </CarouselCell>
      );
    });

    return [JSON.stringify(keys), cells];
  }, [children]);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(reLayout(ReLayoutReason.CellsChanged));
  }, [dispatch, keys]);

  return (
    <div className={className} style={mergedStyle}>
      {cells}
    </div>
  );
};

function collectCellsFromChildren(children: React.ReactNode, cells: React.ReactElement[] = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === React.Fragment) {
      cells.push.apply(cells, collectCellsFromChildren(child.props.children));
      return;
    }

    cells.push(child);
  });

  return cells;
}

interface CarouselCellProps {
  index: number;
  children?: React.ReactNode;
}

const CarouselCell: React.FC<CarouselCellProps> = ({ children, index }) => {
  const [id, cellRef] = useCell(index);
  const style = useSelector<React.CSSProperties>((state) => {
    const { x, y } = cellPositionSelectorWithId(id)(state);

    return {
      position: 'absolute',
      [state.options.direction === 'horizontal' ? 'left' : 'top']: 0,
      transform: `translate(${x}px, ${y}px)`,
    };
  }, shallow);

  const child = useMemo(
    () => React.cloneElement(React.Children.only(children) as React.ReactElement, { ref: cellRef }),
    [children, cellRef]
  );

  return <div style={style}>{child}</div>;
};
