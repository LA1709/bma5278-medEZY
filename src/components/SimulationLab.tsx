import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, Play, RefreshCw } from 'lucide-react';
import { cohortToCsv, downloadText } from '../lib/csv';
import { evaluateV1, evaluateV2, STATUS_ORDER } from '../lib/evaluation';
import { formatStatus } from '../lib/scoringV2';
import { generateCohort } from '../lib/synthetic';
import type { SyntheticPatient } from '../lib/types';

function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function MetricCard({ label, description, v2 }: { label: string; description: string, v2: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <div className="metric-comparison">
        {/* <div><small>Legacy v1</small><strong>{v1}</strong></div> */}
        <div><small>{description}</small><strong>{v2}</strong></div>
      </div>
    </article>
  );
}

export function SimulationLab() {
  const [size, setSize] = useState(500);
  const [seed, setSeed] = useState(888);
  const [cohort, setCohort] = useState<SyntheticPatient[]>(() => generateCohort(500, 888));

  const v1 = useMemo(() => evaluateV1(cohort), [cohort]);
  const v2 = useMemo(() => evaluateV2(cohort), [cohort]);

  const chartData = STATUS_ORDER.map((status) => ({
    status: formatStatus(status),
    'Legacy v1': v1.predictedCounts[status] ?? 0,
    'Revised v2': v2.predictedCounts[status] ?? 0,
  }));

  const regenerate = () => setCohort(generateCohort(size, seed));

  return (
    <section className="stack-xl">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Synthetic evaluation - for grading</span>
          <h2>Score Simulation Lab</h2>
          <p>
            Generate sample data, Inspect the generated data and See our model in action!
          </p>
        </div>
      </div>

      <p className="callout neutral">
        <b>For Academic Demonstration:</b>This simulator is intended for model evaluation using synthetic cohorts; the customers can only access the Score Calculator.
      </p>

      <div className="control-panel">
        <label>
          Cohort size
          <input
            type="number"
            min={100}
            max={10000}
            step={100}
            value={size}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSize(Number(event.target.value))}
          />
        </label>
        <label>
          Random seed
          <input
            type="number"
            value={seed}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSeed(Number(event.target.value))}
          />
        </label>
        <button className="button primary" onClick={regenerate}>
          <Play size={17} /> Run simulation
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setSeed(888);
            setSize(500);
            setCohort(generateCohort(500, 888));
          }}
        >
          <RefreshCw size={17} /> Reset
        </button>
        <button
          className="button secondary"
          onClick={() => downloadText('synthetic_patients.csv', cohortToCsv(cohort), 'text/csv')}
        >
          <Download size={17} /> Export CSV
        </button>
      </div>

      <article className="panel">
        <span className="eyebrow">Generated Samples</span>
        <h3>First 10 Rows of the Generated Cohort (Total {cohort.length})</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phenotype</th>
                <th>BP</th>
                <th>Glucose</th>
                <th>Adherence</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {cohort.slice(0, 10).map((patient) => (
                <tr key={patient.patientId}>
                  <td>{patient.patientId}</td>
                  <td>{patient.phenotype}</td>
                  <td>{patient.systolic}/{patient.diastolic}</td>
                  <td>{patient.fastingGlucose}</td>
                  <td>{patient.adherencePercent}%</td>
                  <td>{formatStatus(patient.expectedStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="two-column wide-left">

        <article className="panel">
          <span className="eyebrow">Results Distribution</span>
          <h3>Confusion matrix</h3>
          <div className="confusion-wrap">
            <table className="confusion-table">
              <thead>
                <tr>
                  <th>Predicted →<br />vs. Actual ↓</th>
                  {STATUS_ORDER.map((status) => <th key={status}>{formatStatus(status)}</th>)}
                </tr>
              </thead>
              <tbody>
                {STATUS_ORDER.map((actual) => (
                  <tr key={actual}>
                    <th>{formatStatus(actual)}</th>
                    {STATUS_ORDER.map((predicted) => (
                      <td
                        key={predicted}
                        className={actual === predicted ? 'matrix-correct' : ''}
                      >
                        {v2.confusion[actual][predicted]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <br />
          <p className="muted small">Note: This shows our model's performance on the above generated cohort.</p>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Model Performance</span>
              <h3>Predicted status by algorithm</h3>
            </div>
          </div>
          {/* <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Legacy v1" fill="#94a3b8" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Revised v2" fill="#0f9f9a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> */}
          <div className="metrics-grid">
            <MetricCard label="Model Accuracy" description="= Correct Predictions / Total Data Points" v2={percentage(v2.accuracy)} />
            <MetricCard label="Macro F1 Score" description="= Harmonic Mean of Precision & Recall" v2={percentage(v2.macroF1)} />
            <MetricCard label="Criticality Detection" description="Revised v2" v2={percentage(v2.criticalSensitivity)} />
            <MetricCard label="False Negatives" description="Revised v2" v2={percentage(v2.falseReassuranceRate)} />
          </div>
        </article>
      </div>

      <article className="panel">
        <span className="eyebrow">Error analysis</span>
        <h3>First 10 Disagreements (Out of Total {v2.misclassified.length})</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phenotype</th>
                <th>BP</th>
                <th>Glucose</th>
                <th>Adherence</th>
                <th>Reference</th>
                <th>Predicted</th>
              </tr>
            </thead>
            <tbody>
              {v2.misclassified.slice(0, 10).map(({ patient, predicted }) => (
                <tr key={patient.patientId}>
                  <td>{patient.patientId}</td>
                  <td>{patient.phenotype}</td>
                  <td>{patient.systolic}/{patient.diastolic}</td>
                  <td>{patient.fastingGlucose}</td>
                  <td>{patient.adherencePercent}%</td>
                  <td>{formatStatus(patient.expectedStatus)}</td>
                  <td>{formatStatus(predicted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
