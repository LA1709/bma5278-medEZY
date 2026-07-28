# Methodology

## Intended use

The MedEZY Monitoring Score is designed for an academic demonstration involving adults with type 2 diabetes and hypertension who are monitoring health indicators at home.

It is not designed to diagnose disease, estimate mortality, select treatment, or replace professional review.

## Formula

Five pillar scores are calculated on a 0–100 scale:

```text
Base score = (BP + glucose + adherence + activity + sleep) / 5
```

Equal weighting was selected to avoid unsupported precision. The 20% weights are not learned coefficients and do not represent the relative causal importance of the five domains.

## Safety-first sequence

1. Validate physiological input ranges.
2. Detect critical BP and glucose rules.
3. Calculate the five pillar scores.
4. Calculate the equal-weight composite.
5. Apply status guardrails.
6. Display the score, safety status, and explanation separately.

## Evidence anchors

### Blood pressure

The prototype follows the American Heart Association categories:

- Normal: below 120 and below 80
- Elevated: 120–129 and below 80
- Stage 1: 130–139 or 80–89
- Stage 2: at least 140 or at least 90
- Severe threshold: above 180 and/or above 120

Source: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings

### Fasting/premeal glucose

The ADA Standards of Care in Diabetes—2026 list 80–130 mg/dL as a common preprandial target for many nonpregnant adults. The application also includes explicit low-glucose guardrails.

Source: https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic

### Medication adherence

PQA uses Proportion of Days Covered (PDC) for chronic medication adherence and an 80% threshold for several measures. If the application only has self-reported logs, the field should be described as dose completion rather than PDC.

Source: https://www.pqaalliance.org/adherence-measures

### Activity and sleep

AHA Life's Essential 8 identifies:

- 150 minutes of moderate or 75 minutes of vigorous activity weekly
- 7–9 hours of sleep for most adults

Source: https://www.heart.org/en/healthy-living/healthy-lifestyle/lifes-essential-8

## Product-design assumptions

The following are not clinically validated:

- Equal weights
- Intermediate point assignments
- Overall status cutoffs
- Synthetic phenotype distributions
- Synthetic reference labels

## Synthetic evaluation

The generator creates four patient archetypes:

- On track
- Behavioral gap
- Clinical gap
- Safety event

The reference label is generated independently from the composite score. Evaluation metrics therefore measure agreement with a prespecified rule set rather than with the score itself.

Reported metrics include:

- Overall agreement
- Macro F1
- Critical-event sensitivity
- Critical false-reassurance rate
- Confusion matrix

## Required future validation

Clinical validation would require:

- A defined target population and outcome
- Real patient data
- Prespecified analysis
- Internal and external validation
- Calibration and discrimination
- Subgroup analysis
- Prospective testing
- Evaluation of real decision and patient outcomes
