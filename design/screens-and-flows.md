# UniDate — Screens and User Flows

## A. First launch and account access
1. Splash screen — logo and brand background.
2. Onboarding — explain campus discovery, verified community, and safety.
3. Welcome — sign up or log in.
4. Sign up — email/phone and password, subject to final auth decision.
5. Login — existing account access.
6. Password recovery — reset flow.

## B. Eligibility and student verification
7. Adult eligibility — confirm the user meets the 18+ requirement before dating features.
8. University selection — institution and campus.
9. Student information — faculty, department, academic level, and required student identifier.
10. Verification upload — private document upload or approved alternative.
11. Selfie/liveness step — only if justified, consented to, and supported by a privacy review.
12. Verification status — pending, approved, rejected, or resubmission required.

## C. Profile creation
13. Add photos — upload, reorder, remove, choose primary photo.
14. About you — display name, biography, and profile details.
15. Interests — selectable interest chips.
16. Preferences — age range, connection intention, faculty/level filters.
17. Profile preview — review before publishing.

## D. Main application
18. Discover — profile cards and like/pass actions.
19. Filters — age range, faculty, level, interests, and verified-only setting.
20. Likes — incoming likes, subject to product privacy rules.
21. Match celebration — mutual match confirmation.
22. Matches — list of current matches.
23. Chat list — conversations and unread states.
24. Chat detail — message thread, report, block, and unmatch controls.
25. Campus events — event list.
26. Event detail — information, organizer, venue, RSVP.

## E. Account and safety
27. Profile — profile summary and account actions.
28. Edit profile — update details and photos.
29. Privacy and safety — discovery visibility, messaging preferences, blocked users.
30. Settings — notifications, account, help, legal.
31. Report flow — choose reason, add details, submit.
32. Block confirmation — explain the effect before confirming.
33. Account deletion — clear consequences and confirmation.

## F. Optional premium
34. Premium overview — feature list and clear price.
35. Checkout — payment provider integration after commercial decisions.
36. Subscription management — renewal, cancellation, and receipts.

## Primary navigation
Discover | Likes | Chats | Events | Profile

## Core matching flow
Discover profile → Like → wait for reciprocal like → Match created → match confirmation → open chat.

A one-sided like must not create a match or grant access to private conversations.

## Verification flow
Create account → confirm adult eligibility → select institution → submit minimum required student details → submit verification evidence → pending status → authorized review → verified or resubmission/rejection.

Do not expose verification evidence in profile, search, or chat screens.

## Key screen states
Every data-driven screen should include:
- Loading.
- First-use empty state.
- No-results state.
- Error with retry.
- Success/confirmation.
- Offline or connection-lost state where relevant.
