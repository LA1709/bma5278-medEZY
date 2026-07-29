import { useMemo, useState, type ChangeEvent } from 'react';
import { Activity, Beaker, Stethoscope, ToggleLeft, ToggleRight } from 'lucide-react';
// import { Methodology } from './components/Methodology';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  CartesianGrid
} from "recharts";
import { PillarCard } from './components/PillarCard';
import { ScoreGauge } from './components/ScoreGauge';
import { SimulationLab } from './components/SimulationLab';
import { calculateLegacyScore } from './lib/scoringV1';
import { calculateMonitoringScore, formatStatus } from './lib/scoringV2';
import type { ScoreInputs, ScoreEntry } from './lib/types';

type Tab = 'calculator' | 'simulation';

const scenarios: Record<string, ScoreInputs> = {
  'On track': {
    systolic: 116,
    diastolic: 74,
    fastingGlucose: 108,
    adherencePercent: 94,
    moderateMinutes: 170,
    vigorousMinutes: 10,
    sleepHours: 7.6,
    bmi: 24.5,
    hrv: 56,
  },
  'Behavior gap': {
    systolic: 126,
    diastolic: 78,
    fastingGlucose: 122,
    adherencePercent: 68,
    moderateMinutes: 45,
    vigorousMinutes: 0,
    sleepHours: 5.8,
    bmi: 29.2,
    hrv: 35,
  },
  'Clinical gap': {
    systolic: 154,
    diastolic: 96,
    fastingGlucose: 188,
    adherencePercent: 86,
    moderateMinutes: 120,
    vigorousMinutes: 10,
    sleepHours: 6.7,
    bmi: 31.2,
    hrv: 31,
  },
  'Safety event': {
    systolic: 185,
    diastolic: 80,
    fastingGlucose: 110,
    adherencePercent: 92,
    moderateMinutes: 180,
    vigorousMinutes: 10,
    sleepHours: 7.8,
    bmi: 24.4,
    hrv: 58,
  },
  // 'Legacy MAP failure': {
  //   systolic: 180,
  //   diastolic: 60,
  //   fastingGlucose: 105,
  //   adherencePercent: 95,
  //   moderateMinutes: 180,
  //   vigorousMinutes: 15,
  //   sleepHours: 7.5,
  //   bmi: 24,
  //   hrv: 60,
  // },
};

let tempScore = 68 + Math.floor(Math.random() * 5); // 68–72
const baseline = tempScore;

const chartData: ScoreEntry[] = Array.from({ length: 31 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 30 + i);

  let delta: number;
  const r = Math.random();

  if (r < 0.65) {
    // Most days: tiny change
    delta = Math.floor(Math.random() * 5) - 2; // -2..2
  } else if (r < 0.9) {
    // Sometimes: noticeable change
    delta = Math.floor(Math.random() * 7) - 3; // -3..3
  } else {
    // Rarely: bad/good day
    delta = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.floor(Math.random() * 3)); // ±4..6
  }

  // Gentle pull back toward the baseline
  if (tempScore > baseline + 6) delta -= 1;
  if (tempScore < baseline - 6) delta += 1;

  tempScore = Math.max(50, Math.min(80, tempScore + delta));

  return {
    date: date.toISOString().split("T")[0],
    score: tempScore,
  };
});

