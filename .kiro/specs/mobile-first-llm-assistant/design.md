# Design Document: Mobile-First LLM Assistant

## Overview

This design defines the architecture and implementation plan for the Mobile-First LLM Assistant feature (feature name: `mobile-first-llm-assistant`). The feature extends the DevOps Programme learning platform with:

1. **Floating LLM Assistant (M1)**: A persistent, context-aware AI coaching component with voice input/output
2. **Mobile-First Responsive Layout (M2)**: Adaptation from three-column desktop to single-column mobile view
3. **CI Infrastructure Fix (M3)**: Resolving validation failures in the GitHub Actions workflow
4. **Machine Verification Expansion (M4)**: Adding verification for B1.1 and B1.3 exercises
5. **Podcast Audio Completion (M5)**: Completing synchronized audio for all lessons
6. **Animation Library Expansion (M6)**: Adding DNS resolution visualization

The LLM Assistant acts as a continuous co-teacher that learners can engage with via voice or text to ask questions, request explanations, and receive guidance specific to their current lesson context.

### Design Principles

- **Backward Compatible**: Existing functionality must not be broken by new components
- **Progressive Enhancement**: Core features work without JavaScript; enhanced features available when available
- **Accessibility First**: All new components must pass WCAG 2.1 AA standards
- **Performance Conscious**: Initial page load impact limited to <500ms increase
- **Mobile-First**: Responsive design prioritizes mobile experience from the start

---

## Architecture Overview

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph "Client-Side"
        A[Lesson Page] --> B[Floating LLM Assistant]
        B --> C[Voice Input Handler]
        B --> D[Context Manager]
        B --> E[LLM API Client]
        C --> F[Speech-to-Text Service]
        E --> G[LLM API]
        D --> H[Lesson Context]
    end
    
    subgraph "Infrastructure"
        G --> I[LLM Provider]
        H --> J[Animation Library]
        H --> K[Podcast Manifest]
        H --> L[Exercise Registry]
    end
    
    subgraph "CI/CD"
        M[GitHub Actions] --> N[Content Validation]
        M --> O[Runtime Verification]
        M --> P[Project Contracts]
    end
```

### Component Layering

```
App Shell (layout.tsx)
├── Header (App.tsx)
├── Content Card (App.tsx)
├── Layout Container
│   ├── Sidebar (App.tsx)
│   └── Main Content
│       ├── LessonPanel (LessonPanel.tsx)
│       │   ├── LessonContentFeed
│       │   ├── PodcastCoach (PodcastCoach.tsx) - existing
│       │   └── NEW: FloatingLLMAssistant
│       ├── AnimationPlayground
│       └── NEW: MobileResponsiveWrapper
├── NEW: FloatingLLMAssistant (position: fixed)
└── NEW: ResponsiveLayoutContext
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Assistant
    participant Context
    participant LLM
    participant Storage

    User->>Assistant: Click floating button
    Assistant->>Assistant: Expand interface
    
    alt Voice Input
        User->>Assistant: Speak query
        Assistant->>Assistant: Record audio
        Assistant->>STT: Convert to text
        STT-->>Assistant: Text query
    else Text Input
        User->>Assistant: Type query
    end
    
    Assistant->>Context: Get lesson context
    Context-->>Assistant: Lesson metadata
    
    Assistant->>Assistant: Build prompt with context
    Assistant->>LLM: Send query + context
    LLM-->>Assistant: Response
    
    alt Text Response
        Assistant->>Assistant: Display text
        Assistant->>TTS: Convert to speech
        TTS-->>Assistant: Audio URL
        Assistant->>User: Play audio
    end
    
    Assistant->>Storage: Cache query/response
    Assistant-->>User: Show response
```

---

## Milestone 1: Floating LLM Assistant Component

### Architecture

```
FloatingLLMAssistant
├── AssistantTrigger (position: fixed, right: 16px, bottom: 16px on mobile)
│   ├── Icon button (44x44px touch target)
│   ├── Badge for unread messages
│   └── Accessibility attributes
├── AssistantPanel (expands on click)
│   ├── Header
│   │   ├── Title
│   │   └── Close button
│   ├── Context Display
│   │   ├── Current lesson
│   │   ├── Course level
│   │   └── Learning phase
│   ├── Chat Area
│   │   ├── Message history
│   │   └── Loading states
│   ├── Input Area
│   │   ├── Text input (textarea)
│   │   ├── Microphone button
│   │   ├── Send button
│   │   └── Voice recording indicator
│   └── Footer
│       ├── Audio playback controls
│       └── Feedback buttons
```

### Component Structure

```typescript
// src/components/FloatingLLMAssistant/
// ├── FloatingLLMAssistant.tsx          // Main component
// ├── AssistantTrigger.tsx              // Trigger button
// ├── AssistantPanel.tsx                // Expanded interface
// ├── ChatHistory.tsx                   // Message display
// ├── ContextDisplay.tsx                // Lesson context info
// ├── VoiceInput.tsx                    // Recording interface
// ├── LLMClient.ts                      // API integration
// ├── LLMContext.ts                     // Context provider
// └── types.ts                          // Type definitions
```

### Data Models

```typescript
// types.ts
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

