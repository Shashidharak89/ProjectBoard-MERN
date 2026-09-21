import React from 'react';

export const ProgressBar = ({ progress = 0, showLabel = true }) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = clampedProgress === 100;

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