const fieldConfig: Array<{
  key: keyof ScoreInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  legacy?: boolean;
}> = [
    { key: 'systolic', label: 'Systolic BP', unit: 'mmHg', min: 70, max: 230, step: 1 },
    { key: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', min: 40, max: 140, step: 1 },
    { key: 'fastingGlucose', label: 'Fasting glucose', unit: 'mg/dL', min: 35, max: 350, step: 1 },
    { key: 'adherencePercent', label: 'Adherence to Medication', unit: '%', min: 0, max: 100, step: 1 },
    { key: 'moderateMinutes', label: 'Moderate activity', unit: 'min/week', min: 0, max: 400, step: 5 },
    { key: 'vigorousMinutes', label: 'Vigorous activity', unit: 'min/week', min: 0, max: 200, step: 5 },
    { key: 'sleepHours', label: 'Average sleep', unit: 'hours/night', min: 3, max: 12, step: 0.1 },
    // { key: 'bmi', label: 'BMI (legacy only)', unit: 'kg/m²', min: 15, max: 45, step: 0.1, legacy: true },
    // { key: 'hrv', label: 'HRV (legacy only)', unit: 'ms', min: 5, max: 120, step: 1, legacy: true },
  ];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

const tooltipFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const ScoreHistoryChart = () => {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 24, left: 12, bottom: 12 }}
      >
        <CartesianGrid
          stroke="#e5e7eb"
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tickFormatter={(value) => dateFormatter.format(new Date(value))}
          minTickGap={20}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        >
          <Label
            value="Date"
            position="insideBottom"
            offset={-10}
            style={{ fill: "#6b7280" }}
          />
        </XAxis>

        <YAxis
          domain={[50, 80]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        >
          <Label
            value="Health Score"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle", fill: "#6b7280" }}
          />
        </YAxis>

        <Tooltip
          labelFormatter={(value) =>
            tooltipFormatter.format(new Date(value as string))
          }
          contentStyle={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          cursor={{ stroke: "#0f9f9a", strokeOpacity: 0.2 }}
        />

        <Line
          type="monotone"
          dataKey="score"
          stroke="#0f9f9a"
          strokeWidth={3}
          dot={{ r: 3, fill: "#0f9f9a", strokeWidth: 0 }}
          activeDot={{
            r: 6,
            fill: "#0f9f9a",
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const Calculator = ({ isDemo }: { isDemo: boolean }) => {
  const [preset, setPreset] = useState<string>('Clinical gap');
  const [input, setInput] = useState<ScoreInputs>(scenarios['Clinical gap']);
  const calculation = useMemo(() => {
    try {
      return {
        results: {
          v2: calculateMonitoringScore(input),
          v1: calculateLegacyScore(input),
        },
        error: '',
      };
    } catch (caught) {
      return {
        results: null,
        error: caught instanceof Error ? caught.message : 'Unable to calculate score.',
      };
    }
  }, [input]);

  const { results, error } = calculation;

  return (
    <section className="stack-xl">
      <div className="hero-grid">
        {isDemo ? <div>
          <span className="eyebrow">Explainable decision support prototype</span>
          <h1>The MedEZY Score</h1>
          <p className="hero-copy">
            A transparent five-pillar monitoring index with non-compensatory safety rules and a reproducible synthetic evaluation lab.
          </p>
        </div> : <div>
          <span className="eyebrow">Your Personal Health Assistant</span>
          <h1>Hi Anjali</h1>
          <p className="hero-copy">
            Know how you're doing today. Track your health, see your score, and discover small changes that can make a big difference.
          </p>
        </div>}
        <div className="callout warning">
          <strong>Academic prototype</strong>
          <span>(Not a diagnosis, treatment recommendation, or clinically<br />validated risk model)</span>
        </div>
      </div>

      {isDemo && <div className="scenario-row">
        <h3>Choose a preset:</h3>
        {Object.entries(scenarios).map(([name, values]) => (
          <button key={name} className={
            `scenario-button${preset === name ? " selected" : ""}`
          } onClick={() => {
            setPreset(name);
            setInput(values);
          }}> {name} </button>
        ))}
      </div>}

      <div className="calculator-layout">
        <aside className="panel input-panel">
          <span className="eyebrow">Patient scenario</span>
          <h2>Calculate Score</h2>
          <div className="input-grid">
            {fieldConfig.map((field) => (
              <label key={field.key} className={field.legacy ? 'legacy-field' : ''}>
                <span>{field.label}</span>
                <div className="number-input-wrap">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={input[field.key]}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setInput((current) => ({
                        ...current,
                        [field.key]: Number(event.target.value),
                      }))
                    }
                  />
                  <small>{field.unit}</small>
                </div>
              </label>
            ))}
          </div>
          {error && <p className="callout danger">{error}</p>}
          {/* <p className="muted small">BMI and HRV are retained only so the page can reconstruct the original v1 score.</p> */}
        </aside>

        {results && (
          <div className="stack-lg">
            <article className={`score-summary status-${results.v2.status.toLowerCase()}`}>
              <ScoreGauge score={results.v2.score} label="" />
              <div className="score-summary__content">
                <span className="status-badge">{formatStatus(results.v2.status)}</span>
                <h2>Monitoring status</h2>
                <ul className="explanation-list">
                  {results.v2.explanation.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="muted small">Data completeness: {results.v2.completeness}%</p>
              </div>
            </article>

            {results.v2.alerts.map((alert) => (
              <article key={alert.code} className={`callout ${alert.severity === 'critical' ? 'danger' : 'warning'}`}>
                <strong>{alert.severity === 'critical' ? 'Safety override' : 'Warning'}</strong>
                <span>{alert.message}</span>
              </article>
            ))}

            {isDemo ? <div className="pillar-grid">
              {results.v2.pillars.map((pillar) => <PillarCard key={pillar.key} pillar={pillar} />)}
            </div> : <ScoreHistoryChart />}

            {/* <article className="panel legacy-comparison">
              <div>
                <span className="eyebrow">Legacy reconstruction</span>
                <h3>Original v1 score</h3>
                <p className="muted">The old model uses MAP, seven weighted pillars, and no critical-event override.</p>
              </div>
              <div className="legacy-score">
                <strong>{results.v1.score}</strong>
                <span>{results.v1.category.replace(/_/g, ' ')}</span>
              </div>
              <div className="legacy-detail">
                <span>Legacy BP sub-score</span>
                <strong>{Math.round(results.v1.pillarScores.BP)}</strong>
              </div>
            </article> */}
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('calculator');
  const [isDemo, setIsDemo] = useState<boolean>(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setTab('calculator')}>
          <span className="brand-mark"><Stethoscope size={21} /></span>
          <span>MedEZY <small>Score Lab</small></span>
        </a>
        <nav>
          <button className={isDemo ? 'active' : ''} onClick={() => { setIsDemo(!isDemo); setTab('calculator') }}>
            {isDemo ? <ToggleRight /> : <ToggleLeft />} Demo Mode
          </button>
          <button className={tab === 'calculator' ? 'active' : ''} onClick={() => setTab('calculator')}>
            <Activity size={17} /> Calculator
          </button>
          {isDemo && <button className={tab === 'simulation' ? 'active' : ''} onClick={() => setTab('simulation')}>
            <Beaker size={17} /> Simulation Lab
          </button>}
          {/* <button className={tab === 'methodology' ? 'active' : ''} onClick={() => setTab('methodology')}>
            <BookOpen size={17} /> Methodology
          </button> */}
        </nav>
      </header>

      <main id="top">
        {tab === 'calculator' && <Calculator isDemo={isDemo} />}
        {tab === 'simulation' && <SimulationLab />}
        {/* {tab === 'methodology' && <Methodology />} */}
      </main>

      <footer>
        <span>MedEZY Monitoring Score v2.0</span>
        <span>Evidence-informed • Simulation-tested • Not clinically validated</span>
      </footer>
    </div>
  );
}
