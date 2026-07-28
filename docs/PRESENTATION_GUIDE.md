# Presentation Guide

## Recommended narrative

1. **Problem:** A single health score is easy to understand, but unsupported weights can create false confidence.
2. **Audit finding:** The original v1 algorithm used MAP, hand-selected weights, and no critical-event override.
3. **Failure example:** 180/60 mmHg produces MAP 100 and can receive a perfect BP score in v1.
4. **Redesign:** Five guideline-linked pillars, equal weighting, and explicit safety rules.
5. **Architecture:** Validate → safety check → score → guardrail → explanation.
6. **Evaluation:** Generate reproducible synthetic patients and compare v1 with v2.
7. **Results:** Report the actual output from the Simulation Lab.
8. **Business value:** More transparent patient engagement and a safer basis for future development.
9. **Limitations:** Simulation testing is not clinical validation.

## Suggested live demonstration

1. Open the **Legacy MAP failure** scenario.
2. Point out the legacy BP sub-score and revised BP pillar.
3. Open the **Safety event** scenario and show the critical override.
4. Open **Simulation Lab**.
5. Run 5,000 patients with seed 5278.
6. Compare critical-event detection and false reassurance.
7. Export the CSV.

## Suggested slide title

> From AI-Generated Score to Explainable Decision-Support Prototype
