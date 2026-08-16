# Design Guidelines: Pet Skills Learning App

## Design Approach

**Reference-Based Design** inspired by successful learning platforms (Duolingo, Headspace) combined with pet-centric warmth and playfulness. This app balances utility (structured learning) with emotional engagement (pet care passion).

**Core Principles:**
- Warm, encouraging, non-intimidating learning environment
- Clear progress visualization to maintain motivation
- Playful pet-themed elements without childishness
- Instant feedback and celebration of small wins

## Color Palette

**Light Mode:**
- Primary: 25 85% 55% (warm coral/orange - energetic, pet-friendly)
- Secondary: 200 70% 45% (soft teal - calming, trustworthy)
- Success: 142 70% 45% (fresh green for achievements)
- Background: 40 15% 97% (warm off-white)
- Surface: 0 0% 100% (pure white cards)
- Text Primary: 220 15% 20% (soft black)
- Text Secondary: 220 10% 45% (warm gray)

**Dark Mode:**
- Primary: 25 80% 60% (slightly lighter coral)
- Secondary: 200 60% 55% (lifted teal)
- Success: 142 60% 50% (brighter green)
- Background: 220 15% 12% (deep navy-gray)
- Surface: 220 12% 16% (elevated cards)
- Text Primary: 40 10% 95% (warm white)
- Text Secondary: 220 8% 65% (mid-gray)

**Accent Colors:**
- Warning: 45 90% 55% (golden yellow for streaks/achievements)

## Typography

**Fonts:**
- Display/Headers: 'Nunito' (700, 800) - friendly, rounded, approachable
- Body/UI: 'Inter' (400, 500, 600) - clean, highly legible

**Scale:**
- Hero: text-5xl md:text-6xl (bold)
- Section Headers: text-3xl md:text-4xl (bold)
- Card Titles: text-xl md:text-2xl (semibold)
- Lesson Content: text-lg (regular)
- Body: text-base (regular)
- Small/Meta: text-sm (medium)

## Layout System

**Spacing Units:** Consistent use of 4, 6, 8, 12, 16, 20, 24 (e.g., p-4, gap-6, mb-8, py-12, space-y-16, py-20, my-24)

**Container Strategy:**
- Max-width: max-w-6xl for main content
- Lesson interface: max-w-3xl (focused reading width)
- Cards: Comfortable padding (p-6 to p-8)

**Grid Layouts:**
- Lesson cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Progress stats: grid-cols-2 md:grid-cols-4
- Mobile-first: Always stack to single column on small screens

## Component Library

### Navigation
- Sticky top navigation with app logo, current streak counter, and profile
- Bottom tab bar (mobile): Today's Lesson, Progress, Library, Profile
- Subtle shadow for depth: shadow-sm

### Hero Section (Landing)
- Split layout: Left side with headline/CTA, right side with hero image
- Headline emphasizes "5 minutes daily" and pet care angle
- Primary CTA: "Start Learning Today" (large, prominent)
- Trust indicators: "Join 50,000+ pet parents" with small avatars

### Lesson Cards
- Rounded corners: rounded-xl
- Hover lift effect: hover:shadow-lg transition
- Status indicator: Locked (gray), Available (primary color), Completed (success green with checkmark)
- Card contents: Icon, title, duration "5 min", difficulty badge
- Visual progress bar at bottom showing completion

### Progress Dashboard
- Daily streak counter with flame icon (prominent)
- Circular progress indicator for weekly goal
- Stats grid: Total lessons, Current streak, Hours learned, Skills mastered
- Achievement badges (unlocked/locked states)
- Graph showing learning consistency over time

### Lesson Interface
- Clean, distraction-free: centered content on neutral background
- Progress bar at top (shows position in lesson)
- Content cards with ample padding and line-height
- Large, clear "Continue" or "Check Answer" buttons
- Celebration animations on completion (confetti, success message)

### Forms & Inputs
- Rounded inputs: rounded-lg
- Focus states with primary color ring
- Proper dark mode support for all input fields
- Clear labels and helper text

### Modals & Overlays
- Blur backdrop: backdrop-blur-sm
- Smooth entry/exit animations
- Clear close buttons
- Used for: lesson completion celebration, achievement unlocks, settings

## Animations

**Minimal, Purposeful Animations:**
- Lesson completion: Brief confetti or success icon animation
- Streak milestone: Small celebratory burst
- Card hover: Subtle lift (translate-y-1)
- Progress bars: Smooth fill transitions
- All transitions: 200-300ms duration

**NO** constant motion or distracting effects

## Images

### Hero Image (Landing Page)
- Happy pet owner with their dog/cat in training/learning scenario
- Warm, authentic photography (not stock-looking)
- Position: Right side of split hero layout
- Style: Slightly rounded corners, subtle shadow

### Lesson Category Icons
- Custom illustrated icons for each skill category (Training, Nutrition, Health, Grooming, Behavior)
- Colorful, consistent style
- Size: 48x48px to 64x64px

### Achievement Badges
- Illustrated badge designs for milestones
- Locked state: Grayscale with subtle glow
- Unlocked state: Full color with subtle shine effect

### Empty States
- Friendly illustrations for: No lessons started, No achievements yet, Sync pending
- Simple, encouraging tone

## Key Screens

**Landing Page:**
- Hero with split layout (text left, image right)
- "How It Works" - 3-column grid with icons
- Sample lesson preview card
- Testimonials from pet owners (2-column)
- Pricing/signup CTA section
- Footer with quick links

**Dashboard (Logged In):**
- Welcome message with user's pet name
- Today's lesson card (prominent, elevated)
- Streak counter and progress stats
- Continue learning section
- Recently completed lessons

**Lesson Screen:**
- Minimal chrome, focused content
- Progress bar
- Content with images/illustrations where helpful
- Clear interaction points (tap to reveal, select answer, etc.)
- Bottom action button

**Profile/Settings:**
- User avatar and name
- Pet profile(s) with photos
- Stats overview
- Preferences (notifications, reminder time)
- Sync status indicator

## Accessibility & Sync Indicators

- Sync status badge in navigation (cloud icon with check/sync animation)
- Offline mode indicator when not connected
- High contrast mode support
- All interactive elements minimum 44x44px touch target
- Consistent focus indicators throughout

## Overall Visual Identity

Warm, encouraging, modern learning platform that celebrates the joy of pet ownership while delivering structured, bite-sized education. Balance professionalism with playfulness—sophisticated enough for serious pet care learning, friendly enough for daily motivation.