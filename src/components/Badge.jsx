import React from 'react';

export function Badge({ children, color, dot = false, title = '' }) {
  return (
    <span className={`badge ${color}`} title={title}>
      {dot && <span className={`dot ${color}`}></span>}
      {children}
    </span>
  );
}
