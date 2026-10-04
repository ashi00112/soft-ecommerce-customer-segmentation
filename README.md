# Soft E-commerce Customer Segmentation and Retention Prioritization

## 1. Business Problem
In competitive e-commerce environments, customer retention is substantially more cost-effective than customer acquisition. However, conventional customer segmentation frameworks often assign customers to rigid, mutually exclusive segments ("hard clustering"). Real-world customer behavior is continuous and multifaceted: a customer may exhibit browsing traits of bargain hunters while occasionally displaying the basket size of high-value shoppers.

Forcing customers into hard boundaries introduces boundary classification errors and obscures behavioral transitions. This project develops an unsupervised **soft customer segmentation system** that quantifies **segment-membership uncertainty and ambiguity**. By combining continuous segment affinities with post-clustering business metrics—specifically **Customer Lifetime Value (CLV)** and **Churn Risk Score**—the system enables targeted, high-priority retention interventions.

The system is delivered end-to-end: trained models and evaluation live in Jupyter notebooks, and a **FastAPI backend + React frontend** expose the final model as an interactive retention-prioritization tool.

---

## 2. Unsupervised Clustering Task & Soft Clustering Objective
- **Unsupervised Learning**: Customer segmentation operates without ground-truth labels. Clusters emerge naturally from customer engagement, purchase frequency, monetary patterns, and channel interactions.
- **Soft Clustering Objective**: Rather than assigning each customer to a single discrete cluster ($k \in \{1, \dots, K\}$), the primary models output continuous membership probability vectors:
  $$P(\text{Cluster } k \mid \mathbf{x}_i) \quad \text{such that} \quad \sum_{k=1}^K P(\text{Cluster } k \mid \mathbf{x}_i) = 1$$
  From these distributions, a **Segment Ambiguity Score** is computed as **normalized Shannon entropy** (natural log, normalized by $\ln(K)$). High ambiguity indicates transitional or hybrid customers who require specialized marketing strategies.

---

## 3. Four Candidate Algorithms — Implemented & Compared
The project implemented, tuned, and compared four clustering algorithms on the same feature set:

