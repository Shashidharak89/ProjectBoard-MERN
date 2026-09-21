import React from 'react';

export const Skeleton = ({ width, height, count = 1, className = '', style = {} }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`skeleton ${className}`}
          style={{
            width: width || '100%',
            height: height || '20px',
            marginBottom: count > 1 ? '10px' : '0',
            ...style,
          }}
        />
      ))}
    </>
  );
};
