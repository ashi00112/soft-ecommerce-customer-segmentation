import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Activity,
  ShieldAlert,
  Database,
  Sliders,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Info,
  Percent,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import RevealOnScroll from '../common/RevealOnScroll';

/**
 * Animated wrapper for an accordion section's body: expands/collapses
 * height smoothly instead of an abrupt conditional render.
 */
function AccordionBody({ isOpen, children }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="meth-accordion-body-inner">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Full Methodology Section.
 * Documents the complete analytical pipeline in an accessible,
 * non-technical format suitable for CRM/Marketing/Retention audiences.
 */
export default function MethodologySection() {
  const [openSection, setOpenSection] = useState('fcm');

  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="methodology-container">
      {/* Hero */}
      <section className="hero-box" style={{ marginBottom: '2rem' }}>
        <div className="hero-tag">
          <BookOpen className="hero-tag-icon" aria-hidden="true" />
          <span>System Transparency</span>
        </div>
        <h2 className="hero-title">How This System Works</h2>
        <p className="hero-description">
          This page explains the analytical methods behind the segmentation and retention recommendations.
          Understanding how each stage works helps you interpret results with confidence and apply them appropriately.
        </p>
      </section>

      {/* Pipeline Overview Card */}
      <RevealOnScroll as="section" className="meth-pipeline-overview card" style={{ marginBottom: '1.5rem' }}>
        <div className="meth-section-label">
          <Database className="meth-section-label-icon" aria-hidden="true" />
          <span>End-to-End Analysis Pipeline</span>
        </div>
        <p className="meth-intro-text">
          Customer data flows through two distinct phases. The first phase discovers natural behavioural
          groupings using a soft-clustering algorithm. The second phase evaluates each customer's
          business importance and attrition risk to prioritize retention attention.
        </p>
        <div className="meth-pipeline-steps">
          {[
            { num: '01', label: 'Customer Behaviour', desc: '12 behavioural & engagement features collected' },
            { num: '02', label: 'Preprocessing', desc: 'Scaling + encoding into 18 model inputs' },
            { num: '03', label: 'Soft Clustering (FCM)', desc: 'Assigns continuous membership across 4 segments' },
            { num: '04', label: 'Membership Degrees', desc: 'Each customer gets an affinity score per segment' },
            { num: '05', label: 'Segment Ambiguity', desc: 'Measures how spread the memberships are' },
            { num: '06', label: 'CLV + Churn Risk', desc: 'Business signals introduced post-clustering' },
            { num: '07', label: 'Retention Priority', desc: 'Composite score directs action allocation' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="meth-pipe-step">
                <span className="meth-pipe-num">{s.num}</span>
                <div>
                  <p className="meth-pipe-label">{s.label}</p>
                  <p className="meth-pipe-desc">{s.desc}</p>
                </div>
              </div>
              {i < 6 && <div className="meth-pipe-arrow" aria-hidden="true">→</div>}
            </React.Fragment>
          ))}
        </div>
      </RevealOnScroll>

      {/* Accordion Sections */}
      <div className="meth-accordion">

        {/* Section 1: Preprocessing */}
        <RevealOnScroll as="div" index={0} className={`meth-accordion-item card ${openSection === 'preprocess' ? 'meth-open' : ''}`}>
          <button
            className="meth-accordion-trigger"
            onClick={() => toggle('preprocess')}
            aria-expanded={openSection === 'preprocess'}
          >
            <div className="meth-trigger-left">
              <div className="meth-trigger-icon-wrap bg-blue-subtle">
                <Sliders className="meth-trigger-icon text-accent" aria-hidden="true" />
              </div>
              <div>
                <h3 className="meth-trigger-title">Step 1 &amp; 2 — Data Collection &amp; Preprocessing</h3>
                <p className="meth-trigger-subtitle">12 source features → 18 model inputs</p>
              </div>
            </div>
            {openSection === 'preprocess'
              ? <ChevronDown className="meth-chevron" aria-hidden="true" />
              : <ChevronRight className="meth-chevron" aria-hidden="true" />}
          </button>

          <AccordionBody isOpen={openSection === 'preprocess'}>
              <p className="meth-body-intro">
                Before any analysis, raw customer data is transformed into a standardized numerical format
                that the clustering algorithm can process consistently.
              </p>

              <div className="meth-feature-split">
                <div className="meth-feature-col">
                  <div className="meth-feature-badge clustering-badge" style={{ marginBottom: '0.75rem' }}>
                    <Sliders className="feature-icon" aria-hidden="true" />
                    <span>10 Numerical Features — StandardScaler</span>
                  </div>
                  <ul className="meth-feature-list">
                    {[
                      ['Tenure (Months)', 'How long the customer has been active'],
                      ['Total Purchases', 'Number of completed transactions'],
                      ['Average Order Value (USD)', 'Mean spend per order'],
                      ['Days Since Last Purchase', 'Recency — smaller = more active'],
                      ['Return Count', 'Number of returned items'],
                      ['Complaint Count', 'Formal complaints submitted'],
                      ['Satisfaction Score', 'Self-reported rating (1–5)'],
                      ['Email Open Rate', 'Fraction of emails opened (0–1)'],
                      ['Click-Through Rate', 'Fraction of emails clicked (0–1)'],
                      ['Conversion Rate', 'Click-to-purchase fraction (0–1)'],
                    ].map(([name, desc]) => (
                      <li key={name} className="meth-feature-item">
                        <CheckCircle2 className="list-check" aria-hidden="true" />
                        <div>
                          <strong>{name}</strong>
                          <span className="meth-feature-desc"> — {desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="meth-note">
                    <Info className="meth-note-icon" aria-hidden="true" />
                    <span>StandardScaler transforms each feature to zero mean, unit variance so no single scale dominates.</span>
                  </div>
                </div>

                <div className="meth-feature-col">
                  <div className="meth-feature-badge retention-badge" style={{ marginBottom: '0.75rem' }}>
                    <Database className="feature-icon" aria-hidden="true" />
                    <span>2 Categorical Features — OneHotEncoder</span>
                  </div>
                  <ul className="meth-feature-list">
                    <li className="meth-feature-item">
                      <CheckCircle2 className="list-check" style={{ color: '#2dd4bf' }} aria-hidden="true" />
                      <div>
                        <strong>Shopping Channel</strong>
                        <span className="meth-feature-desc"> — 4 categories: In-Store, Marketplace, Mobile App, Online</span>
                      </div>
                    </li>
                    <li className="meth-feature-item">
                      <CheckCircle2 className="list-check" style={{ color: '#2dd4bf' }} aria-hidden="true" />
                      <div>
                        <strong>Device Used</strong>
                        <span className="meth-feature-desc"> — 4 categories: Desktop, Mobile, Multiple, Tablet</span>
                      </div>
                    </li>
                  </ul>
                  <div className="meth-note" style={{ marginTop: '0.75rem' }}>
                    <Info className="meth-note-icon" aria-hidden="true" />
                    <span>Each categorical value becomes a binary (0/1) indicator column. 4 + 4 = 8 extra columns.</span>
                  </div>

                  <div className="meth-transform-result">
                    <span className="meth-transform-label">Final Model Input Space</span>
                    <div className="meth-transform-eq">
                      10 scaled numerical + 8 binary flags = <strong>18 features</strong>
                    </div>
                  </div>

                  <div className="meth-excluded-box">
                    <strong>Excluded from Clustering:</strong> Age, gender, annual income,
                    total_spent_usd, CLV, churn risk, RFM scores, and pre-existing category labels.
                    These are intentionally omitted so that segments are driven purely by behaviour
                    and engagement patterns.
                  </div>
                </div>
              </div>
          </AccordionBody>
        </RevealOnScroll>

        {/* Section 2: Fuzzy C-Means */}
        <RevealOnScroll as="div" index={1} className={`meth-accordion-item card ${openSection === 'fcm' ? 'meth-open' : ''}`}>
          <button
            className="meth-accordion-trigger"
            onClick={() => toggle('fcm')}
            aria-expanded={openSection === 'fcm'}
          >
            <div className="meth-trigger-left">
              <div className="meth-trigger-icon-wrap bg-blue-subtle">
                <Layers className="meth-trigger-icon text-accent" aria-hidden="true" />
              </div>
              <div>
                <h3 className="meth-trigger-title">Step 3 &amp; 4 — Fuzzy C-Means Clustering &amp; Membership Degrees</h3>
                <p className="meth-trigger-subtitle">K=4 segments · m=1.10 fuzzifier · Continuous soft assignment</p>
              </div>
            </div>
            {openSection === 'fcm'
              ? <ChevronDown className="meth-chevron" aria-hidden="true" />
              : <ChevronRight className="meth-chevron" aria-hidden="true" />}
          </button>

          <AccordionBody isOpen={openSection === 'fcm'}>
              <p className="meth-body-intro">
                Unlike traditional clustering where every customer belongs to exactly one group,
                <strong> Fuzzy C-Means (FCM) </strong> allows each customer to have a partial membership
                in every segment simultaneously. A customer who mostly shops online but sometimes uses a
                marketplace will show partial affinity to both related segments.
              </p>

              <div className="meth-two-col">
                <div>
                  <h4 className="meth-col-title">Algorithm Parameters</h4>
                  <div className="meth-param-table">
                    {[
                      ['Number of Clusters (K)', '4', 'Four distinct customer behavioural archetypes'],
                      ['Fuzzifier (m)', '1.10', 'Near-hard clustering; subtle but meaningful overlap'],
                      ['Initialization', 'K-Means seeds', 'Ensures fast, stable convergence'],
                      ['Convergence', 'Iterative update', 'Repeats until membership changes are negligible'],
                    ].map(([param, val, note]) => (
                      <div key={param} className="meth-param-row">
                        <span className="meth-param-name">{param}</span>
                        <span className="meth-param-val">{val}</span>
                        <span className="meth-param-note">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="meth-col-title">The 4 Discovered Segments</h4>
                  <div className="meth-segments-list">
                    {[
                      { id: 1, color: '#f43f5e', name: 'Inactive / High-Churn-Risk', desc: 'Disengaged customers with low activity and low satisfaction' },
                      { id: 2, color: '#f59e0b', name: 'Low-Purchase High-Conversion', desc: 'Selective buyers who convert well despite fewer transactions' },
                      { id: 3, color: '#10b981', name: 'High-Value Active', desc: 'Frequent, high-spend, digitally engaged customers' },
                      { id: 4, color: '#3b82f6', name: 'Low-Engagement', desc: 'Present but passive; low digital interaction despite some purchasing' },
                    ].map((seg) => (
                      <div key={seg.id} className="meth-segment-item" style={{ borderLeftColor: seg.color }}>
                        <span className="meth-segment-id" style={{ color: seg.color }}>Segment {seg.id}</span>
                        <div>
                          <p className="meth-segment-name">{seg.name}</p>
                          <p className="meth-segment-desc">{seg.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="meth-concept-box">
                <Percent className="meth-concept-icon" aria-hidden="true" />
                <div>
                  <h4 className="meth-concept-title">What are Membership Degrees?</h4>
                  <p className="meth-concept-text">
                    Each customer receives four membership values — one per segment — that always sum to exactly 1.0 (100%).
                    A value of <strong>0.908</strong> for Segment 4 means the customer has a <strong>90.8% affinity</strong> to
                    that segment's behavioural profile. These are <em>not</em> probabilities or predictions about future
                    behaviour; they are continuous similarity measures based on the customer's current metrics relative to
                    each segment's learned centre.
                  </p>
                </div>
              </div>
          </AccordionBody>
        </RevealOnScroll>

        {/* Section 3: Segment Ambiguity */}
        <RevealOnScroll as="div" index={2} className={`meth-accordion-item card ${openSection === 'ambiguity' ? 'meth-open' : ''}`}>
          <button
            className="meth-accordion-trigger"
            onClick={() => toggle('ambiguity')}
            aria-expanded={openSection === 'ambiguity'}
          >
            <div className="meth-trigger-left">
              <div className="meth-trigger-icon-wrap bg-purple-subtle">
                <Activity className="meth-trigger-icon text-purple" aria-hidden="true" />
              </div>
              <div>
                <h3 className="meth-trigger-title">Step 5 — Segment Ambiguity</h3>
                <p className="meth-trigger-subtitle">Normalized Shannon Entropy · High Ambiguity Threshold ≈ 0.531 · Range: 0.0 – 1.0</p>
              </div>
            </div>
            {openSection === 'ambiguity'
              ? <ChevronDown className="meth-chevron" aria-hidden="true" />
              : <ChevronRight className="meth-chevron" aria-hidden="true" />}
          </button>

          <AccordionBody isOpen={openSection === 'ambiguity'}>
              <p className="meth-body-intro">
                Ambiguity measures how evenly or unevenly a customer's membership is spread across the four segments.
                A customer with nearly all their membership concentrated in one segment is clear and decisive.
                A customer spread across multiple segments is in a <em>boundary zone</em> between archetypes.
              </p>

              <div className="meth-formula-box">
                <span className="meth-formula-label">Formula: Normalized Shannon Entropy</span>
                <code className="meth-formula-code">
                  H_norm = −Σ(u<sub>i</sub> · ln u<sub>i</sub>) / ln(4)
                </code>
                <p className="meth-formula-note">
                  Where u<sub>i</sub> is the membership degree in segment i. Dividing by ln(4) normalizes the result to [0, 1].
                </p>
              </div>

              <div className="meth-two-col">
                <div className="meth-ambiguity-example meth-normal-example">
                  <span className="meth-example-badge badge-normal">Normal Ambiguity (&lt; 0.531)</span>
                  <p className="meth-example-values">e.g. [0.908, 0.060, 0.028, 0.005]</p>
                  <p className="meth-example-text">
                    One segment clearly dominates. Standard cluster-specific retention strategies
                    can be applied with high confidence.
                  </p>
                </div>
                <div className="meth-ambiguity-example meth-high-example">
                  <span className="meth-example-badge badge-high">High Ambiguity (≥ 0.531)</span>
                  <p className="meth-example-values">e.g. [0.35, 0.30, 0.20, 0.15]</p>
                  <p className="meth-example-text">
                    The customer lies at the boundary between multiple segments. Avoid narrow
                    single-segment assumptions; use balanced messaging across applicable strategies.
                  </p>
                </div>
              </div>

              <div className="meth-note" style={{ marginTop: '1rem' }}>
                <Info className="meth-note-icon" aria-hidden="true" />
                <span>
                  Ambiguity is also incorporated into the Retention Priority Score (20% weight),
                  reflecting that borderline customers may be harder to engage through a single strategy.
                </span>
              </div>
          </AccordionBody>
        </RevealOnScroll>

        {/* Section 4: Retention Prioritization */}
        <RevealOnScroll as="div" index={3} className={`meth-accordion-item card ${openSection === 'retention' ? 'meth-open' : ''}`}>
          <button
            className="meth-accordion-trigger"
            onClick={() => toggle('retention')}
            aria-expanded={openSection === 'retention'}
          >
            <div className="meth-trigger-left">
              <div className="meth-trigger-icon-wrap" style={{ background: 'rgba(13,148,136,0.12)' }}>
                <ShieldAlert className="meth-trigger-icon text-teal" aria-hidden="true" />
              </div>
              <div>
                <h3 className="meth-trigger-title">Step 6 &amp; 7 — Retention Prioritization</h3>
                <p className="meth-trigger-subtitle">3-Factor composite score · 40% CLV + 40% Churn + 20% Ambiguity</p>
              </div>
            </div>
            {openSection === 'retention'
              ? <ChevronDown className="meth-chevron" aria-hidden="true" />
              : <ChevronRight className="meth-chevron" aria-hidden="true" />}
          </button>

          <AccordionBody isOpen={openSection === 'retention'}>
              <p className="meth-body-intro">
                After segmentation, a separate prioritization model determines which customers merit
                the most immediate retention attention. CLV and Churn Risk are deliberately introduced
                at this stage — <em>not</em> during clustering — so that segment discovery remains
                based purely on behavioural patterns.
              </p>

              <div className="meth-formula-box">
                <span className="meth-formula-label">Retention Priority Score Formula</span>
                <code className="meth-formula-code">
                  Score = 100 × (0.40 × CLV_component + 0.40 × Churn_component + 0.20 × Ambiguity_component)
                </code>
                <p className="meth-formula-note">Result is a value from 0 to 100.</p>
              </div>

              <div className="meth-factors-explainer">
                {[
                  {
                    label: 'CLV Component (40%)',
                    color: 'var(--accent-primary)',
                    bg: 'rgba(59,130,246,0.08)',
                    border: 'rgba(59,130,246,0.25)',
                    text: `The customer's lifetime value is ranked against a reference distribution of 40,000 customers.
                    A higher percentile rank means greater relative business value. This component uses
                    the empirical CDF — no assumptions about the underlying distribution are made.`,
                  },
                  {
                    label: 'Churn Risk Component (40%)',
                    color: '#f59e0b',
                    bg: 'rgba(245,158,11,0.08)',
                    border: 'rgba(245,158,11,0.25)',
                    text: `The raw Churn Risk Score (0–100) is normalized to a 0–1 scale by dividing by 100.
                    A score of 65 becomes 0.65. Higher scores indicate greater attrition vulnerability
                    and therefore stronger urgency for retention action.`,
                  },
                  {
                    label: 'Ambiguity Component (20%)',
                    color: '#a855f7',
                    bg: 'rgba(168,85,247,0.08)',
                    border: 'rgba(168,85,247,0.25)',
                    text: `The Normalized Shannon Entropy (0–1) is used directly. Customers with high
                    ambiguity are harder to reach through standard segment-specific strategies, slightly
                    increasing their priority for individualized attention.`,
                  },
                ].map((f) => (
                  <div key={f.label} className="meth-factor-explain"
                    style={{ borderLeftColor: f.color, background: f.bg, border: `1px solid ${f.border}` }}>
                    <span className="meth-factor-explain-label" style={{ color: f.color }}>{f.label}</span>
                    <p className="meth-factor-explain-text">{f.text}</p>
                  </div>
                ))}
              </div>

              <div className="meth-priority-tiers">
                <h4 className="meth-col-title" style={{ marginBottom: '0.75rem' }}>Priority Tiers</h4>
                <div className="meth-tier-row">
                  {[
                    { tier: 'High', range: '≥ 50.69', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', desc: 'Immediate personalized outreach and dedicated retention budget' },
                    { tier: 'Medium', range: '37.53 – < 50.69', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', desc: 'Targeted nurture campaigns and re-engagement automation' },
                    { tier: 'Low', range: '< 37.53', color: '#10b981', bg: 'rgba(16,185,129,0.12)', desc: 'Standard lifecycle marketing and organic engagement' },
                  ].map((t) => (
                    <div key={t.tier} className="meth-tier-item"
                      style={{ background: t.bg, borderColor: t.color + '55', color: t.color }}>
                      <span className="meth-tier-name">{t.tier} Priority</span>
                      <span className="meth-tier-range">{t.range}</span>
                      <p className="meth-tier-desc">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="meth-note" style={{ marginTop: '1rem' }}>
                <Info className="meth-note-icon" aria-hidden="true" />
                <span>
                  <strong>Important:</strong> The retention priority score and recommendation support decision-making
                  but do not guarantee any outcome. Actual retention decisions should consider additional
                  qualitative context not captured by these metrics.
                </span>
              </div>
          </AccordionBody>
        </RevealOnScroll>

        {/* Section 5: How to Use */}
        <RevealOnScroll as="div" index={4} className={`meth-accordion-item card ${openSection === 'howto' ? 'meth-open' : ''}`}>
          <button
            className="meth-accordion-trigger"
            onClick={() => toggle('howto')}
            aria-expanded={openSection === 'howto'}
          >
            <div className="meth-trigger-left">
              <div className="meth-trigger-icon-wrap bg-amber-subtle">
                <TrendingUp className="meth-trigger-icon text-warning" aria-hidden="true" />
              </div>
              <div>
                <h3 className="meth-trigger-title">How to Interpret Results</h3>
                <p className="meth-trigger-subtitle">Practical guidance for CRM &amp; Retention teams</p>
              </div>
            </div>
            {openSection === 'howto'
              ? <ChevronDown className="meth-chevron" aria-hidden="true" />
              : <ChevronRight className="meth-chevron" aria-hidden="true" />}
          </button>

          <AccordionBody isOpen={openSection === 'howto'}>
              <div className="meth-howto-grid">
                {[
                  {
                    q: 'What does a 90% Membership Degree mean?',
                    a: 'It means the customer\'s behavioural profile has a 90% affinity to that segment\'s learned centre. The customer strongly resembles the typical profile of that segment. This is not a probability of future behaviour — it is a similarity measure based on current data.',
                  },
                  {
                    q: 'When should I check the secondary membership degrees?',
                    a: 'Always review secondary memberships when a customer shows "High Ambiguity". If Segment 3 has 45% and Segment 1 has 35%, applying both Segment 3 and Segment 1 strategies may be more effective than a single-segment approach.',
                  },
                  {
                    q: 'What does "High Ambiguity" mean in practice?',
                    a: 'The customer is in a transitional state — they don\'t fit neatly into a single behavioural group. Their needs may span multiple segments. Broad, personalized outreach tends to work better than segment-specific templates.',
                  },
                  {
                    q: 'Why is CLV excluded from clustering?',
                    a: 'Mixing business value signals (CLV) with behavioural signals during clustering would bias segment discovery toward financial variables rather than true behaviour patterns. Keeping them separate ensures segments reflect genuine engagement differences.',
                  },
                  {
                    q: 'Can I rely solely on the retention recommendation?',
                    a: 'The recommendation is deterministic and derived from the segment archetype and priority tier. It should be treated as a starting point for action — one input among several — not as a definitive prescription. Local context and account history should also inform decisions.',
                  },
                  {
                    q: 'What if a customer\'s profile changes?',
                    a: 'Re-run the analysis with updated metrics. Membership degrees respond to changes in behaviour — a customer who increases engagement will naturally shift toward higher-engagement segments over time.',
                  },
                ].map((item) => (
                  <div key={item.q} className="meth-howto-item">
                    <p className="meth-howto-q">{item.q}</p>
                    <p className="meth-howto-a">{item.a}</p>
                  </div>
                ))}
              </div>
          </AccordionBody>
        </RevealOnScroll>

      </div>
    </div>
  );
}
