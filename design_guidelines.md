# Code Snippet Manager - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Linear, Raycast, Arc Browser, and GitHub's modern interfaces. This developer-focused application prioritizes clean aesthetics, purposeful interactions, and visual hierarchy that enhances productivity.

## Core Design Principles
- **Developer-First**: Clean, distraction-free interface optimizing for code readability
- **Intelligent Hierarchy**: Clear visual separation between navigation, content, and actions
- **Purposeful Motion**: Subtle animations that provide feedback without distraction
- **Consistent Patterns**: Unified component behavior across all interactions

## Color Palette

### Dark Theme (Primary)
- **Background**: 0 0% 4%
- **Card Background**: 0 0% 7%
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 240 5% 65%
- **Primary Brand**: 142 76% 36% (GitHub-inspired green)
- **Border**: 240 4% 16%
- **Input Background**: 240 4% 16%

### Light Theme
- **Background**: 0 0% 100%
- **Card Background**: 0 0% 98%
- **Text Primary**: 0 0% 9%
- **Text Secondary**: 240 5% 45%
- **Border**: 220 13% 91%

### Accent Colors
- **Success**: 142 76% 36%
- **Warning**: 38 92% 50%
- **Destructive**: 0 84% 60%
- **Language Badges**: Distinct colors per programming language (JavaScript: 247 83% 57%, Python: 217 91% 60%, etc.)

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Code Font**: Fira Code or Monaco
- **Headings**: 
  - H1: text-2xl font-semibold (Dashboard titles)
  - H2: text-xl font-medium (Section headers)
  - H3: text-lg font-medium (Card titles)
- **Body**: text-sm for primary content, text-xs for metadata
- **Code**: Monaco Editor's built-in typography system

## Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 8, 12, 16 units (corresponding to 8px, 16px, 32px, 48px, 64px)
- **Sidebar**: Fixed 240px width (w-60)
- **Content Area**: Flexible with max-width constraints
- **Card Spacing**: p-6 for content, gap-4 for grids
- **Component Spacing**: mb-8 for major sections, mb-4 for related elements

## Component Library

### Navigation
- **Sidebar**: Fixed left panel with subtle background (bg-card), rounded navigation items with hover states
- **Header**: Clean bar with centered search, right-aligned actions
- **Breadcrumbs**: Subtle text with separators for deep navigation

### Content Cards
- **Snippet Cards**: Clean borders, subtle shadows, hover elevation effect
- **Collection Cards**: Similar treatment with color-coded left borders
- **Stat Cards**: Minimal with large numbers, supporting text in muted colors

### Interactive Elements
- **Buttons**: 
  - Primary: Filled with brand color
  - Secondary: Ghost style with hover backgrounds
  - Destructive: Red variants for delete actions
- **Input Fields**: Subtle borders, focus rings matching brand color
- **Monaco Editor**: Full theme integration matching overall color scheme

### Data Display
- **Code Blocks**: Monaco Editor with line numbers, syntax highlighting
- **Tags**: Small pills with language-appropriate colors
- **Language Badges**: Colored indicators with language names
- **Search Results**: Highlighted matching terms

### Overlays
- **Modals**: Centered with backdrop blur, clean borders
- **Dropdowns**: Subtle shadows, clean borders, hover states
- **Tooltips**: Minimal dark overlays with white text

## Specific UI Patterns

### Dashboard Layout
- **Three-column layout**: Sidebar (240px) + Main content (flexible) + Optional right panel
- **Grid system**: 2-3 column responsive grid for snippet cards
- **Quick actions**: Prominent "New Snippet" CTA in header

### Search Interface
- **Prominent search bar**: Full-width with subtle borders and cmd+k hint
- **Filter sidebar**: Collapsible panel with checkbox groups and counters
- **Results layout**: Clean list with syntax-highlighted previews

### Code Editor
- **Full-screen modal**: Monaco Editor with integrated toolbar
- **Metadata panel**: Clean form fields for title, description, tags
- **Action bar**: Save/cancel buttons with autosave indicators

## Animations
- **Hover Effects**: Subtle scale (scale-105) and shadow changes
- **Page Transitions**: Smooth opacity and slight translate effects
- **Loading States**: Skeleton screens matching content structure
- **Success Feedback**: Toast notifications with slide-in animations

## Responsive Behavior
- **Mobile**: Collapsible sidebar, stack layout for cards
- **Tablet**: Two-column card grid, persistent sidebar
- **Desktop**: Full three-column layout with all panels visible

This design system creates a professional, developer-focused interface that balances functionality with visual appeal, ensuring the complex feature set remains approachable and efficient to use.