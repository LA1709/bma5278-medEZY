export function Methodology() {
  return (
    <section className="stack-xl methodology">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Documentation</span>
          <h2>Methodology and limitations</h2>
          <p>What is sourced, what is a design choice, and what still requires clinical validation.</p>
        </div>
      </div>

      <div className="two-column">
        <article className="panel">
          <span className="eyebrow">Evidence anchors</span>
          <h3>Guideline-linked inputs</h3>
          <ul className="clean-list">
            <li><strong>Blood pressure:</strong> AHA/ACC categories use systolic and diastolic values independently.</li>
            <li><strong>Glucose:</strong> ADA 2026 lists 80–130 mg/dL as a common preprandial goal for many nonpregnant adults.</li>
            <li><strong>Medication adherence:</strong> PQA uses PDC and an 80% threshold for several chronic medication measures.</li>
            <li><strong>Activity:</strong> AHA recommends 150 moderate or 75 vigorous minutes weekly.</li>
            <li><strong>Sleep:</strong> AHA Life's Essential 8 identifies 7–9 hours as the adult target range.</li>
          </ul>
        </article>

        <article className="panel">
          <span className="eyebrow">Prototype choices</span>
          <h3>Not clinically validated</h3>
          <ul className="clean-list">
            <li>The equal 20% weights are a transparency choice, not estimated clinical-risk coefficients.</li>
            <li>Intermediate point values such as 70, 60, 50 and 30 are design choices.</li>
            <li>The synthetic reference labels are scenario rules, not observed patient outcomes.</li>
            <li>Simulation verifies implementation behavior; it cannot prove effectiveness in patients.</li>
          </ul>
        </article>
      </div>

      <article className="panel">
        <span className="eyebrow">Safety architecture</span>
        <h3>Why a weighted score is not enough</h3>
        <div className="architecture-flow">
          <div><strong>1</strong><span>Validate inputs</span></div>
          <span>→</span>
          <div><strong>2</strong><span>Check critical rules</span></div>
          <span>→</span>
          <div><strong>3</strong><span>Score five pillars</span></div>
          <span>→</span>
          <div><strong>4</strong><span>Apply status guardrails</span></div>
          <span>→</span>
          <div><strong>5</strong><span>Explain output</span></div>
        </div>
      </article>

      <article className="panel">
        <span className="eyebrow">Primary sources</span>
        <h3>References used by the prototype</h3>
        <ul className="reference-list">
          <li><a href="https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings" target="_blank" rel="noreferrer">American Heart Association — Understanding Blood Pressure Readings</a></li>
          <li><a href="https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic" target="_blank" rel="noreferrer">ADA Standards of Care in Diabetes—2026, Section 6</a></li>
          <li><a href="https://www.pqaalliance.org/adherence-measures" target="_blank" rel="noreferrer">Pharmacy Quality Alliance — Adherence Measures</a></li>
          <li><a href="https://www.heart.org/en/healthy-living/healthy-lifestyle/lifes-essential-8" target="_blank" rel="noreferrer">American Heart Association — Life's Essential 8</a></li>
        </ul>
      </article>
    </section>
  );
}
