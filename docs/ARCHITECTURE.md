# Solution Architecture

```mermaid
flowchart LR
    A[Manual patient scenario] --> B[Input validation]
    G[Seeded synthetic generator] --> B
    B --> C[Critical safety rules]
    B --> D[Five pillar scoring functions]
    D --> E[Equal-weight composite]
    C --> F[Status guardrails]
    E --> F
    F --> H[Patient score UI]
    F --> I[Batch evaluation]
    I --> J[Confusion matrix and metrics]
    G --> K[CSV export]
```

## Layers

### Presentation layer

- React UI
- Scenario inputs
- Score gauge and pillar explanations
- Simulation dashboard

### Decision layer

- Input validation
- Safety-rule engine
- Pillar normalization
- Equal-weight composite
- Status guardrails

### Analytics layer

- Seeded synthetic cohort generation
- Independent scenario labels
- Confusion matrix
- Accuracy and macro F1
- Critical-event sensitivity
- False-reassurance rate

### Verification layer

- Vitest unit tests
- Reproducibility test
- Safety-boundary tests
- GitHub Actions CI
