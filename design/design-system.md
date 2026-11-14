# UniDate — Design System

## 1. Design principles
1. **Warm and welcoming:** use soft blush backgrounds and approachable language.
2. **Clear and calm:** keep layouts uncluttered and actions obvious.
3. **Trustworthy:** make verification, privacy, and safety states clear.
4. **Consistent:** reuse the same spacing, typography, buttons, cards, and input patterns.
5. **Accessible:** maintain readable contrast, clear labels, and comfortable touch targets.

## 2. Brand
- Product name: UniDate
- Tagline: Meet. Connect. Belong.
- Personality: modern, romantic, friendly, campus-oriented, and privacy-conscious.

## 3. Colour palette

| Token | Hex | Intended use |
|---|---|---|
| `color.primary` | `#970D19` | Primary actions, active navigation, key headings |
| `color.primaryDeep` | `#650914` | Pressed states, deep emphasis |
| `color.accent` | `#EF202B` | Hearts, highlights, selected states |
| `color.pink` | `#FAD4D6` | Soft accents and selected backgrounds |
| `color.background` | `#FFF3F3` | Main app background |
| `color.surface` | `#FFFFFF` | Cards, sheets, input surfaces |
| `color.textPrimary` | `#202024` | Main text |
| `color.textSecondary` | `#77777F` | Supporting text |
| `color.border` | `#E8DCDD` | Dividers and outlines |
| `color.success` | `#218653` | Verified/success states |
| `color.warning` | `#A96713` | Pending/attention states |
| `color.error` | `#B42318` | Errors and destructive actions |

Use semantic status colours with text or icons. Never rely on colour alone to communicate status.

## 4. Typography
- Heading family: Poppins.
- Body family: Inter.
- H1: 28 px / 36 px, Bold.
- H2: 22 px / 30 px, SemiBold.
- H3: 18 px / 26 px, SemiBold.
- Body: 15–16 px / 24 px, Regular.
- Supporting: 13–14 px / 20 px, Regular.
- Caption: 11–12 px / 16 px, Medium.
- Button: 15–16 px / 20 px, SemiBold.

## 5. Spacing and layout
Use a 4 px base unit.

| Token | Value |
|---|---:|
| `space.1` | 4 px |
| `space.2` | 8 px |
| `space.3` | 12 px |
| `space.4` | 16 px |
| `space.5` | 20 px |
| `space.6` | 24 px |
| `space.8` | 32 px |
| `space.10` | 40 px |
| Screen horizontal padding | 20 px |
| Standard section gap | 24 px |

Use a 390 px wide mobile frame as the initial design reference. Adapt layouts for smaller and larger screens.

## 6. Shape, borders, and elevation
- Small control radius: 8 px.
- Input radius: 12 px.
- Button radius: 14 px.
- Card radius: 16 px.
- Large sheet/modal radius: 24 px.
- Standard border: 1 px `#E8DCDD`.
- Shadows: subtle and soft. Avoid heavy elevation or excessive glow.

## 7. Buttons
### Primary
- Burgundy background `#970D19`.
- White label.
- Minimum height 52 px.
- Radius 14 px.
- Disabled state uses reduced contrast and disabled interaction.

### Secondary
- White or transparent background.
- 1 px burgundy border.
- Burgundy label.

### Destructive
- Use error red and explicit action wording.
- Confirm irreversible actions such as account deletion.

### Icon button
- Minimum 44 × 44 px touch target.
- Include an accessible label.

## 8. Inputs
- White surface.
- 1 px neutral border.
- 12 px radius.
- Minimum height 48 px.
- Visible label above the field.
- Placeholder text must not replace the label.
- Include helper, error, focus, disabled, and success states.

## 9. Cards
- White surface on blush background.
- 16 px radius.
- 16 px internal padding.
- Subtle border or shadow.
- Profile cards prioritize photography, name, age eligibility, course/level, short bio, and interests.

## 10. Chips and badges
- Interest chips: soft neutral/pink background.
- Selected chips: pale pink background with burgundy text.
- Verification badge: green or approved brand-safe status treatment plus a text label.
- Pending and rejected states must include explanatory text.

## 11. Navigation
Use a five-item bottom navigation:
- Discover
- Likes
- Chats
- Events
- Profile

Show a clear active state. Keep labels visible. Respect device safe areas.

## 12. Iconography
Use Lucide icons with consistent stroke weight. Suggested icons:
- Discover: `compass`
- Likes: `heart`
- Chats: `message-circle`
- Events: `calendar-days`
- Profile: `user-round`
- Safety: `shield-check`
- Settings: `settings`
- Filters: `sliders-horizontal`
- Report: `flag`
- Block: `ban`

## 13. Photography and imagery
- Use authentic, consented profile images.
- Use consistent image crops and rounded corners.
- Provide placeholders when a photo is absent.
- Avoid using generated or stock people as real user profiles.
- Do not use profile photos as verification evidence.

## 14. Motion
- Use short, subtle transitions for navigation and selection.
- Use restrained feedback for like/pass and match events.
- Respect reduced-motion preferences.
- Never use motion as the only way to communicate an important state.

## 15. Accessibility
- Aim for WCAG AA contrast for text.
- Maintain minimum 44 × 44 px interactive targets.
- Support dynamic text sizing.
- Provide screen-reader labels and logical focus order.
- Pair status colours with text/icons.
- Ensure form errors identify the affected field and explain how to fix it.

## 16. Design QA checklist
- [ ] Correct palette and typography.
- [ ] Consistent spacing and corner radii.
- [ ] All buttons have default, pressed, and disabled states.
- [ ] Inputs have focus, error, and helper states.
- [ ] Loading, empty, error, and success states exist.
- [ ] Bottom navigation works on every primary screen.
- [ ] Text and controls remain usable on small screens.
- [ ] Privacy and safety actions are easy to locate.
