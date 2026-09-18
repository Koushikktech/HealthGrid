# HealthGrid — Clinical Research Synthetic Cohort Platform

> **Tagline:** *“Generate synthetic cohorts. Validate before you use them.”*

HealthGrid is a clinical research data platform for generating privacy-aware synthetic patient cohorts from small healthcare datasets. It provides clinical researchers, biostatisticians, and digital health engineering teams with tools to steer target populations, model longitudinal trajectories, and rigorously validate synthetic data across statistical fidelity, predictive utility, and empirical privacy risk before export.

---

## Key Features & Scientific Highlights

- **Causal Steering vs. Baseline Resampling**:
  - Propagates covariate shifts (e.g. steering diabetic prevalence from 8% to 60%) through a clinically seeded Structural Causal Model (SCM). Downstream physiological markers (such as Systolic Blood Pressure) realistically shift rather than copying identical training records.
  - Interactive **Baseline Comparator Toggle** allows direct side-by-side contrast with standard Gaussian Copula resampling.
- **The Extrapolation Meter**:
  - An honesty indicator that transparently scores how far requested cohort parameters diverge from observed sample density, distinguishing empirical interpolation from model-assumed extrapolation.
- **Comprehensive Holdout Validation Suite**:
  - **Fidelity**: Kolmogorov-Smirnov (KS) divergence, Earth Mover's (Wasserstein) distance, Correlation Matrix Frobenius delta, and Classifier Two-Sample Test (C2ST AUC ≈ 0.52).
  - **Utility**: Train-on-Synthetic, Test-on-Real (TSTR) predictive AUROC benchmarking and feature importance concordance (Kendall's $\tau$).
  - **Temporal**: 12-week longitudinal trajectory progression with Markov adherence transitions (`Adherent → Lapsing → Discontinued`) and Missing Not At Random (MNAR) dropout curves.
- **Empirical Attack-Based Privacy Suite**:
  - Grounded in *ESORICS 2025 (The DCR Delusion)*: evaluates adversarial shadow-model Membership Inference Attacks (MIA AUC), relative DCR (rDCR = Train-DCR / Holdout-DCR), and quarantines near-duplicate records within empirical isolation thresholds for manual review.
- **Dynamic Fitness-for-Purpose & Cohort Passport**:
  - Re-evaluates approval verdicts (`PASS` / `CONDITIONAL` / `FAIL`) against declared use cases:
    1. **Software QA & Pipeline Load Testing**
    2. **Machine Learning Model Development**
    3. **External Sharing & Scientific Dissemination**
  - Generates a scientific **Cohort Passport** artifact hash-linked via SHA-256 to the synthetic dataset CSV.
- **API-Ready Architecture**:
  - Modular service layer in `src/services/api/` reading `VITE_API_BASE_URL` with typed service contracts, ready for immediate connection to a Node.js + Express backend.

---

## Application Structure

The platform is organized into 8 streamlined clinical sections:

1. **Overview**: Executive dashboard with dataset statistics, validation quadrant cards, real vs. synthetic distribution chart, and next recommended workflow step.
2. **Datasets**: Healthcare dataset catalog table with schema profiling, data quality checks, and CSV upload modal.
3. **Cohort Builder**: Interactive parameter sliders (Age, Diabetes %, HTN %, Adherence, Sex, Duration), live Extrapolation Meter, and inspectable Causal DAG.
4. **Generation Runs**: 5-stage pipeline timeline (`Profile → Config → Generation → Validation → Approval`) and historical audit log.
5. **Validation Suite**: Unified hub featuring:
   - *Validation Overview*
   - *Distributions* (Real vs. Synthetic with baseline comparator)
   - *Relationship Fidelity* (Pairwise correlation heatmaps)
   - *Temporal Trajectories* (12-week SBP drift and MNAR dropout)
6. **Privacy Risk**: Empirical MIA attack indicators, rDCR ratio, nearest record distance, and near-duplicate review table.
7. **Cohort Passport**: Formal evidence report certifying fitness-for-purpose with transparent rationale, audit trail, and export controls.
8. **Exports**: Download synthetic patient CSV (5,000 records), Passport JSON, and Validation PDF.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Calm, clinical light-mode palette)
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Typography**: Inter & IBM Plex Sans

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/Koushikktech/HealthGrid.git
cd HealthGrid

# Install dependencies
npm install

# Launch development server
npm run dev
```

The application will be running at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```

---

## Research & Compliance Considerations

- **Empirical Indicators, Not Legal Certification**: HealthGrid provides quantitative statistical and empirical privacy metrics to assist research sponsors, IRBs, and Data Protection Officers (DPOs). Synthetic data generation is not an automatic guarantee of legal anonymization under statutes such as the India DPDP Act (2023/2025 Rules), HIPAA, or GDPR.
- **Model Assumptions**: The causal graph represents clinically seeded model assumptions derived from published literature (e.g. NHANES, AHA cardiometabolic models) and does not constitute automated causal discovery.
