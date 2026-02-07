import React from 'react';
import { Check, X, Zap, Building2, Rocket } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual developers and researchers exploring AI cost optimization.',
    icon: Zap,
    color: 'border-slate-200',
    buttonClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    features: [
      { text: 'Leaderboard with 20+ models', included: true },
      { text: 'Calculator with templates', included: true },
      { text: 'Sensitivity analysis & breakeven', included: true },
      { text: 'Local history (50 entries)', included: true },
      { text: 'JSON export / import', included: true },
      { text: 'Community data sources', included: true },
      { text: 'Custom scoring weights', included: true },
      { text: 'API access', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'Audited data with SLA', included: false },
      { text: 'Custom model benchmarks', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For teams making data-driven infrastructure decisions with auditable data.',
    icon: Rocket,
    color: 'border-indigo-400 ring-2 ring-indigo-100',
    buttonClass: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg',
    badge: 'Most Popular',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'API access (10K req/mo)', included: true },
      { text: 'Audited data with methodology docs', included: true },
      { text: 'Cloud history (unlimited)', included: true },
      { text: 'Team workspace (up to 5)', included: true },
      { text: 'PDF audit reports', included: true },
      { text: 'Slack / webhook alerts', included: true },
      { text: 'Regional carbon intensity data', included: true },
      { text: 'Custom model benchmarks', included: false },
      { text: 'Dedicated account manager', included: false },
      { text: 'On-premise deployment', included: false },
      { text: 'SLA guarantee', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations needing auditable compliance, custom benchmarks, and SLA.',
    icon: Building2,
    color: 'border-slate-200',
    buttonClass: 'bg-slate-900 text-white hover:bg-slate-800',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'Custom model benchmarking', included: true },
      { text: 'On-premise / VPC deployment', included: true },
      { text: 'SSO / SAML integration', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA with 99.9% uptime', included: true },
      { text: 'Compliance reports (SOC2, ISO)', included: true },
      { text: 'ML-driven routing API', included: true },
      { text: 'Multi-tenant workspace', included: true },
      { text: 'Custom carbon intensity factors', included: true },
      { text: 'Training & onboarding', included: true },
    ],
  },
];

export const Pricing: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Pricing & Plans</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Start free. Upgrade when you need auditable data, team collaboration, or enterprise compliance.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800">
          <Zap className="w-3 h-3" />
          Currently in beta — all features are free during the preview period
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl border ${tier.color} shadow-sm p-6 flex flex-col`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                  {tier.badge}
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{tier.name}</h3>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                {tier.period && <span className="text-sm text-slate-500 ml-1">{tier.period}</span>}
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">{tier.description}</p>

              <a
                href="mailto:hello@ecocompute.ai?subject=EcoCompute%20Waitlist"
                className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors ${tier.buttonClass}`}
              >
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Join Waitlist'}
              </a>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 flex-1">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {f.included ? (
                      <Check className="w-4 h-4 text-eco-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs leading-relaxed ${f.included ? 'text-slate-700' : 'text-slate-400'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap / Data Flywheel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Roadmap to Enterprise-Grade</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phase 1 — Now</div>
            <h4 className="text-sm font-semibold text-slate-800">Open Dashboard</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• RTX 5090 verified benchmarks (8 models)</li>
              <li>• Transparent provenance badges</li>
              <li>• Local persistence & JSON export</li>
              <li>• Configurable scoring weights</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Phase 2 — Q2 2026</div>
            <h4 className="text-sm font-semibold text-slate-800">Backend & Data Flywheel</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• User accounts & cloud sync</li>
              <li>• REST API for programmatic access</li>
              <li>• Continuous benchmark pipeline</li>
              <li>• Community data contributions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Phase 3 — Q4 2026</div>
            <h4 className="text-sm font-semibold text-slate-800">ML-Driven Routing</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Intelligent model selection API</li>
              <li>• Cost-optimized routing engine</li>
              <li>• Enterprise compliance reports</li>
              <li>• Multi-tenant SaaS platform</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-700">How is data verified?</h4>
            <p className="text-xs text-slate-500 mt-1">RTX 5090 benchmarks are measured directly via nvidia-smi and PyTorch profiling. API model data comes from published pricing pages. Each row has a provenance badge showing its confidence level.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-700">What makes this different from CodeCarbon or ML CO2 Impact?</h4>
            <p className="text-xs text-slate-500 mt-1">EcoCompute combines cost + carbon + performance in one decision framework. We focus on the full TCO picture, not just emissions tracking.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-700">Can I use this for compliance reporting?</h4>
            <p className="text-xs text-slate-500 mt-1">The Free tier provides estimates. Enterprise tier will include auditable methodology documentation and compliance-ready PDF reports.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-700">Is there an API?</h4>
            <p className="text-xs text-slate-500 mt-1">API access is planned for the Pro tier (Q2 2026). Join the waitlist to get early access.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
