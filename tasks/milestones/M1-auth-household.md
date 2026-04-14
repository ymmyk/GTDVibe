# M1 — Auth + Household

**Goal:** Two users can sign up and land in the same household via invite.

**Exit criterion:** Two browser profiles logged in as `alex@demo.com` and `sam@demo.com`, both see each other in Settings → Household. Seeded via `just seed`.

## Tasks

### Schema (`packages/convex/schema.ts`)
- [ ] `households` table: `name`, `created_at`
- [ ] `users` table: `tokenIdentifier` (from Convex Auth), `household_id`, `email`, `display_name`, `avatar_url`
- [ ] `household_invites` table: `household_id`, `email`, `token`, `expires_at`, `created_by`
- [ ] Indexes: `users.by_household`, `users.by_token_identifier`, `invites.by_token`

### Shared types (`packages/shared/src/types.ts`)
- [ ] Zod schema for `User`, `Household`, `Invite`
- [ ] TS types exported

### Convex Auth
- [ ] Install `@convex-dev/auth` with email/password provider
- [ ] `auth.config.ts` + `convex/auth.ts`
- [ ] On first sign-up: create a household + user atomically if no invite token, else consume invite

### Mutations
- [ ] `createHousehold(name)` — called on first sign-up without invite
- [ ] `inviteMember(email)` — generates token, stores invite, returns invite URL
- [ ] `acceptInvite(token)` — validates, attaches new user to household
- [ ] `updateProfile(display_name, avatar_url?)`
- [ ] `updateHousehold(name)`

### Queries
- [ ] `currentUser()` — returns user row or null
- [ ] `currentHousehold()` — with member list
- [ ] `inviteByToken(token)` — for accept flow preview

### UI (`apps/web/app/`)
- [ ] `/login` — email/password form, link to sign-up
- [ ] `/signup` — supports optional `?invite=TOKEN` query param
- [ ] `/invite/[token]` — preview household name, accept button
- [ ] `/settings` — household name (editable), member list (read-only), "Invite member" button with copyable link
- [ ] Auth-gated layout: unauthed → `/login`; authed → routes available
- [ ] Logout button in header

### Seed script (`packages/convex/seed.ts`)
- [ ] `just seed` runs `npx convex run seed:seedDemo`
- [ ] Creates household "The Demo Family"
- [ ] Creates `alex@demo.com` / `password` and `sam@demo.com` / `password` in same household
- [ ] Idempotent (safe to re-run)

### Tests
- [ ] Vitest: invite flow — generate, accept, attaches to correct household
- [ ] Vitest: cannot accept expired or consumed invite
- [ ] Vitest: sign-up without invite creates new household
- [ ] Vitest: `updateHousehold` only allowed for members

## Verification
- `just seed` creates both demo users
- Browser 1 signs in as Alex, Browser 2 as Sam
- Both see both members in `/settings`
- Invite flow: invite `test@demo.com` → open invite URL in incognito → sign up → lands in same household

## Out of scope
- Passkeys (v2)
- Email delivery (invite URL is copy-paste only)
- Removing members
- Role / permission differentiation (both are equal members)
- Password reset flow (v2)
