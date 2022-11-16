import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { CarouselOptions, createStore } from './core';
import { activate, reLayout, ReLayoutReason, updateCarouselSize } from './core/actions/carousel';
import { updateOptions } from './core/actions/options';
import useCell from './hooks/useCell';
import useCellStyle from './hooks/useCellStyle';
import useDispatch from './hooks/useDispatch';
import useDrag from './hooks/useDrag';
import useSelector, { shallow } from './hooks/useSelector';
import useSliderStyle from './hooks/useSliderStyle';
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
  viewportClassName?: string;
  sliderClassName?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  style,
  extra,
  viewportClassName,
  sliderClassName,
  ...options
}) => {
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
    <div className={clazz('carousel', className)} style={style} ref={ref}>
      <Viewport className={viewportClassName}>
        <Slider className={sliderClassName}>{children}</Slider>
      </Viewport>
      {extra}
    </div>
  );
};

interface ViewportProps {
  children?: React.ReactNode;
  className?: string;
}

const Viewport: React.FC<ViewportProps> = ({ className, children }) => {
  const mergedStyle = useSelector<React.CSSProperties>((state) => {
    const {
      slider: { selectedSlideIndex },
      slides,
      options: { direction, setCarouselSize },
    } = state;
    const isHorizontal = direction === 'horizontal';

    if (setCarouselSize) {
      return isHorizontal
        ? { height: slides[selectedSlideIndex]?.size.outerHeight }
        : { width: slides[selectedSlideIndex]?.size.outerWidth, height: '100%' };
    } else {
      return isHorizontal ? { height: '100%' } : { width: '100%', height: '100%' };
    }
  }, shallow);

  const ref = useRef<HTMLDivElement>(null);

  useDrag(ref.current);

  return (
    <div className={clazz('carousel-viewport', className)} style={mergedStyle} ref={ref}>
      {children}
    </div>
  );
};

interface SliderProps {
  children?: React.ReactNode;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ children, className }) => {
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

  const style = useSliderStyle();

  return (
    <div className={clazz('carousel-slider', className)} style={style}>
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
  const style = useCellStyle(id);
  const child = useMemo(
    () => React.cloneElement(React.Children.only(children) as React.ReactElement, { ref: cellRef }),
    [children, cellRef]
  );

  return (
    <div className="carousel-cell" style={style}>
      {child}
    </div>
  );
};

function clazz(...args: Array<string | undefined>) {
  return args.filter(Boolean).join(' ');
}
