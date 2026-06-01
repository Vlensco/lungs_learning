import React from 'react';
import { partData } from '../data/partData';

export default function MiniLegend({ counts, exploredCount, lang }) {
  const totalCount = partData.length;
  const progressPercent = Math.round((exploredCount / totalCount) * 100);

  return (
    <div className="progress-dashboard">
      <div className="circular-progress-row">
        <div className="circular-progress-svg-container">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="circle" strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="20.35" className="percentage">{progressPercent}%</text>
          </svg>
        </div>
        <div>
          <h3>{lang === 'id' ? 'Progress Eksplorasi' : 'Learning Progress'}</h3>
          <p>
            {lang === 'id' 
              ? `${exploredCount} dari ${totalCount} bagian dipelajari` 
              : `${exploredCount} of ${totalCount} structures studied`}
          </p>
        </div>
      </div>
      <div className="mini-legend">
        {Object.entries(counts).map(([key, value]) => {
          let categoryName = key;
          if (lang === 'en') {
            if (key === 'Saluran Napas') categoryName = 'Airways';
            else if (key === 'Lobus Paru') categoryName = 'Lobes';
            else if (key === 'Fisura') categoryName = 'Fissures';
            else if (key === 'Mikro') categoryName = 'Micro';
            else if (key === 'Mekanisme Bernapas') categoryName = 'Mechanics';
          }
          return (
            <div key={key} className="legend-chip">
              <strong>{value}</strong>
              <span>{categoryName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
