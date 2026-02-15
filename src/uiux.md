# Cryptocurrency Trading Platform - UI/UX Design Rules

## Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Layout & Spacing](#layout--spacing)
4. [Component Design](#component-design)
5. [Navigation](#navigation)
6. [Visual Hierarchy](#visual-hierarchy)
7. [Interaction Design](#interaction-design)
8. [Information Architecture](#information-architecture)
9. [Accessibility](#accessibility)
10. [Responsive Design](#responsive-design)

---

## Color System

### Primary Color Palette
- **Neon Green/Lime** (#C5FF00 or similar): Primary brand color used for CTAs, active states, and positive financial data
- **Black** (#000000): Primary text, backgrounds for emphasis, navigation bar
- **White/Off-white** (#FFFFFF, #F8F8F8): Main background, card backgrounds
- **Medium Gray** (#666666 - #999999): Secondary text, labels, inactive states

### Functional Colors
- **Success Green**: Used for deposits, positive P&L, upward trends
- **Danger Red**: Used for withdrawals, negative values (implied but not shown)
- **Neutral Gray**: Used for neutral actions and secondary information

### Color Application Rules
1. **High Contrast**: Always maintain WCAG AA contrast ratios (4.5:1 for normal text)
2. **Color Coding**: Green = positive/deposit, Black = neutral/withdraw, Lime = transfer/primary action
3. **Background Hierarchy**: White (main) → Light gray (cards) → Black (emphasis)
4. **Accent Usage**: Limit neon green to 10-15% of screen to avoid visual fatigue
5. **Financial Data**: Use color to indicate directionality (+green, -red would be standard)

---

## Typography

### Type Scale
- **Hero Numbers**: 48-56px (Balance display: $786,25.60)
- **Large Numbers**: 32-40px (Token amounts: 40,020.17860)
- **Medium Headers**: 24-28px (Section titles: "Cryptocurrency Trading Platform")
- **Body Text**: 16-18px (Descriptive text, labels)
- **Small Labels**: 12-14px (Timestamps, metadata: "Nov 24, 2024 at 02:30 AM")
- **Micro Text**: 10-12px (Currency tags: USDT)

### Font Families
- **Sans-serif**: Modern, clean sans-serif (appears to be SF Pro, Inter, or similar)
- **Monospace**: For numerical data and balances (optional but recommended)

### Typography Rules
1. **Financial Numbers**: Always use tabular figures for alignment
2. **Decimal Precision**: Show 2 decimals for currency ($), 4-6 for crypto amounts
3. **Font Weight Hierarchy**:
   - Bold (700): Main balance, primary CTAs
   - Semibold (600): Section headers, important labels
   - Regular (400): Body text, descriptions
   - Light (300): Secondary information
4. **Letter Spacing**: Tight (-0.02em) for large numbers, normal for body text
5. **Line Height**: 1.2-1.4 for headers, 1.5-1.6 for body text

---

## Layout & Spacing

### Grid System
- **8-Point Grid**: All spacing uses multiples of 8px (8, 16, 24, 32, 40, 48)
- **Screen Margins**: 16-24px horizontal padding
- **Card Padding**: 16-24px internal padding

### Spacing Scale
- **Micro**: 4px (icon-text spacing)
- **Small**: 8px (between related elements)
- **Medium**: 16px (between card elements)
- **Large**: 24px (between sections)
- **XLarge**: 32-40px (between major content blocks)

### Layout Rules
1. **Card-Based Design**: Group related information in rounded rectangles
2. **Consistent Corner Radius**: 16-20px for cards, 12px for buttons, 8px for inputs
3. **White Space**: Minimum 24px between major sections
4. **Content Width**: Maximum content width ~90% of screen on mobile
5. **Safe Area**: Respect device notches and system UI (44px top, 34px bottom for iOS)

---

## Component Design

### Buttons

#### Primary Button (Continue)
- Background: Black (#000000)
- Text: White
- Height: 52-56px
- Border-radius: 26-28px (pill shape)
- Font-weight: Semibold
- Minimum touch target: 44x44px

#### Secondary Button (Skip, Deposit)
- Outline: 1px solid gray
- Background: White/Transparent
- Text: Black
- Same dimensions as primary

#### Action Buttons (Deposit, Withdraw, Transfer)
- Size: Large square ~120x120px or 100x100px
- Border-radius: 16-20px
- Icon: 24-32px
- Label below icon: 14-16px
- Color coding: Green (Deposit), Black (Withdraw), Lime (Transfer)

#### Icon Buttons
- Size: 40-48px square
- Icon: 20-24px
- Background: Usually transparent or white
- Border-radius: 50% for circular

### Cards

#### Balance Card
- Background: White
- Border: 1px solid #000000 (sharp black)
- Border-radius: 20px
- Padding: 20-24px
- Shadow: None (use borders instead)

#### Chart/PnL Card
- Background: Black
- Border: 1px solid #000000
- Text: White/Lime green for positive values
- Same border-radius as other cards
- Candlestick chart using lime green

#### Rules
1. **Sharp Borders**: Use 1px solid black borders for all cards and components
2. **Grouped Information**: Related data in same card
3. **Visual Separation**: 12-16px between cards
4. **Interactive Cards**: Add hover/tap states (scale 0.98, opacity 0.8)
5. **No Shadows**: Avoid box-shadows, use borders for definition

### Lists

#### Token Balance List
- Item height: 64-72px
- Icon size: 40-48px (circular)
- Two-line layout: Token name + Network name
- Right-aligned: Amount + USD value
- Divider: 1px solid #F0F0F0
- Last item: No divider

#### Transaction History List
- Item height: 72-80px
- Icon size: 40-48px (circular with token symbol)
- Three-line layout: Action + Timestamp + Status
- Right-aligned: Amount (with +/- indicator)
- Color-coded amounts: Green (received), Red (sent)

### Navigation

#### Tab Bar (Top Navigation)
- Height: 44-48px
- Item spacing: 16-24px
- Active indicator: 2-3px bottom border in lime green
- Horizontal scroll if items exceed width
- Labels: 14-16px, medium weight
- Active label: Bold

#### Bottom Navigation
- Height: 60-68px (including safe area)
- Background: Black
- Icons: 24px
- Labels: 10-12px (optional)
- Active state: Lime green icon/text
- Inactive state: White/gray

### Form Elements

#### Input Fields (not visible but inferred)
- Height: 48-56px
- Border-radius: 12px
- Border: 1px solid #E5E5E5
- Focus state: 2px border in lime green
- Padding: 16px horizontal

#### Tags/Badges
- Height: 28-32px
- Border-radius: 16px (pill)
- Background: Lime green
- Text: Black, 12-14px, bold
- Padding: 8-16px horizontal

---

## Navigation

### Navigation Patterns

#### Primary Navigation (Top Tabs)
1. **Horizontal Scroll**: For 5+ items
2. **Selected State**: Bottom border + bold text
3. **Unselected State**: Gray text, no border
4. **Order**: Most used features first (Overview, Spot, Funding)

#### Bottom Navigation
1. **Persistent**: Always visible except in deep flows
2. **Icon + Label**: Optional label based on importance
3. **Badge Support**: For notifications (not shown)
4. **Max Items**: 4-5 for optimal thumb reach

### Breadcrumb/Back Navigation
- Back arrow: Top-left, 24px, black
- Always accompanies deep navigation
- Animated transition: Slide right on back

---

## Visual Hierarchy

### Information Hierarchy Rules

#### F-Pattern Reading
1. **Top-left**: Logo/brand
2. **Top-right**: Profile/settings
3. **First row**: Most critical info (balance)
4. **Second row**: Secondary metrics (P&L)
5. **Third row**: Primary actions (Deposit, Withdraw, Transfer)

#### Z-Pattern (Onboarding)
1. **Top**: Icon/illustration
2. **Middle**: Headline + description
3. **Bottom**: CTAs (Continue, Skip)

### Emphasis Techniques
1. **Size**: Larger = more important (balance > P&L > actions)
2. **Color**: Bright lime green draws immediate attention
3. **Weight**: Bold for primary, regular for secondary
4. **Position**: Top = critical, bottom = less critical
5. **Contrast**: Dark on light, light on dark for emphasis

### Scanning Patterns
- **Left-aligned text**: For readability
- **Right-aligned numbers**: For comparison
- **Icons on left**: For list items and balance entries

---

## Interaction Design

### Touch Targets
- **Minimum size**: 44x44px (Apple HIG)
- **Recommended**: 48x48px (Material Design)
- **Large actions**: 100x100px+ (main action buttons)
- **Spacing**: Minimum 8px between targets

### Interactive States

#### Button States
1. **Default**: Normal appearance
2. **Hover/Focus**: Subtle scale (1.02) or opacity (0.9)
3. **Active/Pressed**: Scale down (0.98) + darker shade
4. **Disabled**: 40% opacity + no pointer events
5. **Loading**: Spinner replaces text, button disabled

#### Card States
1. **Default**: Subtle shadow
2. **Hover**: Increased shadow (0 4px 12px)
3. **Pressed**: Scale (0.98)
4. **Selected**: Border in lime green

### Animations

#### Timing Functions
- **Standard**: ease-in-out (0.3s) for most interactions
- **Quick**: 0.15s for micro-interactions
- **Slow**: 0.5s for page transitions

#### Animation Types
1. **Page transitions**: Slide left/right (300ms)
2. **Modal appear**: Fade + scale from 0.95 (250ms)
3. **List items**: Stagger by 50ms for loading
4. **Number updates**: Count-up animation (500ms)
5. **Pull-to-refresh**: Elastic bounce

### Gestures
1. **Tap**: Primary interaction
2. **Long-press**: Secondary actions/context menu
3. **Swipe left/right**: Navigate between tabs
4. **Swipe down**: Pull to refresh
5. **Pinch**: Zoom on charts (if applicable)

---

## Information Architecture

### Screen Structure

#### Overview Screen (Home)
1. **Header**: Logo + Profile (persistent)
2. **Navigation**: Horizontal tabs
3. **Hero Section**: Balance display with currency tag
4. **Metrics**: P&L card with chart
5. **Quick Actions**: 3-button grid (Deposit, Withdraw, Transfer)
6. **Detail List**: Token balances
7. **Bottom Nav**: Global navigation

#### Detail Screen (USDT)
1. **Header**: Back button + Title + Settings
2. **Hero Section**: Token balance with total value
3. **Action Row**: 4 options (Buy, P2P, Auto-Invest, Seeking Earn)
4. **Quick Trade**: Trading pair shortcuts
5. **History**: Recent transactions
6. **Bottom Actions**: Withdraw + Deposit

### Content Strategy

#### Progressive Disclosure
1. **Show critical first**: Balance, P&L visible immediately
2. **Hide complexity**: Advanced features behind tabs/buttons
3. **Summarize before detail**: Overview → Specific token
4. **Contextual actions**: Show relevant actions per screen

#### Data Density
1. **Not too sparse**: Utilize space efficiently
2. **Not too dense**: Maintain 8px minimum spacing
3. **Scannable**: Clear visual separation between sections
4. **Prioritized**: Most important data most prominent

---

## Accessibility

### Color Contrast
- **Text on white**: Minimum 4.5:1 ratio (WCAG AA)
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: 3:1 against background
- **Don't rely on color alone**: Use icons + text

### Typography
- **Minimum size**: 12px for body text
- **Line height**: 1.5 minimum for readability
- **Line length**: 50-75 characters for optimal reading
- **Scalable**: Support dynamic type/text zoom

### Touch Accessibility
- **Target size**: 44x44px minimum
- **Spacing**: 8px between interactive elements
- **Gestures**: Provide alternatives to complex gestures
- **Error prevention**: Confirm destructive actions

### Screen Reader Support
- **Label all icons**: Descriptive text alternatives
- **Meaningful order**: Logical tab/focus order
- **State communication**: Announce loading, success, error states
- **Skip navigation**: Allow bypassing repeated content

---

## Responsive Design

### Breakpoints (if needed for tablet/desktop)
- **Mobile**: 320-428px (primary focus)
- **Tablet**: 768-1024px
- **Desktop**: 1280px+

### Adaptation Rules
1. **Single column on mobile**: Stack vertically
2. **Multi-column on tablet**: 2-3 columns for action buttons
3. **Maximum width on desktop**: 1200px content container
4. **Fluid spacing**: Use percentages and viewport units
5. **Flexible images**: Use max-width: 100%

### Component Behavior
- **Navigation**: Tabs → Sidebar on desktop
- **Cards**: Stack on mobile → Grid on tablet
- **Modals**: Full-screen on mobile → Centered on desktop
- **Bottom sheet**: Native on mobile → Modal on desktop

---

## Design Patterns Summary

### Key Patterns Used

#### Card Pattern
- Groups related information
- Clear visual boundaries
- Consistent styling
- Tappable for detail views

#### Progressive Disclosure
- Start with overview
- Drill down for details
- Breadcrumbs for navigation back

#### Action-Oriented Design
- Clear, prominent CTAs
- Visual differentiation of action types
- Icon + label for clarity

#### Real-Time Data Display
- Live balance updates
- Chart visualization
- Color-coded P&L indicators

#### List-Detail Pattern
- Overview list of tokens
- Tap for detailed token view
- Maintain context with back button

---

## Design System Checklist

### When Creating New Screens

- [ ] Use 8-point spacing grid
- [ ] Maintain color palette (Black, White, Lime, Gray)
- [ ] Apply consistent border-radius (16-20px cards, 12px buttons)
- [ ] Ensure 44x44px minimum touch targets
- [ ] Use appropriate type scale
- [ ] Add interactive states (hover, pressed, disabled)
- [ ] Include loading and error states
- [ ] Test with screen reader
- [ ] Verify color contrast ratios
- [ ] Provide haptic feedback for actions
- [ ] Animate transitions (300ms standard)
- [ ] Support pull-to-refresh
- [ ] Add empty states for lists
- [ ] Include confirmation for destructive actions
- [ ] Test with largest accessibility text size

---

## Specific Component Specifications

### Balance Display Card
```
Container:
- Width: ~90% screen width
- Height: Auto (min 100px)
- Background: White
- Border: 2px solid #000000
- Border-radius: 20px
- Padding: 20px
- Shadow: None

Content:
- Label: "My Balance" (14px, gray)
- Amount: "$786,25.60" (48px, bold, black)
- Decimal: ".60" (32px, regular, gray)
- Badge: "USDT" (lime green pill, 12px bold)
- Menu icon: Top-right (24px, gray)
```

### Action Button Trio
```
Container:
- Display: Grid (3 columns)
- Gap: 12-16px
- Width: 100%

Individual Button:
- Width: ~30% (equal distribution)
- Height: 100px
- Border-radius: 16px
- Icon: 32px (centered top)
- Label: 16px semibold (bottom)
- Colors:
  - Deposit: #00D68F (green)
  - Withdraw: #000000 (black)
  - Transfer: #C5FF00 (lime)
```

### Chart Card (P&L)
```
Container:
- Background: Black
- Border: 2px solid #000000
- Border-radius: 16px
- Padding: 16px
- Height: 120-140px

Header:
- "PnL" label (14px, white)
- "Today" sublabel (12px, gray)
- Menu icon (white, right)

Content:
- Amount: "+$250,78852" (24px, lime green)
- Percentage: "+0.26%" (14px, lime green)
- Chart: Candlestick (lime green bars)
- Y-axis: Right-aligned (gray, 10px)
```

### Transaction List Item
```
Container:
- Height: 72px
- Padding: 12px 16px
- Border-bottom: 1px solid #F0F0F0

Left Section:
- Icon: 40px circle (token symbol)
- Primary text: "Transfer" (16px, bold)
- Secondary text: "Nov 24, 2024 at 02:30 AM" (12px, gray)
- Tertiary text: "Sent" (12px, gray)

Right Section:
- Amount: "-20,786.50" (18px, bold)
- Color: Red for negative, green for positive
- Right-aligned
```

### Navigation Tab Item
```
Active State:
- Text: Bold, black
- Bottom border: 3px lime green
- Background: Transparent

Inactive State:
- Text: Regular, gray (#999999)
- No border
- Background: Transparent

Dimensions:
- Height: 44px
- Padding: 12px 16px
- Font-size: 16px
```

---

## Micro-Interactions

### Number Updates
- Duration: 500ms
- Easing: ease-out
- Effect: Count-up animation from previous value

### Card Tap
- Scale: 0.98
- Duration: 150ms
- Easing: ease-in-out
- Haptic: Light impact

### Pull to Refresh
- Threshold: 80px
- Indicator: Lime green spinner
- Bounce: Elastic animation
- Haptic: Medium impact on refresh

### Toggle Switch
- Duration: 200ms
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
- Background color transition
- Haptic: Selection feedback

### Modal Appearance
- Scale: From 0.95 to 1
- Opacity: From 0 to 1
- Duration: 250ms
- Easing: ease-out
- Backdrop: Fade in (150ms)

---

## Error Handling

### Error States
1. **Inline errors**: Below input fields (red text, 12px)
2. **Toast notifications**: Bottom of screen, auto-dismiss (3s)
3. **Alert modals**: For critical errors requiring acknowledgment
4. **Empty states**: Friendly illustration + message + CTA

### Error Message Guidelines
- Be specific: "Insufficient balance" not "Error occurred"
- Be helpful: Include resolution steps
- Be human: Friendly, not technical jargon
- Be brief: Max 2 lines

### Loading States
1. **Skeleton screens**: For content loading
2. **Spinners**: For actions (lime green, 24px)
3. **Progress bars**: For multi-step processes
4. **Shimmer effect**: For card placeholders

---

## Best Practices Applied

### Financial App Specifics
1. **Precision**: Show appropriate decimal places
2. **Confidence**: Bold numbers, clear hierarchy
3. **Security**: Subtle indicators, biometric prompts
4. **Speed**: Cached data, optimistic UI updates
5. **Trust**: Professional appearance, consistent branding

### Mobile-First Principles
1. **Thumb zone**: Critical actions in bottom 2/3 of screen
2. **One-handed use**: Primary actions reachable
3. **Minimal input**: Reduce typing, use selections
4. **Fast loading**: Prioritize critical content
5. **Offline support**: Cache key data

### Visual Design Principles
1. **Consistency**: Reuse components, maintain patterns
2. **Clarity**: Clear labels, obvious affordances
3. **Feedback**: Immediate response to all actions
4. **Efficiency**: Minimize steps to complete tasks
5. **Delight**: Subtle animations, polished details

---

## Conclusion

This design system creates a **modern, professional cryptocurrency trading platform** that balances aesthetics with functionality. The use of a bold color palette (black, white, lime green), clear typography hierarchy, and card-based layouts provides users with an intuitive and confident trading experience.

Key takeaways:
- **High contrast** ensures readability and accessibility
- **Consistent spacing** (8-point grid) creates visual rhythm
- **Bold CTAs** guide users to primary actions
- **Real-time data** visualization builds trust
- **Progressive disclosure** prevents overwhelming users
- **Touch-optimized** for mobile-first experience

Apply these rules consistently across all screens to maintain design coherence and provide users with a predictable, professional experience.