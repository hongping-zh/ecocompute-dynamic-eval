# Contributing to EcoCompute

Thank you for your interest in contributing to EcoCompute! We welcome community contributions, especially **calculator templates** that help others estimate AI costs and carbon impact.

## 🎯 How to Contribute Calculator Templates

### What Makes a Good Template?

A good template should:
- **Solve a real use case** (e.g., "Customer Support Chatbot", "Code Review Assistant")
- **Include realistic parameters** (tokens/day, hardware, API model)
- **Provide context** (industry, team size, workload pattern)

### Submission Process

#### Option 1: GitHub Issue (Recommended)

1. Click the **"Share Template"** button in the Calculator
2. This will generate a pre-filled GitHub Issue link
3. Review the auto-generated template data
4. Add a descriptive title and any additional context
5. Submit the issue

We'll review and merge approved templates within 1-2 weeks.

#### Option 2: Pull Request

1. Fork this repository
2. Edit `components/Calculator.tsx` and add your template to the `PRESET_TEMPLATES` array:

```typescript
{
  id: 'your-template-id',
  name: 'Your Template Name',
  description: 'Brief description of the use case',
  config: {
    hardware: 'rtx5090',
    count: 1,
    hours: 24,
    pue: 1.2,
    region: 'global'
  },
  tokensPerDay: 1000000,
  apiModel: 'deepseek-v3',
  gallery: true,
  galleryCategory: 'Your Category',
  galleryIcon: '🎯',
  galleryColor: 'indigo'
}
```

3. Submit a pull request with:
   - Template code
   - Screenshot of the calculator with your template loaded
   - Brief explanation of the use case

### Template Guidelines

- **Naming**: Use clear, descriptive names (e.g., "E-commerce Recommendation Engine")
- **Categories**: Choose from: `Software Engineering`, `Customer Support`, `Content Creation`, `Research`, `Education`, `Enterprise`
- **Icons**: Pick an emoji that represents the use case
- **Colors**: Available: `eco`, `blue`, `purple`, `amber`, `rose`, `indigo`
- **Realistic values**: Base estimates on actual workloads when possible

### Example Template Submission

**Title**: "Customer Support Chatbot (500 tickets/day)"

**Description**: 
Mid-sized SaaS company handling 500 support tickets per day. Each conversation averages 10 exchanges (5K tokens). Using GPT-4o-mini for cost efficiency.

**Parameters**:
- API Model: GPT-4o-mini
- Tokens/Day: 2,500,000 (500 tickets × 5K tokens)
- Hardware: N/A (API-only)
- Category: Customer Support

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## 💡 Feature Requests

Have an idea? Open an issue tagged `enhancement` with:
- Problem statement
- Proposed solution
- Use case examples

## 📊 Data Contributions

If you have verified benchmark data for models not in our leaderboard:
1. Open an issue tagged `data`
2. Include:
   - Model name and version
   - Hardware used
   - Measurement methodology
   - Raw data or benchmark report link
   - Confidence level (measured/estimated/research)

We prioritize data with:
- ✅ Reproducible methodology
- ✅ Open-source benchmarking code
- ✅ Multiple measurement runs
- ✅ Clear provenance

---

## 🤝 Code of Conduct

- Be respectful and constructive
- Focus on the use case, not self-promotion
- Provide accurate data and cite sources
- Help others in discussions

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Recognition

All template contributors will be credited in:
- The template's tooltip (hover over the template card)
- Our monthly contributor spotlight
- The project README

Thank you for helping the community make better AI infrastructure decisions! 🌱
