# MedEZY Monitoring Score Lab

A GitHub-ready React + TypeScript prototype for **BMA5278 AI and Analytics in Business Practice**.

The project demonstrates how an apparently scientific health score can be redesigned into a more transparent and testable decision-support prototype.

## What the prototype contains

- Interactive patient score calculator
- Five transparent pillars: BP, fasting glucose, medication coverage, activity, and sleep
- Non-compensatory safety alerts
- Reconstruction of the original v1 algorithm for comparison
- Seeded synthetic-patient generator
- v1-versus-v2 batch evaluation
- Confusion matrix, macro F1, critical-event sensitivity, and false-reassurance rate
- CSV export
- Automated tests with Vitest

## Important status

This is an **evidence-informed academic prototype**. It is not clinically validated and must not be used for diagnosis, treatment, or patient care.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:3000`.

## Run tests

```bash
npm test
```

## Generate a reproducible dataset

```bash
npm run generate:data
```

Optional size and seed:

```bash
npm run generate:data -- 10000 5278
```

This creates:

```text
data/synthetic_patients.csv
data/validation_summary.json
```

## Build the production version

```bash
npm run build
```

## Reproducible reference run

Using 5,000 synthetic profiles and seed `5278`, the included output reports:

- Legacy v1 reference agreement: **67.0%**
- Revised v2 reference agreement: **82.0%**
- Legacy v1 critical-event sensitivity: **0.0%**
- Revised v2 critical-event sensitivity: **100.0%**

These are synthetic scenario metrics, not clinical-performance estimates. See [`RESULTS.md`](RESULTS.md).

## Repository structure

```text
src/
├── components/
│   ├── Methodology.tsx
│   ├── PillarCard.tsx
│   ├── ScoreGauge.tsx
│   └── SimulationLab.tsx
├── lib/
│   ├── csv.ts
│   ├── evaluation.ts
│   ├── scoringV1.ts
│   ├── scoringV2.ts
│   ├── synthetic.ts
│   └── types.ts
├── App.tsx
├── main.tsx
└── styles.css

tests/
├── scoringV2.test.ts
└── synthetic.test.ts

scripts/
└── generateDataset.ts

docs/
├── METHODOLOGY.md
└── PRESENTATION_GUIDE.md
```

## Push to GitHub

Create an empty repository on GitHub, then run:

```bash
git init
git add .
git commit -m "Build MedEZY Monitoring Score Lab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medezy-monitoring-score-lab.git
git push -u origin main
```

For later updates:

```bash
git add .
git commit -m "Describe the change"
git push
```

## Suggested project statement

> MedEZY Monitoring Score v2 is an evidence-informed and simulation-tested academic prototype. Recognized guidelines anchor the input categories, while equal weights and intermediate point values remain transparent product-design assumptions. Synthetic evaluation verifies software behavior but does not establish clinical accuracy.

## Evidence anchors

- American Heart Association: blood-pressure categories
- ADA Standards of Care in Diabetes—2026: common preprandial glucose target
- Pharmacy Quality Alliance: PDC adherence methodology and 80% threshold
- American Heart Association Life's Essential 8: activity and sleep targets

See [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) for details.
