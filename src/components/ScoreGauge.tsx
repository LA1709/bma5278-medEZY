import type { CSSProperties } from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const degrees = Math.max(0, Math.min(100, score)) * 3.6;
  return (
    <div className="score-gauge" style={{ '--score-angle': `${degrees}deg` } as CSSProperties}>
      <div className="score-gauge__inner">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
      <p>{label}</p>
    </div>
  );
}
