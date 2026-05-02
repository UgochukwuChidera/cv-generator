---
name: elite-frontend-design
description: Create distinctive, production-grade frontend interfaces with world-class aesthetic quality. Implement frontend code (HTML/CSS/JS, React, Vue, etc.) that avoids generic "AI slop" aesthetics through bold creative direction, meticulous craft, and intentional design choices.
---

This skill enables elite-level frontend design and implementation. It covers the complete spectrum of visual design from foundational philosophy to execution across all critical domains with depth, nuance, and uncompromising quality standards.

The agent must understand that **"great design is invisible"** and that elite frontend work requires mastery across multiple interrelated disciplines working in harmony. Every design decision must serve the user's ultimate goal: an experience that feels intuitive, delightful, and respectful of their time and attention.

## Design Thinking & Creative Direction

Before writing any code, analyze the context and commit to a **BOLD aesthetic direction**:

- **Purpose**: What problem does this interface solve? Who uses it? What is the core user need?
- **Tone**: Pick an extreme and execute it with conviction. Options include: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, vaporwave/neon, skeuomorphic, flat 2.0, neumorphic, neo-brutalist, swiss-style, japanese-minimal, gothic/ornate, etc.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?
- **Constraints**: Framework requirements, performance budgets, accessibility mandates.

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work—the key is intentionality, not intensity. Don't hedge. Commit fully or don't bother.

---

## 1. Design Philosophies (Plural) & Principles

### 1.1 Foundational Design Theories
- **Visual Hierarchy**: Guide user's eye through deliberate arrangement based on importance—size, color, contrast, spacing, positioning.
- **Figure-Ground Relationship**: Create clear distinction between focal elements and backgrounds. Use negative space as an active design element.
- **Proximity & Grouping**: Group related elements; separate unrelated ones. Spatial relationships communicate relationships.
- **Similarity & Consistency**: Use visual similarity to communicate belonging. Maintain consistent treatment of similar elements.
- **Fitts's Law**: Time to acquire a target = f(distance/size). Make interactive elements large enough, easily reachable.
- **Hick's Law**: Minimize choices to reduce decision time. Simplify through progressive disclosure.
- **Miller's Law**: Working memory holds ~7(±2) items. Chunk information to respect cognitive limits.
- **Gestalt Principles**: Similarity, continuity, closure, proximity, symmetry, common fate—apply all to create coherent experiences.

### 1.2 Design Mental Models
- **Progressive Enhancement**: Baseline experience first, enhance for capable devices.
- **Graceful Degradation**: Core functionality works, then enhance for better experiences.
- **Mobile-First**: Design for smallest screens first—forces prioritization of essential content.
- **Responsive vs Adaptive**: Responsive (fluid) layouts preferred; adaptive (fixed breakpoints) only when necessary.
- **Atomic Design**: Build from atoms → molecules → organisms → templates → pages.
- **Constitutional Design**: Start with design principles (what's allowed, what's forbidden), then derive decisions from principles.

### 1.3 Design Integrity
- **Cohesion**: Every element must feel like it belongs to the same system. No visual contradictions.
- **Unity**: Create unified experience. Elements work together harmoniously.
- **Balance**: Achieve visual stability through symmetry (formal) or asymmetry (dynamic).
- **Rhythm**: Create predictable patterns in spacing, sizing, timing. Establish cadence users can anticipate.
- **Distinctiveness**: Each design should feel unique—not interchangeable with any other project.

---

## 2. Color Systems & Palettes (Plural)

### 2.1 Color Theory Foundations
- **Hue**: Pure spectrum color. Understand relationships—complementary, analogous, triadic, split-complementary, tetradic.
- **Saturation**: Intensity/purity. Desaturate backgrounds; saturate accents.
- **Lightness**: Brightness relative to white/black. Use systematically across surfaces.
- **Temperature**: Warm (red-orange-yellow) vs cool (blue-green-purple). Understand emotional associations.