| # | Algorithm | Notebook | Role |
|---|---|---|---|
| 1 | **K-Means** | [`02_KMeans.ipynb`](notebooks/02_KMeans.ipynb) | Hard-clustering baseline (Lloyd's algorithm, Euclidean distance). Benchmark for geometric separation. |
| 2 | **Gaussian Mixture Model (GMM)** | [`03_GMM.ipynb`](notebooks/03_GMM.ipynb) | Probabilistic generative soft clustering fitted via EM; yields posterior cluster probabilities. |
| 3 | **Fuzzy C-Means (FCM)** | [`04_Fuzzy_CMeans.ipynb`](notebooks/04_Fuzzy_CMeans.ipynb) | Soft clustering with fuzzy membership exponent $m>1$. **Selected as the final production model.** |
| 4 | **Agglomerative Hierarchical Clustering** | [`05_Agglomerative.ipynb`](notebooks/05_Agglomerative.ipynb) | Deterministic bottom-up linkage on a reproducible 2,500-customer sample; dendrogram structure analysis. |

Comparison, final model selection, and retention-scoring design are consolidated in [`06_Model_Comparison.ipynb`](notebooks/06_Model_Comparison.ipynb) and [`07_Retention_Prioritization.ipynb`](notebooks/07_Retention_Prioritization.ipynb). Per-algorithm methodology write-ups live under [`docs/`](docs/) (e.g. [`docs/README_KMeans.md`](docs/README_KMeans.md)).

---

## 4. Common Preprocessing Workflow & Feature Design
To ensure fair algorithm comparison, all models consume a standardized, leakage-free feature pipeline built in [`01_EDA_Preprocessing.ipynb`](notebooks/01_EDA_Preprocessing.ipynb).

### Primary Clustering Features (12 Raw Features → 18 Processed Features):
- **10 Numerical Features** (Standardized using `StandardScaler`):
  `tenure_months`, `total_purchases`, `avg_order_value_usd`, `days_since_last_purchase`, `return_count`, `complaint_count`, `satisfaction_score`, `email_open_rate`, `click_through_rate`, `conversion_rate`
- **2 Categorical Features** (Encoded using `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`):
  - `shopping_channel` → `In-Store`, `Marketplace`, `Mobile App`, `Online` (4 categories)
  - `device_used` → `Desktop`, `Mobile`, `Multiple`, `Tablet` (4 categories)

### Variables Excluded from Model Training:
- **`customer_id`**: Identifier only, dropped prior to fitting.
- **`customer_lifetime_value_usd` & `churn_risk_score`**: Preserved strictly in separate business data files to prevent circular data leakage into cluster formation. Used only after clustering, in retention prioritization (Section 7).
- **Demographics & optional variables**: Stored in profiling data for post-hoc interpretation.

The fitted preprocessor (`StandardScaler` + `OneHotEncoder` inside a single transformer) is persisted at `models/modelling_preprocessor.pkl` and reused by both the holdout evaluation and the live backend.

---

## 5. Development and Holdout Strategy
- **Split Ratio**: 80% Development (40,000 customers) / 20% Holdout (10,000 customers), partitioned from the raw 50,000-row dataset with `random_state=42` and `shuffle=True`.
- **Leakage Prevention**: Preprocessing scaler/encoder are fitted **strictly on the development set**. The holdout set is transformed using the previously fitted preprocessor object only — never refit.
- **Zero Label Assumptions**: Pure unsupervised partitioning without target stratification.

---

## 6. Role of CLV and Churn Risk After Clustering
CLV and Churn Risk are explicitly decoupled from cluster formation:
1. **Cluster Formation**: Derived purely from behavioral and transactional patterns (the 18 processed features above).
2. **Post-Clustering Integration**:
   - Each customer receives soft cluster membership probabilities and a **Segment Ambiguity Score**.
   - Customers are evaluated in a composite **Retention Priority Score** combining Business Impact (CLV × Churn Risk) with Cluster Transition Risk (Ambiguity) — see Section 7.
   - High-CLV, high-churn, high-ambiguity customers receive top-tier, proactive retention priority.

---

## 7. Model Comparison & Final Model Selection

All four algorithms were fit on the full 40,000-row development set (Agglomerative on a reproducible 2,500-row sample, due to its $O(n^2)$ memory cost) and evaluated on the untouched 10,000-row holdout set. Results from [`results/final_model_comparison.csv`](results/final_model_comparison.csv):

| Model | K | Dev Silhouette | Dev Davies-Bouldin | Dev Calinski-Harabasz | Holdout Silhouette | Holdout Davies-Bouldin | Soft Output |
|---|---|---|---|---|---|---|---|
| K-Means (best-effort, K=2)* | 2 | 0.1203 | 2.679 | 3,072.2 | 0.1246 | 2.660 | No |
| GMM | 2 | 0.1254 | 2.600 | 3,056.8 | 0.0653 | 3.725 | Yes |
| **Fuzzy C-Means** | **4** | 0.0643 | 2.979 | 2,558.7 | 0.0617 | 2.979 | **Yes** |
| Agglomerative (2,500-sample) | 2 | 0.1243 | 2.584 | 188.4 | — | — | No |

*\*K-Means failed the project's own stability bar (mean ARI < 0.9 at every evaluated K — see Section 7 of [`docs/README_KMeans.md`](docs/README_KMeans.md)); this row is the closest-to-stable K=2 configuration, refit and evaluated anyway so K-Means has a representative result to compare against the other three algorithms. Its holdout numbers are real (`.predict()`-only, no refitting), but the underlying segmentation isn't validated as reproducible.*

### Final Selection: Fuzzy C-Means (K=4, m=1.1, K-Means-informed initialization)

Documented in [`results/final_model_selection.json`](results/final_model_selection.json) and deployed via [`models/deployment_metadata.json`](models/deployment_metadata.json). FCM was chosen for project-objective reasons rather than a single metric:

**Why FCM:**
- Directly supports soft customer segmentation through continuous membership degrees.
- Directly supports the Segment Ambiguity Score the project is built around.
- Uses the full 40,000-customer development set (unlike Agglomerative's sample).
- Generalizes cleanly to unseen holdout customers with strong dev → holdout metric consistency (Silhouette 0.0643 → 0.0617, Davies-Bouldin 2.979 → 2.979).
- Produces four differentiated, business-interpretable customer profiles.
- K-Means-informed initialization (rather than random) produced a locally robust, reproducible solution — stability analysis across repeated runs gave **mean Adjusted Rand Index = 1.0**.

**Acknowledged limitations:**
- FCM does not have the highest development Silhouette score (GMM and Agglomerative score higher).
- Absolute hard-label cluster separation is relatively weak in this feature space.
- Random initialization was unstable; the final result depends specifically on K-Means-informed initialization.
- **GMM alternative**: GMM achieved stronger development hard-label separation and also supports soft assignments, but its Silhouette/Davies-Bouldin metrics deteriorated substantially on holdout data, and its selected $K=2$ solution collapsed to only two broad, less actionable customer segments.

**Final FCM fit characteristics** ([`results/fcm_final_summary.csv`](results/fcm_final_summary.csv)): 18 input features, converged in 150 iterations, Fuzzy Partition Coefficient 0.731 (dev) / 0.730 (holdout), mean maximum membership strength ≈ 0.81 on both dev and holdout.

---

## 8. Final Clusters

The selected FCM model (K=4) produces four interpretable segments, consistent in proportion between development and holdout data ([`results/fcm_cluster_profiles.csv`](results/fcm_cluster_profiles.csv), [`results/fcm_cluster_distributions.csv`](results/fcm_cluster_distributions.csv)):

| Cluster | Name | Dev % (n=40,000) | Holdout % (n=10,000) | Mean Max Membership | Interpretation |
|---|---|---|---|---|---|
| 1 | **Inactive / High-Churn-Risk Customers** | 14.33% (5,731) | 14.83% (1,483) | 0.90 | Very long inactivity and elevated churn risk |
| 2 | **Low-Purchase High-Conversion Customers** | 27.09% (10,836) | 26.41% (2,641) | 0.80 | Lower purchase volume but comparatively high conversion |
| 3 | **High-Value Active Customers** | 31.18% (12,471) | 30.59% (3,059) | 0.79 | High purchase volume, high CLV, and recent activity |
| 4 | **Low-Engagement Customers** | 27.41% (10,962) | 28.17% (2,817) | 0.80 | Lower purchase volume and comparatively low conversion/channel engagement |

Cluster 1 has the clearest (least ambiguous) membership; Clusters 2–4 show more overlap with each other — exactly the kind of transitional behavior the soft-clustering approach is designed to surface, rather than hide behind a hard label.

---

## 9. Retention Prioritization System

Implemented in [`07_Retention_Prioritization.ipynb`](notebooks/07_Retention_Prioritization.ipynb) and reused unchanged by the backend ([`src/backend/pipeline.py`](src/backend/pipeline.py)). Configuration is frozen in [`results/retention_prioritization_config.json`](results/retention_prioritization_config.json).

**Composite Retention Priority Score (0–100):**

$$\text{Score} = 100 \times (0.4 \times \text{CLV}_{\text{pctl}} + 0.4 \times \text{Churn}_{\text{norm}} + 0.2 \times \text{Ambiguity})$$

- **CLV component (weight 0.4)**: customer's `customer_lifetime_value_usd` mapped to its empirical percentile rank against the 40,000-customer development CLV reference distribution.
- **Churn component (weight 0.4)**: `churn_risk_score / 100`.
- **Ambiguity component (weight 0.2)**: normalized Shannon entropy of the customer's 4 FCM memberships (0 = certain, 1 = maximally ambiguous).

**Priority tiers** (thresholds derived from the development score distribution):
| Tier | Threshold | Dev-set share |
|---|---|---|
| High | score ≥ 50.69 (80th percentile) | 8,000 / 40,000 (20%) |
| Medium | 37.53 ≤ score < 50.69 (50th–80th percentile) | 12,000 / 40,000 (30%) |
| Low | score < 37.53 | 20,000 / 40,000 (50%) |

**Ambiguity flag**: a customer is flagged **High ambiguity** when their normalized entropy ≥ 0.531 (development 75th percentile) — 10,000 / 40,000 development customers (25%) cross this threshold.

Each customer then receives a deterministic, rule-based recommendation (e.g. "High retention priority with uncertain segment membership — review mixed customer characteristics and use a personalized retention strategy") combining their priority tier, cluster, and ambiguity level. Full scored populations are saved to [`results/final_development_retention_prioritization.csv`](results/final_development_retention_prioritization.csv) and [`results/final_holdout_retention_prioritization.csv`](results/final_holdout_retention_prioritization.csv).

---

## 10. Backend — FastAPI Inference Service

Location: [`src/backend/`](src/backend/). Serves the frozen FCM model + retention logic as a REST API, using a pure-NumPy FCM membership computation ([`src/utils/fcm.py`](src/utils/fcm.py)) so no training-time library dependency is needed at inference time.

| File | Responsibility |
|---|---|
| `main.py` | FastAPI app, CORS, lifespan hook that preloads the `CustomerSegmentationPipeline` once at startup. |
| `pipeline.py` | `CustomerSegmentationPipeline`: loads the preprocessor, FCM centers, CLV reference distribution, and retention config; validates input; runs transform → FCM membership → ambiguity → retention scoring → recommendation. |
| `config.py` | Paths to model artifacts, required input fields, valid categorical values. |
| `schemas.py` | Pydantic request/response models (`CustomerInput`, `PredictionResponse`, `ClustersResponse`, `HealthResponse`, batch variants). |
| `routes/health.py` | `GET /api/health` — pipeline readiness, algorithm, cluster count. |
| `routes/clusters.py` | `GET /api/clusters` — the 4 cluster names + business descriptions. |
| `routes/predict.py` | `POST /api/predict` (single) and `POST /api/predict/batch` (≤1,000 records) — full inference response. |

`GET /` returns basic API info; interactive OpenAPI docs are served at `/docs` (and `/redoc`).

Each prediction response includes: `assigned_cluster`, `cluster_name`, all 4 `memberships`, `max_membership`, `membership_margin`, `segment_ambiguity_score`, `ambiguity_level`, the CLV/churn/ambiguity components, `retention_priority_score`, `retention_priority`, and a text `recommendation`.

---

## 11. Frontend — React Interactive Dashboard

Location: [`frontend/`](frontend/) — React 18 + Vite 5, no UI framework dependency beyond `lucide-react` icons.

| Tab | Component | Purpose |
|---|---|---|
| **Overview** | `OverviewSection` + `ClusterCard` | Explains the pipeline (12 raw → 18 processed features → FCM → ambiguity → retention), and dynamically renders the 4 live cluster profiles fetched from `GET /api/clusters`. |
| **Customer Analysis** | `CustomerAnalysis` + `CustomerForm` + `ResultsDashboard` | Form for the 12 clustering attributes + 2 retention metrics (CLV, churn risk), client-side validated ([`validation.js`](frontend/src/components/analysis/validation.js)), submitted to `POST /api/predict`. Results render as a membership distribution chart, ambiguity card, retention score card, and recommendation card. |
| **Methodology** | `MethodologySection` | Static explanation of the preprocessing, algorithm comparison, and retention-scoring methodology for non-technical readers. |

`Header` polls `GET /api/health` on load to show live backend/model status. All API calls are centralized in [`services/api.js`](frontend/src/services/api.js), which reads the backend URL from `VITE_API_BASE_URL` (see `frontend/.env.development` / `.env.example`) and defaults to `http://127.0.0.1:8000`.

---

## 12. Repository Structure
```
.
├── data/
│   ├── raw/                              # Original raw dataset (50,000 customers)
│   └── processed/                        # dev/holdout raw, preprocessed, business & profiling CSVs + split_metadata.json
│
├── notebooks/
│   ├── 01_EDA_Preprocessing.ipynb        # EDA, feature selection, and preprocessor fitting
│   ├── 02_KMeans.ipynb                   # Algorithm 1: K-Means benchmark
│   ├── 03_GMM.ipynb                      # Algorithm 2: Gaussian Mixture Model
│   ├── 04_Fuzzy_CMeans.ipynb             # Algorithm 3: Fuzzy C-Means (selected model)
│   ├── 05_Agglomerative.ipynb            # Algorithm 4: Hierarchical Clustering
│   ├── 06_Model_Comparison.ipynb         # Cross-algorithm comparison & final selection
│   └── 07_Retention_Prioritization.ipynb # CLV/churn/ambiguity retention scoring design
│
├── models/
│   ├── modelling_preprocessor.pkl        # Fitted StandardScaler + OneHotEncoder
│   ├── kmeans_final_model.pkl
│   ├── gmm_final_model.pkl
│   ├── final_fcm_model.pkl               # Deployed clustering model
│   ├── agglomerative_selected_sample_model.pkl
│   ├── development_clv_reference.npy     # CLV empirical distribution for percentile scoring
│   └── deployment_metadata.json          # Frozen deployment contract (features, clusters, methodology)
│
├── results/
│   ├── final_model_comparison.csv / final_model_selection.json
│   ├── retention_prioritization_config.json
│   ├── final_development_retention_prioritization.csv / final_holdout_retention_prioritization.csv
│   ├── fcm_*.csv                         # FCM profiles, memberships, stability, robustness
│   ├── gmm_final_metrics.csv / gmm_cluster_assignments.csv
│   ├── kmeans/                           # K-Means tuning, stability, assignments
│   ├── agglomerative/                    # Agglomerative sample experiments & reproducibility
│   └── figures/                          # Visualizations, EDA charts, dendrograms
│
├── src/
│   ├── backend/                          # FastAPI inference service (see Section 10)
│   │   ├── main.py, pipeline.py, config.py, schemas.py
│   │   └── routes/ (health.py, clusters.py, predict.py)
│   └── utils/                            # entropy.py, fcm.py, reference_data.py — shared helpers
│
├── frontend/                             # React + Vite dashboard (see Section 11)
│   ├── src/components/{overview,analysis,results,methodology,layout,common}/
│   └── src/services/api.js
│
├── tests/
│   └── backend/                          # test_api.py, test_pipeline.py, test_fcm.py
│
├── docs/                                 # Per-algorithm methodology write-ups & viva guides
├── requirements.txt                      # Python dependencies
└── README.md
```

---

## 13. Running the Application

### Prerequisites
- Python 3.10+ (developed/tested with 3.11 and 3.13)
- Node.js 18+ and npm (for the frontend)

### Backend (FastAPI)
```powershell
# From the project root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

uvicorn src.backend.main:app --reload --port 8000
```
API available at `http://127.0.0.1:8000` (docs at `/docs`). It preloads `models/final_fcm_model.pkl`, `models/modelling_preprocessor.pkl`, and the retention config at startup — these must already exist (they are committed in this repo).

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
Dashboard available at `http://127.0.0.1:5173`. `frontend/.env.development` already points `VITE_API_BASE_URL` at `http://127.0.0.1:8000`, matching the backend's allowed CORS origins.

### Running the Notebooks
1. Register the kernel: `python -m ipykernel install --user --name=ecommerce-segmentation --display-name="Python (.venv - Ecommerce Segmentation)"`
2. Execute in order: `01_EDA_Preprocessing.ipynb` → `02_KMeans.ipynb` → `03_GMM.ipynb` → `04_Fuzzy_CMeans.ipynb` → `05_Agglomerative.ipynb` → `06_Model_Comparison.ipynb` → `07_Retention_Prioritization.ipynb`. Each notebook reads the previous stage's exported artifacts under `data/processed/`, `models/`, and `results/`.

### Running Tests
```bash
python -m pytest tests/
```
Covers the FastAPI endpoints (`test_api.py`), the pipeline's inference logic (`test_pipeline.py`), and the pure-NumPy FCM membership math (`test_fcm.py`).