export interface LessonContext {
  lessonId: string;
  lessonTitle: string;
  objective: string;
  domain: string;
  prerequisites?: string[];
}

export interface AssistantState {
  isOpen: boolean;
  isRecording: boolean;
  messages: AssistantMessage[];
  isOnline: boolean;
  lastQuery?: AssistantMessage;
  pendingQueries: AssistantMessage[];
}
```

### Context Provider

```typescript
// LLMContext.ts
const LLMContext = createContext<LLMContextType>({
  currentContext: null,
  updateContext: () => {},
  getLastQuery: () => undefined,
  storeQuery: () => {},
  getStoredQueries: () => []
});

// Context includes:
// - currentLessonContext: LessonContext from current lesson
// - contextHistory: Array of context objects for navigation
// - updateContext: Method to update context on lesson change
// - LastQueryStore: LocalStorage-based query caching
```

### LLM API Integration

```typescript
// LLMClient.ts
export class LLMClient {
  async queryLLM(
    prompt: string,
    context: LessonContext,
    maxRetries: number = 2
  ): Promise<{ text: string; audioUrl?: string }> {
    const systemPrompt = this.buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    
    // Rate limiting with exponential backoff
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullPrompt }
            ],
            temperature: 0.7
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const text = data.choices[0].message.content;
          const audioUrl = await this.textToSpeech(text);
          return { text, audioUrl };
        }
        
        if (attempt === maxRetries) throw new Error('LLM API failed after retries');
        await this.delay(this.calculateBackoff(attempt));
      } catch (error) {
        if (attempt === maxRetries) throw error;
      }
    }
  }
  
  private buildSystemPrompt(context: LessonContext): string {
    return `You are a DevOps coaching assistant. 
    Current lesson: ${context.lessonTitle} (${context.lessonId})
    Objective: ${context.objective}
    Domain: ${context.domain}
    
    Guidelines:
    - Reference specific concepts from the current lesson
    - Explain concepts clearly with DevOps best practices
    - Provide practical examples when relevant
    - If uncertain, acknowledge limitations rather than fabricate
    - Keep responses focused on the user's question`;
  }
}
```

---

## Milestone 2: Mobile-First Responsive Layout

### Layout Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | ≥1200px | 3 columns: sidebar (360px) + content + tools |
| Tablet | 768px - 1199px | 2 columns: sidebar + content/tools |
| Mobile | <768px | Single column: stacked sections |

### Layout Implementation

```css
/* styles.css - Responsive layout rules */
.app-shell {
  max-width: 1500px;
  margin: auto;
  padding: 28px;
}

.layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
}