### 2.2 Color Spaces & Models
- **HSL/HSLA**: Hue, Saturation, Lightness. Use for programmatic manipulation.
- **LCH/CIELCH**: Perceptually uniform. Use for advanced interpolation.
- **Oklab**: Modern perceptually uniform. Use for smooth gradients.
- **RGB**: Additive mixing for screens.
- **HEX**: CSS representation. Use lowercase (`#fff` not `#FFFFFF`).

### 2.3 Palette Construction (Plural Strategies)
- **Primary Colors**: Core brand colors. Primary actions, key brand elements.
- **Secondary Colors**: Supporting colors. Secondary actions, supporting elements.
- **Accent Colors**: Highlight colors. Use sparingly for CTAs, alerts, emphasis.
- **Neutral Colors**: Grays, near-blacks/whites. Text, backgrounds, borders.
- **Semantic Colors**: Success (green), Error (red), Warning (yellow), Info (blue). Feedback.
- **Surface Colors**: Backgrounds at various elevations. Subtle depth through lightness variations.
- **Tinted Neutrals**: Neutrals with slight hue bias. More sophisticated than pure gray.

### 2.4 Palette Generation Strategies (Plural)
- **Monochromatic**: Single hue, varying saturation/lightness.
- **Analogous**: Adjacent hues. Harmonious, low contrast.
- **Complementary**: Opposite hues. High contrast, vibrant.
- **Split-Complementary**: Base + two colors adjacent to complement. Balance.
- **Triadic**: Three colors equally spaced. High saturation, balanced.
- **Tetradic**: Four colors forming rectangle. Rich but complex.
- **Temperature Contrast**: Warm/cool juxtaposition for dynamic tension.

