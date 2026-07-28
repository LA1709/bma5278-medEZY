import type { PillarResult } from '../lib/types';

export function PillarCard({ pillar }: { pillar: PillarResult }) {
  return (
    <article className="pillar-card">
      <div className="pillar-card__header">
        <div>
          <span className="eyebrow">{pillar.key}</span>
          <h3>{pillar.label}</h3>
        </div>
        <strong>{pillar.score}</strong>
      </div>
      <div className="progress-track" aria-label={`${pillar.label} score ${pillar.score} out of 100`}>
        <div className="progress-fill" style={{ width: `${pillar.score}%` }} />
      </div>
      <p className="pillar-observed">{pillar.observed}</p>
      <p className="muted small">{pillar.rationale}</p>
    </article>
  );
}