/* Tablet */
@media (max-width: 1199px) {
  .layout {
    grid-template-columns: 360px 1fr;
  }
  
  .sidebar {
    position: static;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    max-height: none;
  }
  
  /* Floating Assistant positioning on mobile */
  .floating-assistant-trigger {
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
  }
  
  .floating-assistant-panel {
    position: fixed;
    bottom: 88px;
    right: 16px;
    left: 16px;
    max-height: 70vh;
    width: auto;
  }
}
```

### Sidebar Handling for Mobile

```typescript
// MobileSidebar.tsx
export function MobileSidebar({ 
  isOpen, 
  onClose,
  lessons 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  lessons: Lesson[];
}) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <aside 
        className={`sidebar-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Lesson navigation"
      >
        <header className="sidebar-header">
          <h2>Lessons</h2>
          <button onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </header>
        
        <nav className="sidebar-nav">
          {lessons.map(lesson => (
            <button
              key={lesson.id}
              className={`lesson-link ${selected ? 'selected' : ''}`}
              onClick={() => {
                onSelectLesson(lesson.id);
                onClose();
              }}
            >
              <span>{lesson.id}</span>
              <span>{lesson.title}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
```

### Responsive Utilities

```typescript
// utils/responsive.ts
export function useResponsive() {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewport('mobile');
      } else if (window.innerWidth < 1200) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop'
  };
}
```

---

## Milestone 3: CI Infrastructure Fix

### Current CI Status

The CI workflow at `.github/workflows/app.yml` is failing validation checks.

### Fix Strategy

1. **Identify failing validation checks** by reviewing CI logs
2. **Fix content contract failures** (`npm run check:content`)
3. **Fix assessment contract failures** (`npm run check:assessment`)
4. **Fix diagnostics contract failures** (`npm run check:diagnostics`)
5. **Fix project contract failures** (`npm run check:projects`)
6. **Fix platform adapter failures** (`npm run check:platforms`)
7. **Fix hands-on contract failures** (`npm run check:hands-on`)
8. **Verify all completeness checks** (`check:beginner`, `check:intermediate`, `check:advanced`, `check:programme`)
9. **Fix runtime verification failures** (`npm run check:runtime`)
10. **Fix progress architecture failures** (`npm run check:progress`)

### Workflow Update Plan

```yaml
# .github/workflows/app.yml - Updated workflow with improved error handling

jobs:
  full_programme_gate:
    name: full-programme-gate
    runs-on: ubuntu-24.04
    steps:
      - name: Runner diagnostics
        shell: bash
        run: |
          set -euxo pipefail
          uname -a
          node --version
          npm --version
          git --version
      
      - name: Checkout repository
        shell: bash
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euxo pipefail
          rm -rf repo
          git init repo
          cd repo
          git remote add origin "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
          git fetch --depth=1 origin "${GITHUB_SHA}"
          git checkout --detach "${GITHUB_SHA}"
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.12.0
          cache: npm
          cache-dependency-path: repo/app/package-lock.json
      
      - name: Install dependencies
        working-directory: repo/app
        run: npm ci
      
      - name: Content contract
        working-directory: repo/app
        run: npm run check:content || (echo "Content contract failed" && exit 1)
      
      - name: Assessment contract
        working-directory: repo/app
        run: npm run check:assessment || (echo "Assessment contract failed" && exit 1)
      
      - name: Diagnostics contract
        working-directory: repo/app
        run: npm run check:diagnostics || (echo "Diagnostics contract failed" && exit 1)
      
      - name: Project contract
        working-directory: repo/app
        run: npm run check:projects || (echo "Project contract failed" && exit 1)
      
      - name: Platform adapter contract
        working-directory: repo/app
        run: npm run check:platforms || (echo "Platform adapter contract failed" && exit 1)
      
      - name: Hands-on contract
        working-directory: repo/app
        run: npm run check:hands-on || (echo "Hands-on contract failed" && exit 1)
      
      - name: Beginner completeness
        working-directory: repo/app
        run: npm run check:beginner || (echo "Beginner completeness failed" && exit 1)
      
      - name: Intermediate completeness
        working-directory: repo/app
        run: npm run check:intermediate || (echo "Intermediate completeness failed" && exit 1)
      
      - name: Advanced completeness
        working-directory: repo/app
        run: npm run check:advanced || (echo "Advanced completeness failed" && exit 1)
      
      - name: Programme completeness
        working-directory: repo/app
        run: npm run check:programme || (echo "Programme completeness failed" && exit 1)
      
      - name: Runtime verification contract
        working-directory: repo/app
        run: npm run check:runtime || (echo "Runtime verification contract failed" && exit 1)
      
      - name: Authenticated progress architecture contract
        working-directory: repo/app
        run: npm run check:progress || (echo "Progress architecture contract failed" && exit 1)
      
      - name: Full unit and integration tests
        working-directory: repo/app
        run: npm test
      
      - name: TypeScript typecheck
        working-directory: repo/app
        run: npm run typecheck
      
      - name: Next.js production build
        working-directory: repo/app
        run: npx next build
```

---

## Milestone 4: Machine Verification Expansion

### Existing Machine Verification Architecture

```
MachineVerificationSystem
├── DevOps Terminal Agent (client-side)
├── Runtime Verification Service (server-side)
├── Verification Contract (data structure)
└── Progress Recording (storage)
```

### Expansion Plan for B1.1 and B1.3

#### B1.1 Exercise Verification

```typescript
// src/data/verification/b1-1.ts
import type { VerificationContract } from '../lib/verification-contract';

export const b11Verification: VerificationContract = {
  exerciseId: 'B1.1',
  title: 'Basic Terminal Commands',
  description: 'Verify basic terminal commands work correctly',
  steps: [
    {
      id: 'check-pwd',
      description: 'Verify pwd command exists and works',
      command: 'pwd',
      expectedOutputPattern: /^\/.+/
    },
    {
      id: 'check-echo',
      description: 'Verify echo command works',
      command: 'echo test',
      expectedOutputPattern: /^test$/
    },
    {
      id: 'check-man',
      description: 'Verify man page access',
      command: 'man ls | head -1',
      expectedOutputPattern: /^LS.*1/
    }
  ],
  passThreshold: 1.0, // All steps must pass
  timeoutMs: 30000
};
```

#### B1.3 Exercise Verification

```typescript
// src/data/verification/b1-3.ts
import type { VerificationContract } from '../lib/verification-contract';

export const b13Verification: VerificationContract = {
  exerciseId: 'B1.3',
  title: 'File Operations',
  description: 'Verify file creation, reading, and deletion',
  steps: [
    {
      id: 'create-file',
      description: 'Create a test file',
      command: 'touch /tmp/verification-test.txt',
      expectedExitCode: 0
    },
    {
      id: 'write-content',
      description: 'Write content to file',
      command: 'echo "test content" > /tmp/verification-test.txt',
      expectedExitCode: 0
    },
    {
      id: 'read-content',
      description: 'Read and verify file content',
      command: 'cat /tmp/verification-test.txt',
      expectedOutputPattern: /^test content$/
    },
    {
      id: 'cleanup',
      description: 'Clean up test file',
      command: 'rm /tmp/verification-test.txt',
      expectedExitCode: 0
    }
  ],
  passThreshold: 1.0,
  timeoutMs: 30000
};
```

### Integration with LessonPanel

```typescript
// src/components/ExerciseVerification.tsx
export function ExerciseVerification({ 
  exerciseId, 
  lessonId,
  onVerificationComplete 
}: {
  exerciseId: string;
  lessonId: string;
  onVerificationComplete: (result: VerificationResult) => void;
}) {
  const [verificationState, setVerificationState] = useState<
    'idle' | 'running' | 'completed' | 'failed'
  >('idle');
  
  const runVerification = async () => {
    setVerificationState('running');
    
    try {
      const verification = getVerificationContract(exerciseId);
      const result = await runVerificationContract(verification);
      
      setVerificationState(
        result.passed ? 'completed' : 'failed'
      );
      
      onVerificationComplete(result);
      
      if (result.passed) {
        await recordVerificationEvidence({
          lessonId,
          exerciseId,
          result,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      setVerificationState('failed');
      console.error('Verification failed:', error);
    }
  };
  
  return (
    <div className="exercise-verification">
      <button
        className="primary"
        onClick={runVerification}
        disabled={verificationState === 'running'}
      >
        {verificationState === 'running' ? 'Verifying...' : 'Run Verification'}
      </button>
      
      {verificationState === 'completed' && (
        <div className="verification-success">
          ✓ Verification passed!
        </div>
      )}
      
      {verificationState === 'failed' && (
        <div className="verification-error">
          ✗ Verification failed. Check your solution and try again.
        </div>
      )}
    </div>
  );
}
```

---

## Milestone 5: Podcast Audio Completion

### Current State

- Podcast manifest exists at `app/public/podcasts/manifest.json`
- Audio files organized by level: `beginner/`, `advanced/`, `day-{n}.txt`
- Audio manifest is essentially empty (`audio-manifest.json` contains `{}`)

### Completion Plan

#### 1. Identify Missing Audio

```typescript
// scripts/audit-podcasts.ts
import fs from 'fs';
import path from 'path';

const lessons = [
  // B1.1, B1.3 (to be verified)
  // All other lessons with missing audio
];

async function auditPodcasts() {
  const manifest = JSON.parse(
    fs.readFileSync('app/public/podcasts/manifest.json', 'utf8')
  );
  
  const existingEpisodes = new Set(Object.values(manifest.episodes));
  
  for (const lesson of lessons) {
    const audioFile = `app/public/podcasts/${lesson.id}.mp3`;
    if (!fs.existsSync(audioFile)) {
      console.log(`Missing: ${lesson.id} (${lesson.title})`);
    }
  }
}

auditPodcasts();
```

#### 2. Audio File Structure

```
app/public/podcasts/
├── manifest.json              # Episode mapping (hash)
├── audio-manifest.json        # Synchronization cues (TBD)
├── index.txt                  # Master index
├── day-1.txt                  # Day 1 transcript
├── day-2.txt                  # Day 2 transcript
├── day-3.txt                  # Day 3 transcript
├── day-4.txt                  # Day 4 transcript
├── day-5.txt                  # Day 5 transcript
├── beginner/
│   ├── B1.1/
│   │   ├── audio.mp3         # Podcaster audio
│   │   ├── transcript.txt    # Synced transcript
│   │   └── cues.json         # Synchronization cues
│   ├── B1.2/
│   └── ...
└── advanced/
    ├── A1.1/
    │   ├── audio.mp3
    │   ├── transcript.txt
    │   └── cues.json
    └── ...
```

#### 3. Audio Synchronization Format

```json
{
  "version": 1,
  "lessonId": "B1.1",
  "totalDurationMs": 1234567,
  "segments": [
    {
      "startTimeMs": 0,
      "endTimeMs": 12000,
      "text": "Welcome to the beginner section. Today we're going to cover...",
      "lessonSection": "introduction"
    },
    {
      "startTimeMs": 12000,
      "endTimeMs": 45000,
      "text": "In this lesson, we'll explore the fundamentals of terminal commands...",
      "lessonSection": "terminal-basics"
    }
  ]
}
```

#### 4. Integration with PodcastCoach

```typescript
// PodcastCoach.tsx - Enhanced with audio sync
export function PodcastCoach({ lesson }: { lesson: Lesson }) {
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  
  useEffect(() => {
    const audioManifest = loadAudioManifest(lesson.id);
    
    const updateSegment = () => {
      const currentTime = audio.currentTime * 1000;
      const segment = audioManifest.segments.find(
        s => currentTime >= s.startTimeMs && currentTime < s.endTimeMs
      );
      setCurrentSegment(segment);
    };
    
    audio.addEventListener('timeupdate', updateSegment);
    return () => audio.removeEventListener('timeupdate', updateSegment);
  }, [lesson.id]);
  
  return (
    <div className="podcast-coach-continuous">
      <div className="continuous-voice-row">
        <div>
          <strong>{lesson.title}</strong>
          <div className="continuous-transcript">
            <p>{currentSegment?.text || 'Loading audio...'}</p>
          </div>
        </div>
        
        <div className="audio-controls">
          <button 
            onClick={() => audio.paused ? audio.play() : audio.pause()}
            className={audio.paused ? 'primary' : 'secondary'}
          >
            {audio.paused ? '▶' : '⏸'}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max={audio.duration} 
            value={audio.currentTime}
            onChange={(e) => audio.currentTime = Number(e.target.value)}
          />
          
          <span className="audio-time">
            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## Milestone 6: Animation Library Expansion

### DNS Resolution Animation Design

```mermaid
flowchart TB
    subgraph DNS_Resolution
        A[Client] -->|Query| B[DNS Resolver]
        B -->|Query| C[Root Server]
        C -->|Response| B
        B -->|Query| D[TLD Server]
        D -->|Response| B
        B -->|Query| E[Authoritative Server]
        E -->|Response| B
        B -->|Response| A
    end
```

### Animation Contract

```typescript
// src/animations/scenarios/dnsResolution.ts
import type { AnimationDefinitionV1 } from '../contracts';

export const dnsResolutionAnimation: AnimationDefinitionV1 = {
  version: 1,
  id: 'dns-resolution',
  title: 'DNS Resolution Process',
  visual: {
    theme: 'devops-dark-v1',
    customization: {
      accent: 'cyan',
      density: 'comfortable',
      emphasis: 'standard'
    }
  },
  primitives: [
    // Client
    {
      kind: 'node',
      id: 'client',
      label: 'Client',
      role: 'client',
      x: 100,
      y: 300,
      width: 120,
      height: 80
    },
    
    // DNS Resolver
    {
      kind: 'node',
      id: 'resolver',
      label: 'DNS Resolver',
      role: 'gateway',
      x: 350,
      y: 300,
      width: 140,
      height: 80
    },
    
    // Root Server
    {
      kind: 'node',
      id: 'root',
      label: 'Root Server',
      role: 'server',
      x: 600,
      y: 150,
      width: 140,
      height: 80
    },
    
    // TLD Server
    {
      kind: 'node',
      id: 'tld',
      label: 'TLD Server',
      role: 'server',
      x: 600,
      y: 300,
      width: 140,
      height: 80
    },
    
    // Authoritative Server
    {
      kind: 'node',
      id: 'authoritative',
      label: 'Authoritative',
      role: 'server',
      x: 600,
      y: 450,
      width: 140,
      height: 80
    }
  ] as const,
  connections: [
    { id: 'c1', from: 'client', to: 'resolver' },
    { id: 'c2', from: 'resolver', to: 'root' },
    { id: 'c3', from: 'root', to: 'resolver' },
    { id: 'c4', from: 'resolver', to: 'tld' },
    { id: 'c5', from: 'tld', to: 'resolver' },
    { id: 'c6', from: 'resolver', to: 'authoritative' },
    { id: 'c7', from: 'authoritative', to: 'resolver' },
    { id: 'c8', from: 'resolver', to: 'client' }
  ] as const,
  packets: [
    { id: 'q1', from: 'client', to: 'resolver', label: 'Query' },
    { id: 'q2', from: 'resolver', to: 'root', label: 'Query' },
    { id: 'r1', from: 'root', to: 'resolver', label: 'Response' },
    { id: 'q3', from: 'resolver', to: 'tld', label: 'Query' },
    { id: 'r2', from: 'tld', to: 'resolver', label: 'Response' },
    { id: 'q4', from: 'resolver', to: 'authoritative', label: 'Query' },
    { id: 'r3', from: 'authoritative', to: 'resolver', label: 'Response' },
    { id: 'r4', from: 'resolver', to: 'client', label: 'Final' }
  ] as const,
  states: [
    {
      id: 'idle',
      status: 'neutral',
      targetStatuses: [
        { targetId: 'client', status: 'neutral' },
        { targetId: 'resolver', status: 'neutral' },
        { targetId: 'root', status: 'neutral' },
        { targetId: 'tld', status: 'neutral' },
        { targetId: 'authoritative', status: 'neutral' }
      ]
    },
    {
      id: 'query-flow',
      status: 'active',
      targetStatuses: [
        { targetId: 'client', status: 'active' },
        { targetId: 'resolver', status: 'info' }
      ]
    },
    {
      id: 'resolution-complete',
      status: 'healthy',
      targetStatuses: [
        { targetId: 'client', status: 'healthy' },
        { targetId: 'resolver', status: 'healthy' }
      ]
    }
  ] as const,
  events: [
    { id: 'e1', action: 'activate', targetId: 'client', targetStateId: 'query-flow' },
    { id: 'e2', action: 'send', targetId: 'q1', targetStateId: 'query-flow' },
    { id: 'e3', action: 'activate', targetId: 'resolver', targetStateId: 'query-flow' }
    // ... additional events for complete animation
  ] as const,
  interactions: [
    {
      id: 'play-pause',
      action: 'click',
      targetId: 'client',
      eventIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8']
    }
  ] as const,
  accessibility: {
    title: 'DNS Resolution Process',
    description: 'Interactive animation showing how domain names are resolved to IP addresses through DNS servers',
    reducedMotion: 'supported'
  }
};
```

### Animation Library Integration

```typescript
// src/animations/library.ts
import type { AnimationDefinitionV1 } from './contracts';
import { httpRequestAnimation } from './scenarios/httpRequest';
import { dnsResolutionAnimation } from './scenarios/dnsResolution';

export const animationLibrary: readonly AnimationDefinitionV1[] = [
  httpRequestAnimation,
  dnsResolutionAnimation  // NEW
];

export function getAnimation(animationId: string): AnimationDefinitionV1 | undefined {
  return animationLibrary.find((animation) => animation.id === animationId);
}
```

### Lesson Integration

```typescript
// src/components/DNSAnimationIllustration.tsx
export function DNSAnimationIllustration() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const cues = getAnimationCues('dns-resolution');
  const definition = getAnimation('dns-resolution');
  
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      if (isPlaying) {
        setCurrentTime(t => {
          const newTime = t + 16; // ~60fps
          if (newTime >= cues.totalDurationMs) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, cues]);
  
  return (
    <div className="dns-animation-wrapper">
      <div className="lesson-visual-head">
        <h4>DNS Resolution</h4>
        <div className="animation-controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={() => setCurrentTime(0)}>
            ↺ Reset
          </button>
        </div>
      </div>
      
      {definition && (
        <AnimationStage
          definition={definition}
          cues={cues}
          currentTimeMs={currentTime}
          className="dns-animation"
        />
      )}
      
      <div className="lesson-video-transcript">
        <p>The DNS resolution process follows these steps:</p>
        <ol>
          <li>Client sends query to DNS resolver</li>
          <li>Resolver queries root server</li>
          <li>Root server responds with TLD server address</li>
          <li>Resolver queries TLD server</li>
          <li>TLD server responds with authoritative server address</li>
          <li>Resolver queries authoritative server</li>
          <li>Authoritative server responds with IP address</li>
          <li>Resolver returns IP address to client</li>
        </ol>
      </div>
    </div>
  );
}
```

---

## File Structure and Implementation Order

### Directory Structure

```
.app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                              // Existing
│   │   └── animations/
│   │       └── [animationId]/
│   │           └── page.tsx                        // Existing
│   ├── animations/
│   │   ├── AnimationStage.tsx                      // Existing
│   │   ├── contracts.ts                            // Existing
│   │   ├── index.ts                                // Existing
│   │   ├── library.ts                              // M6: ADD dnsResolutionAnimation
│   │   ├── library.ts                              // M6: ADD dnsResolutionAnimation
│   │   ├── scenarios/
│   │   │   ├── httpRequest.ts                      // Existing
│   │   │   └── dnsResolution.ts                    // M6: NEW
│   │   └── previewCues.ts                          // M6: ADD DNS cues
│   ├── components/
│   │   ├── FloatingLLMAssistant/                   // M1: NEW
│   │   │   ├── FloatingLLMAssistant.tsx            // M1: NEW
│   │   │   ├── AssistantTrigger.tsx                // M1: NEW
│   │   │   ├── AssistantPanel.tsx                  // M1: NEW
│   │   │   ├── ChatHistory.tsx                     // M1: NEW
│   │   │   ├── ContextDisplay.tsx                  // M1: NEW
│   │   │   ├── VoiceInput.tsx                      // M1: NEW
│   │   │   ├── LLMClient.ts                        // M1: NEW
│   │   │   ├── LLMContext.ts                       // M1: NEW
│   │   │   └── types.ts                            // M1: NEW
│   │   ├── LessonPanel.tsx                         // Existing
│   │   └── ExerciseVerification.tsx                // M4: NEW
│   ├── utils/
│   │   └── responsive.ts                           // M2: NEW
│   ├── styles.css                                  // M2: ADD responsive rules
│   └── App.tsx                                     // M2: ADD MobileSidebar
└── public/
    └── podcasts/
        └── audio-manifest.json                     // M5: ADD audio sync data
```

### Implementation Order

#### Phase 1: Foundation (Week 1)
1. **M2: Mobile responsive utilities** - Create responsive hook and CSS rules
2. **M1: Core LLM Assistant structure** - Create component structure and context
3. **M6: Animation base** - Define DNS animation contract and primitives

#### Phase 2: Core Features (Week 2)
4. **M1: Voice input/output** - Implement speech-to-text and text-to-speech
5. **M1: LLM API integration** - Connect to LLM provider and implement context awareness
6. **M4: Machine verification** - Implement verification for B1.1 and B1.3

#### Phase 3: Completion (Week 3)
7. **M6: DNS animation** - Complete DNS resolution animation
8. **M5: Podcast audio** - Complete missing podcast audio files and sync
9. **M3: CI fixes** - Fix all validation failures and ensure CI passes

#### Phase 4: Testing & Polish (Week 4)
10. **Accessibility audit** - Ensure WCAG 2.1 AA compliance
11. **Performance optimization** - Profile and optimize load times
12. **Integration testing** - Test all milestones together

---

## Testing Strategy

### Unit Tests

#### Floating LLM Assistant Tests

```typescript
// src/components/FloatingLLMAssistant/__tests__/FloatingLLMAssistant.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingLLMAssistant } from '../FloatingLLMAssistant';

describe('FloatingLLMAssistant', () => {
  test('renders trigger button with correct accessibility attributes', () => {
    render(<FloatingLLMAssistant />);
    const trigger = screen.getByRole('button', { name: /assistant/i });
    expect(trigger).toHaveAttribute('aria-label', 'Open LLM Assistant');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  test('expands panel when trigger is clicked', () => {
    render(<FloatingLLMAssistant />);
    const trigger = screen.getByRole('button', { name: /assistant/i });
    fireEvent.click(trigger);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('displays current lesson context', () => {
    render(<FloatingLLMAssistant />);
    expect(screen.getByText(/Current lesson/i)).toBeInTheDocument();
  });

  test('handles voice input when microphone is clicked', async () => {
    render(<FloatingLLMAssistant />);
    const trigger = screen.getByRole('button', { name: /assistant/i });
    fireEvent.click(trigger);
    
    const micButton = screen.getByRole('button', { name: /microphone/i });
    fireEvent.click(micButton);
    
    // Verify recording indicator appears
    expect(screen.getByText(/Recording.../i)).toBeInTheDocument();
  });

  test('sends query to LLM when send button is clicked', async () => {
    render(<FloatingLLMAssistant />);
    const trigger = screen.getByRole('button', { name: /assistant/i });
    fireEvent.click(trigger);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'What is DevOps?' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/DevOps is a set of practices/i)).toBeInTheDocument();
    });
  });
});
```

#### Responsive Layout Tests

```typescript
// src/utils/__tests__/responsive.test.ts
import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../responsive';

describe('useResponsive', () => {
  const originalInnerWidth = window.innerWidth;
  
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true });
  });
  
  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });
  
  test('returns mobile viewport on narrow screens', () => {
    window.innerWidth = 600;
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.viewport).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });
  
  test('returns tablet viewport on medium screens', () => {
    window.innerWidth = 900;
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.viewport).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
  });
  
  test('returns desktop viewport on wide screens', () => {
    window.innerWidth = 1400;
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.viewport).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
  });
});
```

#### Animation Tests

```typescript
// src/animations/scenarios/__tests__/dnsResolution.test.ts
import { validateAnimationDefinition } from '../../contracts';
import { dnsResolutionAnimation } from '../dnsResolution';

