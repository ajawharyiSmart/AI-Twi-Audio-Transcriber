---
name: HAKI Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  transcription-text:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The design system is built on a foundation of **Modern Minimalism** with a focus on high-utility AI interaction. It targets a professional audience requiring precision in transcription and translation, specifically for the Ga language. The aesthetic is "Intelligent Clarity"—evoking a sense of calm, technological sophistication, and extreme legibility.

Drawing inspiration from contemporary AI interfaces, the system utilizes expansive whitespace to reduce cognitive load during complex translation tasks. The interface feels lightweight and breathable, using subtle motion and depth to guide the user through the transcription workflow. It avoids unnecessary decoration, ensuring that the cultural nuance of the language and the power of the AI remain the focal points.

## Colors

The palette is anchored by **HAKI Blue**, a vibrant and trustworthy primary hue that signals reliability and technological intelligence. **Emerald Green** serves as the functional accent, specifically reserved for "success" states, active transcription indicators, and completion actions, reflecting growth and clarity.

The neutral scale is heavily weighted toward the cooler end of the spectrum to maintain a professional, "SaaS-like" feel.
- **Primary:** Used for main actions, active states, and branding.
- **Accent:** Used for secondary highlights and AI-driven success feedback.
- **Surface:** A soft off-white used for cards and containers to distinguish them from the pure white background without heavy borders.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic and utilitarian feel. The hierarchy is optimized for long-form reading, essential for reviewing transcriptions.

- **Scale:** A tight scale ensures consistency across dense translation views.
- **Transcription Text:** A specialized role with increased line-height (32px) to allow for easier scanning and potential inline annotations or corrections.
- **Labels:** Used for metadata (e.g., timestamps, speaker names), using a slightly heavier weight and increased letter spacing for immediate recognition.

## Layout & Spacing

The layout follows a **4px baseline grid** to ensure mathematical harmony. For the mobile interface, we employ a 4-column fluid grid with 16px outer margins.

- **Vertical Rhythm:** Content blocks (like transcription bubbles) are separated by 12px, while major sections use 24px.
- **Touch Targets:** All interactive elements must maintain a minimum 44x44px hit area, even if the visual representation is smaller.
- **Safe Areas:** Adherence to device safe-areas is mandatory, particularly for the bottom navigation and the floating action button (FAB) used for initiating recording.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Ambient Shadows** rather than harsh lines. 

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Inputs):** Soft Surface (#F8FAFC) with a 1px border (#F1F5F9).
- **Level 2 (Active States/Floating):** Use an extra-diffused shadow: `box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);`.
- **Blur:** AI-processing states may use a subtle backdrop-filter (blur 8px) on translucent overlays to maintain context while focusing user attention.

## Shapes

The shape language is "Rounded," striking a balance between the clinical precision of sharp corners and the overly casual nature of pill shapes. 

- **Default (0.5rem):** Used for standard buttons, input fields, and small cards.
- **Large (1rem):** Used for main transcription containers and modal sheets.
- **Full (Pill):** Reserved exclusively for status chips (e.g., "Live", "Completed") and the primary "Record" button to denote its special interactive status.

## Components

### Buttons
- **Primary:** Background HAKI Blue, White text, 8px corner radius. No shadow in rest state, slight lift on tap.
- **Secondary:** Transparent background, HAKI Blue border (1px), HAKI Blue text.
- **AI Action:** Emerald Green background, used only for "Finalize" or "Translate" actions.

### Transcription Cards
- Use Surface color (#F8FAFC).
- 16px padding.
- Include a 4px vertical "speaker accent" bar on the left edge (Primary Blue for AI, Neutral Slate for User).

### Input Fields
- Flat styling with 1px border (#E2E8F0).
- On focus, the border transitions to Primary Blue with a 2px outer glow (10% opacity Blue).

### Bottom Navigation
- Fixed at base with a subtle top border (#F1F5F9).
- Active icons use Primary Blue; inactive use Slate-400.
- Labels use `label-md` typography.

### AI Processing Indicator
- A pulsing Emerald Green ring around the Record button or a linear shimmer effect across the top of the active transcription card.