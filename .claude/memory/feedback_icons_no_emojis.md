---
name: No emojis — use SVG icons
description: User explicitly prefers SVG icons over emoji in all UI elements
type: feedback
---

Use SVG icons everywhere in the UI. Never use emoji as interface elements (stars, flames, check marks, bookmarks, arrows, etc.).

**Why:** User preference — emojis feel informal and inconsistent across platforms.

**How to apply:** All buttons, badges, status indicators, and decorative marks should use SVG icon components (src/components/Icons.jsx). Emoji are banned from component output entirely.