describe('dnsResolutionAnimation', () => {
  test('validates against animation contract', () => {
    const result = validateAnimationDefinition(dnsResolutionAnimation);
    expect(result.valid).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  test('contains all required primitives', () => {
    const primitiveIds = dnsResolutionAnimation.primitives.map(p => p.id);
    expect(primitiveIds).toContain('client');
    expect(primitiveIds).toContain('resolver');
    expect(primitiveIds).toContain('root');
    expect(primitiveIds).toContain('tld');
    expect(primitiveIds).toContain('authoritative');
  });

  test('has correct connection structure', () => {
    const connections = dnsResolutionAnimation.connections;
    expect(connections).toHaveLength(8);
    
    // Verify all connections reference valid nodes
    const nodeIds = dnsResolutionAnimation.primitives.map(p => p.id);
    connections.forEach(conn => {
      expect(nodeIds).toContain(conn.from);
      expect(nodeIds).toContain(conn.to);
    });
  });
});
```

### Integration Tests

#### LLM Assistant Integration

```typescript
// src/components/FloatingLLMAssistant/__tests__/LLMAssistantIntegration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LLMContextProvider } from '../LLMContext';

describe('LLM Assistant Integration', () => {
  test('preserves context when switching lessons', async () => {
    const user = userEvent.setup();
    
    render(
      <LLMContextProvider>
        <FloatingLLMAssistant />
      </LLMContextProvider>
    );
    
    // Open assistant
    const trigger = screen.getByRole('button', { name: /assistant/i });
    await user.click(trigger);
    
    // Verify initial context
    expect(screen.getByText(/Current lesson/i)).toBeInTheDocument();
    
    // Simulate lesson change (in real app, this would be triggered by App state)
    // Test that context updates appropriately
  });

  test('caches queries when offline', async () => {
    // Mock network failure
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    
    render(
      <LLMContextProvider>
        <FloatingLLMAssistant />
      </LLMContextProvider>
    );
    
    const trigger = screen.getByRole('button', { name: /assistant/i });
    await userEvent.click(trigger);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Test query');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Verify query is cached for offline resubmission
    expect(screen.getByText(/Connection lost/i)).toBeInTheDocument();
  });
});
```

### Component Tests for New Components

```typescript
// src/components/ExerciseVerification.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseVerification } from '../ExerciseVerification';

vi.mock('../lib/verification-contract', () => ({
  runVerificationContract: vi.fn(() => Promise.resolve({ passed: true })),
  recordVerificationEvidence: vi.fn(() => Promise.resolve())
}));

describe('ExerciseVerification', () => {
  test('runs verification when button clicked', async () => {
    const onVerificationComplete = vi.fn();
    
    render(
      <ExerciseVerification 
        exerciseId="B1.1"
        lessonId="B1.1"
        onVerificationComplete={onVerificationComplete}
      />
    );
    
    const button = screen.getByRole('button', { name: /Run Verification/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onVerificationComplete).toHaveBeenCalled();
    });
  });

  test('records verification result on success', async () => {
    const onVerificationComplete = vi.fn();
    
    render(
      <ExerciseVerification 
        exerciseId="B1.1"
        lessonId="B1.1"
        onVerificationComplete={onVerificationComplete}
      />
    );
    
    const button = screen.getByRole('button', { name: /Run Verification/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Verification passed/i)).toBeInTheDocument();
    });
  });
});
```

---

## Correctness Properties

This feature involves IaC and UI rendering components where property-based testing is not appropriate. Instead, we use:

- **Example-based unit tests** for pure logic functions
- **Snapshot tests** for component rendering
- **Mock-based tests** for external service integration
- **Integration tests** for complete user workflows

### Test Coverage Requirements

| Component | Test Type | Coverage |
|-----------|-----------|----------|
| FloatingLLMAssistant | Unit + Integration | 90%+ |
| VoiceInput | Unit + Snapshot | 85%+ |
| LLMClient | Unit + Mock | 80%+ |
| Responsive Utilities | Unit | 100% |
| ExerciseVerification | Unit + Integration | 90%+ |
| DNS Animation | Unit + Snapshot | 95%+ |

### Accessibility Testing

All new components must pass:
1. Keyboard navigation (tab order, Enter/Space activation)
2. Screen reader compatibility (ARIA labels, roles)
3. Color contrast ratios (4.5:1 minimum)
4. Focus indicators visible
5. Reduced motion support

---

## Implementation Constraints

### Performance Budget

- Initial page load impact: <500ms
- Floating Assistant expanded: <100ms open time
- Voice recording: <200ms latency from button press to recording start
- LLM API response: <5 seconds for 95% of requests

### Accessibility Requirements

- WCAG 2.1 AA compliance for all new components
- 44x44px minimum touch targets on mobile
- Keyboard navigation support
- ARIA attributes for screen readers
- Reduced motion support (`prefers-reduced-motion`)

### Security Requirements

- TLS 1.3 encryption for all network requests
- Input validation to prevent injection attacks
- Rate limiting on LLM API calls
- Query caching limited to 24 hours
- No storage of sensitive user data

### Reliability Requirements

- 99% availability during normal operating hours
- Graceful degradation when LLM is unavailable
- Automatic retry with exponential backoff
- Offline query queuing and resubmission

---

## Dependencies

### Internal Dependencies

- Existing lesson content structure with IDs, titles, and objectives
- DevOps Terminal Agent infrastructure for machine verification
- Podcast audio synchronization infrastructure
- Existing animation library foundation
- Current Next.js application structure and routing

### External Dependencies

- LLM API provider (OpenAI, Anthropic, or similar)
- Speech-to-text service (Web Speech API or third-party)
- Text-to-speech service (Web Speech API or third-party)
- Network connectivity to external services

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Floating Assistant load impact | <500ms |
| Mobile layout load time | <2 seconds on 4G |
| LLM response time (p95) | <5 seconds |
| Voice recording latency | <200ms |
| Animation load time | <300ms |
| CI pass rate | 99% |
| WCAG compliance | 2.1 AA level |
| Test coverage | 85%+ for new code |