### 2.5 Dark Mode & Light Mode (Plural)
- **Inverted Palettes**: Complete separate palettes. Don't just invert colors.
- **Contrast Ratios**: WCAG AA requires 4.5:1 (normal text), 3:1 (large text). AAA requires 7:1, 4.5:1.
- **Elevations in Dark Mode**: Lighter colors for higher elevations (opposite of light mode).
- **Reduced Brightness**: Not pure black (#000). Use surfaces like #121212, #1a1a1a.
- **Text Colors**: Off-white (#e0e0e0) for body in dark mode. Pure white causes eye strain.
- **Accent Adjustment**: Adjust accents for dark mode visibility.

### 2.6 Color Application Rules
- **60-30-10 Rule**: 60% dominant (backgrounds), 30% secondary, 10% accent.
- **Color Blindness**: Test with deuteranopia, protanopia, tritanopia simulations.
- **Color as Decorator**: Never color alone as only differentiator. Use shape/text too.
- **Transparent Surfaces**: rgba with alpha for overlays (modals, dropdowns).

---

## 3. Typography Systems (Plural)

### 3.1 Font Categories & Selection (Plural)
- **Serif**: Traditional, formal, authoritative. Examples: Playfair Display, Merriweather, Libre Baskerville, Cormorant Garamond, DM Serif Display, Lora, Crimson Pro.
- **Sans-Serif**: Modern, clean, neutral. Examples: Inter, Roboto, Open Sans, Source Sans Pro, Geist, Satoshi, Plus Jakarta Sans, Manrope.
- **Display**: Decorative, for headlines. Examples: Space Grotesk, Outfit, Clash Display, General Sans, Monument Extended, Tungsten, Fedra Sans, Brown.
- **Monospace**: Code, technical content. Examples: JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Geist Mono.
- **Script/Handwriting**: Decorative, personal. Use sparingly. Examples: Dancing Script, Pacifico, Caveat.
- **Slab Serif**: Rugged, industrial. Examples: Roboto Slab, Zilla Slab, Arvo, Serra.
- **Condensed**: Narrow layouts. Examples: Roboto Condensed, Industry, DIN, Fedra Sans Condensed.
- **Variable Fonts**: Single file for multiple weights/styles. Significantly reduce requests.

### 3.2 Font Pairing Principles (Plural)
- **Contrast**: Pair serif with sans-serif for distinction. Different weights for subtle pairing.
- **X-Height**: Match fonts with similar x-heights for harmony.
- **Mood**: Ensure fonts share compatible emotional qualities.
- **Legibility**: Most important factor. Never sacrifice readability for "style."
- **System Font Stacks**: Performance-critical applications. Proper stack construction: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`
- **Font Weights**: Don't just use 400/700. Explore 300, 500, 600 for nuance.

### 3.3 Type Scales & Hierarchies (Plural)
- **Modular Scale**: Generate harmonious sizes. Ratios: Minor Third (1.2), Major Third (1.25), Perfect Fourth (1.333), Golden Ratio (1.618).
- **Type Tokens**: Semantic sizes—`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`.
- **Fluid Typography**: clamp() for continuous scaling. `clamp(1rem, 0.5rem + 2vw, 1.5rem)`.
- **Responsive Headlines**: Larger ratios for desktop, smaller for mobile.
- **Semantic Weight**: Use weight semantically—bold isn't always "important," sometimes it's just visual accent.

### 3.4 Typography Metrics & Tuning (Plural)
- **Line Height (Leading)**: Body 1.5-1.6. Headlines 1.2-1.3. Tighten larger text, loosen smaller.
- **Letter Spacing (Tracking)**: Headers: slightly negative. Body: slightly positive. All caps: positive for readability.
- **Word Spacing**: Increase for large justified text. Use with caution.
- **Line Length (Measure)**: 45-75 characters optimal. Use `ch` units: `max-width: 65ch`.
- **Paragraph Spacing**: 1em to 1.5em between paragraphs.

### 3.5 Vertical Rhythm (Plural)
- **Baseline Grid**: Align text to 4px or 8px baseline. Use `line-height` multiples.
- **Elastic Baseline**: Off-grid permitted at scaled sizes.
- **Cap Height Alignment**: Align cap height to grid, not baseline.

### 3.6 Web Font Optimization (Plural)
- **Font Formats**: WOFF2 (primary), WOFF (fallback), TTF/OTF (legacy). Subset for language.
- **Font Loading**: `font-display: swap` for fastest perceived load. Consider `optional` for non-critical.
- **Preloading**: Preload critical fonts with `<link rel="preload" as="font">`.
- **Variable Fonts**: Single file for multiple weights/styles.

---

## 4. Layout Systems (Plural)

### 4.1 Grid Systems (Plural)
- **CSS Grid**: Primary tool for 2D layouts. `grid-template-columns`, `grid-template-rows`, `gap`.
- **Column Grids**: 12-column standard. 16-column for complex. 4-column for mobile.
- **Gutters**: Consistent at each breakpoint. 16px, 24px, 32px common.
- **Margins**: Outer margins (edge padding). Match gutters or larger.
- **Max Width**: Constrain content. 1200px, 1440px common.
- **Container Queries**: `@container` for component-scoped responsive.

### 4.2 Flexbox Patterns (Plural)
- **1D Layouts**: Components, 1D arrangements (navs, toolbars, card rows).
- **Main/Cross Axis**: Control alignment on both axes.
- **Wrapping**: `flex-wrap: wrap` for responsive wrapping.
- **Growing/Shrinking**: `flex-grow`, `flex-shrink`, `flex-basis`.
- **Gaps**: `gap` for consistent spacing.

### 4.3 Responsive Layout Strategies (Plural)
- **Fluid Layouts**: Percentages, VW/VH, REM.
- **Breakpoints**:
  - Mobile: 0-479px
  - Tablet Portrait: 480-767px
  - Tablet Landscape: 768-1023px
  - Desktop: 1024-1439px
  - Ultra-wide: 1440px+
- **Container Queries**: Component-scoped layouts.
- **Aspect Ratio**: Maintain proportion with `aspect-ratio`.

### 4.4 Spacing Systems (Plural)
- **Spacing Tokens**: Semantic spacing—`space-1` (4px), `space-2` (8px), `space-3` (16px), `space-4` (24px), `space-5` (32px), `space-6` (48px), `space-8` (64px), `space-10` (80px), `space-12` (96px), `space-16` (128px).
- **8pt Grid**: Align to 8px baseline. 4px for fine adjustments.
- **Rhythmic Spacing**: Multiples of base unit. Predictable rhythm.
- **Spacing Scale Relation**: Consistent ratios between steps (2x or 1.5x).

### 4.5 Layout Patterns (Plural)
- **Holy Grail**: Header, sidebar-left, main, sidebar-right, footer.
- **Sidebar Layout**: Fixed sidebar with scrollable main.
- **Sticky Header**: Navigation visible on scroll.
- **Card Grid**: Responsive cards, consistent sizing.
- **Masonry**: Uneven-height cards.
- **Split View**: Two equal/relative panels.
- **Feed/List**: Infinite scrolling vertical lists.
- **Dashboard**: Dense information with widgets.
- **Bento Grid**: Modular grid like Japanese bento boxes.
- **Mosaic**: Asymmetric tile-based layout.

---

## 5. Visual Effects & Styling (Plural)

### 5.1 Shadows & Depth (Plural)
- **Elevation System**: 0+ levels. Each has distinct shadow properties.
- **Multiple Layers**: Compose from multiple offset/sigma layers.
- **Ambient vs Directional**: Ambient for floating; directional for attached.
- **Shadow Colors**: Not pure black. Use tinted: `rgba(0, 0, 0, 0.1)` or brand-tinted.
- **Interactive Shadows**: Elevated on hover; pressed on active.
- **Colored Shadows**: Branded glows, emphasis effects.

### 5.2 Borders & Outlines (Plural)
- **Border Widths**: Thin (1px), medium (2px), thick (4px). Use semantically.
- **Border Colors**: Semantic colors—default, hover, focus, disabled.
- **Border Radius**:
  - Sharp: 0px
  - Slightly rounded: 4px
  - Rounded: 8px
  - Pill: 9999px
  - Circular: 50%
- **Radius Scaling**: Larger radii on larger elements.
- **Subtle Borders**: 1px, low opacity.

### 5.3 Backgrounds & Surfaces (Plural)
- **Surface Layers**: Multiple surface levels with subtle lightness differences.
- **Gradient Backgrounds**: Subtle, directional for depth. "Premium" feel.
- **Noise/Texture**: Subtle grain for depth.
- **Glassmorphism**: `backdrop-filter: blur()`, semi-transparent backgrounds.
- **Mesh Gradients**: Complex, multi-point (use restraint).
- **Patterns**: Geometric, organic, custom. Use sparingly.

### 5.4 Animations & Transitions (Plural)
- **Easing Functions**:
  - `ease`: Default, mechanical.
  - `ease-in-out`: Natural, recommended.
  - `ease-out`: Entering elements.
  - `ease-in`: Exiting elements.
  - `cubic-bezier(...)`: Custom curves. `cubic-bezier(0.16, 1, 0.3, 1)` for spring-like.
  - `linear`: Rarely use.
- **Durations**:
  - Instantaneous: 0-50ms (UI feedback)
  - Quick: 100-150ms (hover)
  - Normal: 200-300ms (standard)
  - Deliberate: 400-500ms (page transitions)
- **Micro-interactions**: Every user action gets feedback—hover, focus, press, release.
- **Staggered Animations**: Reveal lists/grids with small delays.
- **Page Transitions**: Smooth routing—fade, slide, crossfade.
- **Scroll Animations**: Parallax, reveal-on-scroll, sticky effects (Intersection Observer).
- **Keyframe vs Transition**: Keyframes for complex; transitions for simple state changes.
- **Respect Preferences**: Use `prefers-reduced-motion`.

### 5.5 Iconography (Plural)
- **Icon Styles**: Outlined, filled, duotone, multicolor. Consistent within design.
- **Icon Sizes**: Match text sizes or standard (16, 20, 24, 32).
- **Icon Strokes**: Consistent widths (1.5px or 2px).
- **Icon Fonts vs SVG**: Prefer SVG for crispness, accessibility.
- **Icon Libraries**: Lucide, Heroicons, Phosphor Icons, Feather Icons, Radix Icons.
- **Custom Icons**: Professional design. Consistent grid (24x24).

---

## 6. Components & Patterns (Plural)

### 6.1 Component Architecture (Plural)
- **Atomic Organization**: Build from primitives upward.
- **Composition**: Complex from simpler.
- **Slot Patterns**: Content flexibility through slots.
- **Prop Controllability**: Support controlled and uncontrolled.
- **Compound Components**: Groups sharing state (Tabs + TabList + TabPanel).

### 6.2 Common Component Patterns (Plural)
- **Buttons**: Primary, secondary, ghost, link variants. Sizes: sm, md, lg. States: default, hover, active, disabled, loading.
- **Inputs**: Text, textarea, select, checkbox, radio, toggle, date picker. States: default, focus, error, disabled, readonly.
- **Cards**: Content containers. Headers, bodies, footers.
- **Modals/Dialogs**: Overlays with backdrop. Focus trapping required.
- **Dropdowns/Menus**: Positioned menus. Keyboard navigation.
- **Tabs**: Switchable content panels.
- **Accordions**: Collapsible sections.
- **Toasts/Notifications**: Non-blocking feedback.
- **Tooltips**: Contextual help on hover/focus.
- **Badges/Tags**: Small labels, status indicators.
- **Avatars**: User representation. Sizes, fallbacks.
- **Skeletons/Loading**: Placeholder shapes.
- **Empty States**: Meaningful messages when no content.

### 6.3 State Handling (Plural)
- **Default/Base**: Normal appearance.
- **Hover**: Mouse over feedback. Subtle but noticeable.
- **Focus**: Keyboard focus ring. Visible, accessible, distinctive.
- **Active/Pressed**: During click/tap.
- **Disabled**: Cannot interact. Reduced opacity, remove from tab order.
- **Loading**: Async in progress.
- **Error**: Validation or system error. Clear messaging.
- **Success**: Operation complete.

### 6.4 Responsive Component Behavior (Plural)
- **Fluid Sizing**: flex/grow/shrink, percentages, container queries.
- **Collapsed Views**: Full desktop, simplified mobile.
- **Touch-Friendly Targets**: Minimum 44x44px. 48px recommended for primary.
- **Hover Alternatives**: Equivalent for non-hover (touch) devices.

---

## 7. Accessibility (A11y) (Plural Requirements)

### 7.1 Semantic HTML (Plural)
- `<header>`: Page/section introduction.
- `<nav>`: Navigation links.
- `<main>`: Primary content.
- `<aside>`: Supplementary content.
- `<footer>`: Page/section conclusion.
- `<article>`: Self-contained content.
- `<section>`: Thematic grouping.
- `<figure>`: Media with optional caption.

### 7.2 Interactive Elements (Plural)
- **Links**: Must have href for navigation. `<button>` for actions.
- **Labels**: All inputs have associated labels.
- **Groups**: `<fieldset>` and `<legend>` for related inputs.
- **Descriptions**: `aria-describedby` for help text.

### 7.3 ARIA Usage (Plural)
- **Roles**: Correct roles. `role="button"` for non-button elements.
- **States**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`.
- **Properties**: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`.
- **Live Regions**: `aria-live="polite"` or `assertive"` for dynamic content.
- **Presentation**: `role="presentation"` to remove semantics.

### 7.4 Keyboard Navigation (Plural)
- **Focus Order**: Logical tab order matching visual order.
- **Focus Visible**: Never remove without replacement.
- **Skip Links**: "Skip to content" for keyboard users.
- **Shortcuts**: Keyboard shortcuts. Document them.
- **Arrow Keys**: Menus, lists, trees—support arrow navigation.
- **Escape**: Close modals, dropdowns, tooltips with Escape.

### 7.5 Screen Reader Considerations (Plural)
- **Hidden Content**: `.sr-only` or `aria-hidden` appropriately.
- **Announcements**: Live regions for dynamic updates.
- **Alt Text**: Meaningful alt text. "Image of..." insufficient.
- **Tables**: Proper headers (`<th>` with scope). Captions for complex tables.

### 7.6 Performance Accessibility (Plural)
- **Reduced Motion**: Respect `prefers-reduced-motion`.
- **Contrast**: Always meet WCAG AA (4.5:1).
- **Text Resizing**: Support 200% zoom without loss.

---

## 8. Design Systems & Tokens (Plural)

### 8.1 Token Categories (Plural)
- **Color Tokens**: `color-text-primary`, `color-background-surface`, `color-accent-primary`.
- **Typography Tokens**: `font-family-heading`, `font-size-lg`, `font-weight-bold`, `line-height-tight`.
- **Spacing Tokens**: `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`.
- **Shadow Tokens**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`.
- **Radius Tokens**: `radius-sm`, `radius-md`, `radius-lg`, `radius-full`.
- **Motion Tokens**: `duration-fast`, `duration-normal`, `duration-slow`, `ease-elastic`.
- **Breakpoint Tokens**: `bp-sm`, `bp-md`, `bp-lg`, `bp-xl`.

### 8.2 Token Architecture (Plural)
- **Primitives**: Raw values (`#ffffff`, `16px`, `1rem`).
- **Semantic**: Mapped to primitives (`color-text-primary` → `#1a1a1a`).
- **Component**: Component-scoped (`button-bg` → `color-primary`).

### 8.3 Implementation Approaches (Plural)
- **CSS Custom Properties**: Native, performant, themeable.
- **Style Dictionary**: Cross-platform token system.
- **Design Tokens Format**: W3C Design Tokens Community Group spec.
- **Themeable Systems**: Multiple themes (brand variations, internal/external).

### 8.4 Documentation Requirements (Plural)
- **Component Inventory**: All components with variants.
- **Usage Guidelines**: When to use each component.
- **Code Examples**: Copy-paste examples with variations.
- **Accessibility Notes**: A11y requirements per component.
- **Do's and Don'ts**: Visual examples of correct/incorrect usage.

---

## 9. Responsive & Adaptive Design (Plural)

### 9.1 Breakpoint Strategies (Plural)
- **All Breakpoints**: xs, sm, md, lg, xl, 2xl. Document ranges.
- **Content-First**: Breakpoints based on content, not devices.
- **Minimum Targets**: 320px minimum (iPhone SE).
- **Touch Targets**: 44px minimum.

### 9.2 Responsive Images (Plural)
- **Srcset**: Resolution switching. `srcset="image-400.jpg 400w, image-800.jpg 800w"`.
- **Sizes**: Layout size. `sizes="(min-width: 800px) 50vw, 100vw"`.
- **Picture Element**: Art direction. Different crops mobile/desktop.
- **Lazy Loading**: `loading="lazy"` for below-fold.
- **Formats**: WebP/AVIF with fallbacks.

### 9.3 Responsive Typography (Plural)
- **Fluid Type**: CSS `clamp()` for continuous scaling.
- **Stepped Type**: Change sizes at breakpoints if fluid unsuitable.
- **Minimum Size**: Ensure legibility at smallest.

### 9.4 Progressive Enhancement (Plural)
- **CSS Grid**: Gracefully degrades to single column.
- **Container Queries**: Progressive enhancement—default to width-based.
- **Modern CSS**: Use `is()`, `:has()` with feature queries or graceful fallback.

---

## 10. Performance Optimization (Plural)

### 10.1 Critical Rendering (Plural)
- **Critical CSS**: Inline styles for above-the-fold.
- **Font Loading Strategies**: `font-display` values—swap, block, optional, fallback.
- **Preload Resources**: Fonts, hero images, CSS.

### 10.2 Image Optimization (Plural)
- **Format Selection**: SVG for graphics/UI, WebP/AVIF for photos.
- **Sizing**: Serve at displayed size.
- **Compression**: Tools like sharp, imagemin, squoosh.
- **Responsive Images**: Correct sizes for device.

### 10.3 JavaScript Performance (Plural)
- **Code Splitting**: Split by route. Dynamic imports.
- **Tree Shaking**: Remove unused code.
- **Bundle Analysis**: source-map-explorer, webpack-bundle-analyzer.
- **Lazy Loading**: Below-fold components only when needed.

### 10.4 Rendering Performance (Plural)
- **Content Visibility**: `content-visibility: auto` for off-screen.
- **Will Change**: Use sparingly.
- **Transform/Opacity**: Animate only these for best performance.
- **Debounce/Throttle**: Limit scroll/resize handlers.

---

## 11. Implementation Workflows (Plural)

### 11.1 Design Phase (Plural Steps)
1. **Requirements Analysis**: Business goals, user needs, brand identity.
2. **Competitive Analysis**: Research comparable products.
3. **Information Architecture**: Structure content, navigation.
4. **Wireframing**: Low-fi layout exploration.
5. **Visual Design**: Establish design system.
6. **High-Fidelity Design**: Detailed mockups/prototypes.
7. **Creative Direction**: Commit to bold aesthetic vision.

### 11.2 Implementation Phase (Plural Steps)
1. **Setup**: Configure project, tooling, design tokens.
2. **Foundation**: HTML structure with semantic markup.
3. **Base Styles**: Global styles, resets, design tokens.
4. **Components**: Build reusable components.
5. **Layouts**: Assemble pages from components.
6. **Interactions**: Add animations, interactivity.
7. **Responsive**: Ensure all breakpoints work.

### 11.3 Validation Phase (Plural Steps)
1. **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge.
2. **Device Testing**: Real devices, not just simulators.
3. **Accessibility Audit**: Lighthouse, axe, manual testing.
4. **Performance Audit**: Core Web Vitals, Lighthouse.
5. **Code Review**: Linting, type checking, peer review.
6. **Aesthetic Review**: Does it match the creative vision?

---

## 12. Quality Standards (Plural Checklists)

### 12.1 Visual Checkpoints
- [ ] Consistent use of design tokens
- [ ] Cohesive visual hierarchy
- [ ] Balanced whitespace
- [ ] Harmonious color usage
- [ ] Proper typography hierarchy and spacing
- [ ] Consistent border radius usage
- [ ] Proper elevation/shadow usage
- [ ] Pixel-perfect implementation
- [ ] Matches creative direction
- [ ] Distinctive, not generic

### 12.2 Technical Checkpoints
- [ ] Semantic HTML structure
- [ ] Proper ARIA attributes
- [ ] Keyboard navigation functional
- [ ] Screen reader testing passed
- [ ] Works at 200% zoom
- [ ] No horizontal scroll at any width
- [ ] Touch targets adequate (44px+)
- [ ] Focus states visible, consistent
- [ ] No console errors
- [ ] All interactions work

### 12.3 Performance Checkpoints
- [ ] LCP under 2.5 seconds
- [ ] FID under 100ms
- [ ] CLS under 0.1
- [ ] Fonts preloaded appropriately
- [ ] Images optimized (next-gen formats)
- [ ] Critical CSS inlined
- [ ] No render-blocking resources
- [ ] Bundle size reasonable

---

## Aesthetic Guidelines (Anti-Generic)

### Never Use (Plural)
- Generic fonts: Arial, Inter, Roboto (unless intentional), system defaults
- Clichéd color schemes: Purple gradients on white, blue buttons everywhere
- Predictable layouts: Hero → features → testimonials → footer
- Cookie-cutter components: Generic cards, generic navbars, generic footers
- Overused fonts: Space Grotesk (it's now generic), common choices that feel "AI-generated"

### Always Commit To (Plural)
- **Typography**: Beautiful, unique, interesting font choices. Unexpected, characterful. Pair distinctive display with refined body.
- **Color**: Cohesive aesthetic. CSS variables for consistency. Dominant colors with sharp accents. Never timid evenly-distributed palettes.
- **Motion**: Effects and micro-interactions. CSS-only solutions when possible. High-impact moments—one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking. Generous negative space OR controlled density.
- **Backgrounds**: Atmosphere and depth, not default solid colors. Contextual effects and textures matching aesthetic. Gradient meshes, noise, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays.

### Creative Variety (Plural Directions)
Vary between:
- Light and dark themes
- Different font families
- Different aesthetics per project
- Never converge on common choices across generations

**REMEMBER**: Claude is capable of extraordinary creative work. Don't hold back. Show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

*This skill represents complete mastery required for elite frontend design. It demands excellence across all domains working in concert. Every decision must serve the user's ultimate goal: an experience that feels intuitive, delightful, respectful of time and attention.*

*The sum must be greater than the parts—cohesion, intentionality, and craft distinguish the excellent from the adequate.*