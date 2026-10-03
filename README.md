# Soft E-commerce Customer Segmentation and Retention Prioritization

## Run the application locally

Run these commands from the repository root. The API loads the saved preprocessing, Fuzzy C-Means, CLV reference, and retention configuration artifacts in `models/` and `results/`.

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn src.backend.main:app --host 127.0.0.1 --port 8000
```

In a second terminal, start the dependency free frontend:

```powershell
py -m http.server 5173 --bind 127.0.0.1 --directory frontend/standalone
```

Open <http://127.0.0.1:5173>. The API health endpoint is <http://127.0.0.1:8000/api/health> and interactive API docs are at <http://127.0.0.1:8000/docs>. The frontend includes an example customer and shows segment memberships, ambiguity, priority, and a recommendation.

The original React/Vite frontend remains in `frontend/src`. To use it instead, run `npm ci` and `npm run dev` from `frontend/` after starting the API. The standalone frontend is useful when npm packages cannot be downloaded.

To run the backend checks:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests/backend -v
```

The Agglomerative notebook is a candidate model analysis. The deployed prediction API uses the selected Fuzzy C-Means model documented in `results/final_model_selection.json`.

## 1. Business Problem
In competitive e-commerce environments, customer retention is substantially more cost-effective than customer acquisition. However, conventional customer segmentation frameworks often assign customers to rigid, mutually exclusive segments ("hard clustering"). Real-world customer behavior is continuous and multifaceted: a customer may exhibit browsing traits of bargain hunters while occasionally displaying the basket size of high-value shoppers.

Forcing customers into hard boundaries introduces boundary classification errors and obscures behavioral transitions. This project develops an unsupervised **soft customer segmentation system** that quantifies **segment-membership uncertainty and ambiguity**. By combining continuous segment affinities with post-clustering business metrics—specifically **Customer Lifetime Value (CLV)** and **Churn Risk Score**—the system enables targeted, high-priority retention interventions.

---

## 2. Unsupervised Clustering Task & Soft Clustering Objective
- **Unsupervised Learning**: Customer segmentation operates without ground-truth labels. Clusters emerge naturally from customer engagement, purchase frequency, monetary patterns, and channel interactions.
- **Soft Clustering Objective**: Rather than assigning each customer to a single discrete cluster ($k \in \{1, \dots, K\}$), the primary models output continuous membership probability vectors:
  $$P(\text{Cluster } k \mid \mathbf{x}_i) \quad \text{such that} \quad \sum_{k=1}^K P(\text{Cluster } k \mid \mathbf{x}_i) = 1$$
  From these distributions, a **Segment Ambiguity / Uncertainty Score** is computed (e.g., via normalized Shannon entropy or top-2 probability margins). High ambiguity indicates transitional or hybrid customers who require specialized marketing strategies.

---

## 3. Four Candidate Algorithms
The project systematically evaluates and compares four clustering algorithms:
1. **K-Means Clustering**: Hard-clustering baseline using Euclidean distance and Lloyd's algorithm. Serves as the performance and geometric benchmark.
2. **Gaussian Mixture Models (GMM)**: Probabilistic generative soft-clustering model fitted via Expectation-Maximization (EM), yielding posterior cluster probabilities and covariance structures.
3. **Fuzzy C-Means (FCM)**: Soft-clustering algorithm using fuzzy membership exponents ($m > 1$) allowing continuous degree-of-belonging across cluster centroids.
4. **Agglomerative Hierarchical Clustering**: Deterministic bottom-up linkage analysis revealing hierarchical dendrogram structures and natural cluster groupings.

---

## 4. Common Preprocessing Workflow & Feature Design
To ensure fair algorithm comparison, all models consume a standardized, leakage-free feature pipeline.

### Primary Clustering Features (12 Raw Features → 18 Processed Features):
- **10 Numerical Features** (Standardized using `StandardScaler`):
  - `tenure_months`
  - `total_purchases`
  - `avg_order_value_usd`
  - `days_since_last_purchase`
  - `return_count`
  - `complaint_count`
  - `satisfaction_score`
  - `email_open_rate`
  - `click_through_rate`
  - `conversion_rate`
