# UniDate — Product Requirements

## 1. Product summary
UniDate is a campus-focused dating and social discovery application. It helps adult university students discover other students, express interest, match mutually, chat, and find campus events.

## 2. Goals
- Make it easy for adult students to create a campus profile.
- Establish trust through university-affiliation verification.
- Support consent-based discovery and mutual matching.
- Provide safe messaging and user controls.
- Help students find campus events and social activities.

## 3. Target users
- University students aged 18 or older.
- Students who want to meet people for dating, friendship, or social connection.
- University communities where campus affiliation can be checked.

## 4. Core user journeys
1. Install/open app → onboarding → register or log in.
2. Select university → provide student details → submit verification.
3. Create profile → add photos → choose interests and preferences.
4. Browse profiles → like or pass.
5. Two users like each other → mutual match → chat becomes available.
6. Browse campus events → view details → RSVP.
7. Manage profile, privacy, safety, and account settings.

## 5. Functional requirements

### 5.1 Authentication and account
- Sign up with email or phone, subject to selected authentication provider.
- Login, logout, password reset, and account recovery.
- Enforce an 18+ minimum age for dating accounts.
- Provide account deletion and session management.

### 5.2 University and student verification
- Select institution, faculty, department, and academic level.
- Collect only the minimum information needed to verify eligibility.
- Support private document upload or an institution-approved verification method.
- Show verification states: Not submitted, Pending, Verified, Rejected, Needs resubmission.
- Restrict verification documents to authorized verification workflows.
- Never expose student ID images or document numbers on public profiles.

### 5.3 Profile setup
- Display name, date of birth/age eligibility, university, faculty, department, and level.
- Short biography and interests.
- Profile photos with upload, reorder, and removal.
- Relationship or connection intentions, where appropriate.
- Profile preview before publishing.

### 5.4 Discovery and preferences
- Profile cards with photos, first name/display name, age where permitted, course/level, short bio, and interests.
- Like and pass actions.
- Filters for age range, faculty, academic level, interests, and verification status.
- Respect each user's visibility and discovery preferences.
- Avoid revealing exact location or sensitive personal details.

### 5.5 Matching
- Create a match only after mutual likes.
- Match confirmation screen.
- Allow users to start a conversation after matching.
- Provide unmatch and report actions.

### 5.6 Messaging
- One-to-one chat for matched users.
- Conversation list and unread indicators.
- Message timestamps and delivery state where supported.
- Block, report, and unmatch access from the conversation.
- Rate limits and moderation safeguards against spam and abuse.

### 5.7 Campus events
- Event listing with title, date, time, venue, description, and organizer.
- Event detail screen.
- RSVP and cancellation.
- Clearly label event information as user-submitted or institution-verified where relevant.
- Do not imply an event is officially endorsed without confirmation.

### 5.8 Profile and settings
- Edit profile and photos.
- Privacy and discovery controls.
- Notification preferences.
- Blocked users list.
- Safety centre, report history/status where appropriate.
- Account deletion and data request pathways.

### 5.9 Premium (optional future phase)
- Clearly explain paid features and prices before purchase.
- No deceptive renewal or cancellation flows.
- Keep core safety tools available to all users.
- Premium ideas require validation before implementation: expanded likes, profile visibility insights, and additional daily likes.

## 6. Non-functional requirements
- Responsive layouts and accessible touch targets.
- Clear contrast and scalable text.
- Secure authentication and authorization.
- Private storage for verification documents.
- Row-level security for user-owned data.
- Input validation and abuse prevention.
- Useful loading, empty, error, and success states.
- Backups, monitoring, and a documented incident response process.

## 7. Safety, privacy, and moderation
- Dating accounts must be 18+.
- Age and student eligibility checks must happen before discovery access.
- Block and report controls must be easy to find.
- Provide moderation review and account restriction workflows.
- Collect minimum necessary personal data.
- Keep student documents private and restrict staff access.
- Do not show precise live location.
- Provide clear community rules and consent expectations.
- Do not allow users to bypass blocks through alternate app surfaces.

## 8. MVP scope
**MVP:** onboarding, adult eligibility gate, authentication, university selection, student verification workflow, profile setup, discovery, likes, mutual matches, basic messaging, block/report, and settings.

**Later:** campus events, advanced filters, premium subscriptions, richer moderation tooling, and institution integrations.

## 9. Success measures
- Registration completion rate.
- Verification completion and review time.
- Profile completion rate.
- Discovery-to-like rate.
- Mutual match rate.
- Match-to-first-message rate.
- Report response time.
- Block/report recurrence and safety incident trends.
- Retention, measured without compromising user privacy.

## 10. Open decisions
- Initial launch universities and countries.
- Whether the first release is mobile app, web app, or both.
- Verification method and review staffing.
- Whether phone, email, or both are required.
- Messaging retention and moderation policy.
- Event publishing permissions.
- Premium features, price, billing provider, and launch timing.
