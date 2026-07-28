# Reproducible Synthetic Evaluation Results

Default run:

```text
Cohort size: 5,000
Random seed: 5278
```

| Metric | Legacy v1 | Revised v2 |
|---|---:|---:|
| Reference-scenario agreement | 67.0% | 82.0% |
| Macro F1 | 50.7% | 80.3% |
| Critical-event sensitivity | 0.0% | 100.0% |
| Critical false-reassurance rate | 0.2% | 0.0% |

## Interpretation

The revised algorithm detected every injected critical event in this synthetic run. The original algorithm had no `ACTION_REQUIRED` output and therefore detected none of them as critical.

These results measure behavior against predefined synthetic scenario labels. They are not estimates of real-world clinical accuracy.

## Reproduce

```bash
npm install
npm run generate:data -- 5000 5278
npm test
```