- **2 Categorical Features** (Encoded using `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`):
  - `shopping_channel` (3 categories: `app`, `in_store`, `web`)
  - `device_used` (5 categories: `desktop`, `mobile`, `other`, `tablet`, `unknown`)

### Variables Excluded from Model Training:
- **`customer_id`**: Identifier only, dropped prior to fitting (`X = df.drop(columns=['customer_id'])`).
- **`customer_lifetime_value_usd` & `churn_risk_score`**: Preserved strictly in separate business data files to prevent circular data leakage into cluster formation.
- **Demographics & optional variables**: Stored in profiling data for post-hoc interpretation.

---

## 5. Development and Holdout Strategy
- **Split Ratio**: 80% Development (40,000 customers) / 20% Holdout (10,000 customers), partitioned with `random_state=42` and `shuffle=True`.
- **Leakage Prevention**: Preprocessing scalers and encoders are fitted **strictly on the development set**. The holdout set is transformed using the previously fitted preprocessor object (`models/modelling_preprocessor.pkl`).
- **Zero Label Assumptions**: Pure unsupervised partitioning without target stratifications.

---

## 6. Role of CLV and Churn Risk After Clustering
CLV and Churn Risk are explicitly decoupled from cluster formation:
1. **Cluster Formation**: Derived purely from behavioral and transactional patterns.
2. **Post-Clustering Integration**:
   - Each customer receives soft cluster membership probabilities and an **Ambiguity Score**.
   - Customers are evaluated in a two-dimensional decision matrix: **Business Impact (CLV $\times$ Churn Risk)** vs. **Cluster Transition Risk (Ambiguity)**.
   - High-CLV, high-churn, high-ambiguity customers receive top-tier, proactive retention priority.

---

## 7. Repository Structure
```
.
├── data/
│   ├── raw/                      # Original raw dataset
│   │   └── E-commerce_Customer_Segmentation_2026.csv
│   └── processed/                # Shared exported modelling artifacts
│       ├── development_raw.csv
│       ├── holdout_raw.csv
│       ├── development_preprocessed.csv
│       ├── holdout_preprocessed.csv
│       ├── development_business_data.csv
│       ├── holdout_business_data.csv
│       ├── development_profiling_data.csv
│       ├── holdout_profiling_data.csv
│       ├── final_feature_decisions.csv
│       └── split_metadata.json
│
├── notebooks/
│   ├── 01_EDA_Preprocessing.ipynb  # Primary EDA, feature selection, and preprocessor
│   ├── 02_KMeans.ipynb             # Algorithm 1: K-Means benchmark
│   ├── 03_GMM.ipynb                # Algorithm 2: Gaussian Mixture Model
│   ├── 04_Fuzzy_CMeans.ipynb       # Algorithm 3: Fuzzy C-Means
│   ├── 05_Agglomerative.ipynb      # Algorithm 4: Hierarchical Clustering
│   └── 06_Model_Comparison.ipynb   # Comparative evaluation & retention scoring
│
├── models/
│   └── modelling_preprocessor.pkl  # Fitted StandardScaler + OneHotEncoder pipeline
│
├── results/
│   └── figures/                    # Visualizations, EDA charts, dendrograms
│
├── src/
│   ├── backend/                    # Future backend service
│   └── utils/                      # Shared helper utilities
│
├── frontend/                       # Future interactive UI
├── docs/                           # Documentation and project reports
├── requirements.txt                # Python dependencies
├── .gitignore                      # Git ignore patterns
└── README.md                       # Project documentation
```

---

## 8. Basic Setup Instructions

### Prerequisites
- Python 3.10+ (Python 3.13 supported)

### Environment Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd "c:/Users/ASUS/Pictures/final fdm"
   ```

2. Activate the virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows Command Prompt (cmd)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Register the virtual environment kernel for Jupyter:
   ```bash
   python -m ipykernel install --user --name=ecommerce-segmentation --display-name="Python (.venv - Ecommerce Segmentation)"
   ```

5. Execute the notebooks in sequential order:
   - Start with `notebooks/01_EDA_Preprocessing.ipynb` to verify EDA and generate preprocessed data artifacts.
