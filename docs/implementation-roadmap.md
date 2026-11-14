# UniDate — Implementation Roadmap

## Phase 1 — Product and visual design
- Confirm product name, audience, launch institutions, and platform.
- Review requirements and open decisions.
- Generate screen concepts in Google Stitch.
- Refine typography, colour, spacing, and components.
- Test key flows with representative adult student users.

**Deliverable:** approved UI kit and screen designs.

## Phase 2 — Technical foundation
- Create frontend project.
- Create Supabase project.
- Configure environments and secrets safely.
- Define database schema and Row Level Security policies.
- Set up navigation, theming, and reusable components.

**Deliverable:** running app shell and secure backend foundation.

## Phase 3 — Authentication and verification
- Implement sign-up/login/recovery.
- Add adult eligibility gate.
- Add institution selection.
- Implement private verification submission and review states.
- Restrict verification data to authorized roles.

**Deliverable:** eligible users can register and submit verification.

## Phase 4 — Profiles and discovery
- Build profile creation and editing.
- Add secure photo storage.
- Implement discovery preferences and filters.
- Implement like/pass actions.
- Add profile visibility controls.

**Deliverable:** verified users can create profiles and discover others.

## Phase 5 — Matching and messaging
- Implement mutual matching.
- Add match list and confirmation.
- Build realtime or refreshed messaging.
- Add block, report, unmatch, and abuse controls.

**Deliverable:** mutual matches can communicate safely.

## Phase 6 — Events and optional premium
- Add campus events and RSVP.
- Validate event publishing permissions.
- Evaluate premium features and payment provider.
- Add subscription management only after pricing and legal review.

**Deliverable:** expanded campus social experience.

## Phase 7 — Quality, safety, and launch
- Security review and access-control tests.
- Accessibility and device testing.
- Moderation workflow testing.
- Privacy policy, terms, and community guidelines.
- Backups, monitoring, incident response, and support process.
- Controlled pilot at selected institutions.

**Deliverable:** launch-ready pilot.

## Suggested initial MVP
Prioritize authentication, adult eligibility, student verification, profile setup, discovery, mutual matching, basic chat, and safety controls. Defer premium subscriptions and advanced features until the core experience is validated.
