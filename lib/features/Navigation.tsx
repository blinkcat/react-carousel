import React from 'react';
import useCarouselControl from '../hooks/useCarouselControl';

export interface NavigationProps {
  // className?: string;
  // style?: React.CSSProperties;
}

const buttonStyle: React.CSSProperties = {
  position: 'absolute',
  width: 50,
  height: 50,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '26px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ccc',
  cursor: 'pointer',
  userSelect: 'none',
};

const leftButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  left: 0,
};

const rightButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  right: 0,
};

const Navigation: React.FC<NavigationProps> = () => {
  const { previous, next } = useCarouselControl();

  return (
    <>
      <div style={leftButtonStyle} onClick={() => previous()}>
        {'<'}
      </div>
      <div style={rightButtonStyle} onClick={() => next()}>
        {'>'}
      </div>
    </>
  );
};

export default Navigation;
