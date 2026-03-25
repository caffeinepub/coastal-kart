# Coastal Kart

## Current State
The app has a mobile-first layout with a blue primary color, green secondary, aqua accent. The homepage has a hero section and shop cards. Cart page shows items and billing. OrderDetailPage has a WhatsApp-style chat. The index.css uses OKLCH tokens.

## Requested Changes (Diff)

### Add
- Search bar at top of HomePage: "What do you need?"
- Category quick-select grid on HomePage (Vegetables, Fruits, Dairy, Snacks, etc.)
- Prominent "Chat to Order" floating button on HomePage
- Luxurious, premium feel to all screens

### Modify
- index.css: Change primary color from blue to green (OKLCH green ~0.55 0.16 145). Keep white background. Yellow accent for highlights only.
- HomePage: Redesign hero to be clean (no illustrations). Add search bar. Add category tiles. Add nearby shops section. Add "Chat to Order" button.
- CartPage: Premium card design, cleaner layout.
- OrderDetailPage chat: WhatsApp-style clean bubbles, green for sent messages.
- AppHeader: Cleaner, premium look with green branding.
- BottomNav: Add chat icon/tab or make orders tab look like chat.

### Remove
- Poster/illustration style
- Blue primary color

## Implementation Plan
1. Update index.css: green primary, white background, yellow for secondary/highlight
2. Redesign HomePage with search bar, categories grid, shops list, chat-to-order FAB
3. Polish CartPage for premium feel
4. Polish OrderDetailPage chat for WhatsApp-like cleanliness
5. Update AppHeader and BottomNav styling
