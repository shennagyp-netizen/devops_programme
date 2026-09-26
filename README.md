# DevOps Programme - Mobile-First Learning Platform

A multi-course, multi-modal DevOps learning system with AI-powered mobile-first experience.

## 🚀 New Feature: Mobile-First LLM Assistant

### Overview
Integrated AI-powered learning assistant with voice input/output, context-aware responses, and mobile-optimized interface.

### Key Components
- **Floating LLM Assistant**: Context-aware AI assistant with voice capabilities
- **Mobile-First Responsive Layout**: Three-column desktop to single-column mobile
- **Enhanced Animation Library**: Interactive DevOps concept visualizations
- **Podcast Audio Completion**: Synchronized audio learning experiences
- **Machine Verification**: Automated exercise validation
- **CI Infrastructure**: Robust validation and testing pipeline

### Security & Testing
- **Test-Driven Development (TDD)**: 547/548 tests passing (99.8%)
- **Red Team Security Testing**: Comprehensive security validation
- **Accessibility Compliance**: WCAG 2.1 AA standards

## Programme Architecture

### Core Learning Components
- `courses/beginner/`: DevOps through concrete problems with mobile optimization
- `courses/intermediate/`: Deep production DevOps engineering
- `courses/advanced/`: Large-scale distributed systems and operations
- `foundations/`: Reusable competencies across Linux, networking, databases
- `projects/`: Continuous project instances with mobile collaboration
- `exams/`: Standardized assessment with AI-assisted evaluation

### Platform Components
- `platforms/`: macOS, Linux and Windows environment profiles
- `app/`: Adaptive learning application with LLM integration
- `podcasts/`: Spoken learning scripts with audio synchronization
- `book/`: Long-form curriculum with interactive elements

### New Technical Components
- `app/src/components/FloatingLLMAssistant/`: AI assistant with security hardening
- `app/src/animations/scenarios/dnsResolution.ts`: DNS visualization animation
- `app/src/lib/verification/`: Machine verification contracts
- `app/tests/unit/floating-llm-assistant/`: Comprehensive test suite

## Learning Loop (Enhanced)

**Understand** → **Predict** → **Operate** → **Break** → **Diagnose** → **Repair** → **Recall** → **Design** → **AI-Assist**

Theory can be skipped when demonstrated knowledge is sufficient. Required exercises cannot be skipped. AI assistant provides context-aware guidance throughout.

## Assessment System

### Three Assessment Families:
1. **Conceptual** — Mechanism and prediction with AI verification
2. **Diagnostic** — Evidence-based troubleshooting with machine validation
3. **Hands-on** — Demonstrated operation and recovery with automated verification

### Mobile-Optimized Assessment:
- Touch-friendly interface design
- Voice input for responses
- Offline assessment capability
- Progressive enhancement for varying network conditions

## Development Standards

### Testing Requirements
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Red Team Security Testing**: Attack simulation and vulnerability assessment
- **Accessibility Testing**: WCAG 2.1 AA compliance verification
- **Performance Testing**: Mobile-optimized load times and responsiveness

### Security Standards
- Input sanitization for all user-facing components
- XSS prevention through HTML entity encoding
- Resource exhaustion protection
- Secure animation and content loading

### Quality Metrics
- 99%+ test coverage for new components
- Zero critical security vulnerabilities
- Mobile performance: <2s load on 4G
- Accessibility: Full keyboard navigation support

## Getting Started

### For Developers
```bash
cd app
npm install
npm run test:unit  # Run comprehensive test suite
npm run dev       # Start development server
```

### Testing Commands
```bash
npm test                   # Run all tests
npm run test:unit          # Unit tests only
npm run check:content      # Content validation
npm run check:assessment   # Assessment validation
```

### Mobile Development
- Test on viewports: <768px (mobile), 768-1199px (tablet), ≥1200px (desktop)
- Ensure touch targets ≥44×44px
- Support reduced motion preferences
- Test offline functionality

## Documentation
- `/.kiro/specs/mobile-first-llm-assistant/` - Feature specifications
- `/app/tests/` - Comprehensive test suites
- `/.kiro/specs/mobile-first-llm-assistant/comprehensive-test-plan.md` - Complete test strategy

## Support
- Report security issues immediately
- Test failures block deployment
- Accessibility issues are P0 priority
- Mobile performance regressions require immediate attention
