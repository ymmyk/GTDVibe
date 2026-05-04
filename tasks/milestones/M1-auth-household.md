# M1 — Auth + Household (Humans + Agents)

**Goal:** Two users can sign up and land in the same household via invite. Agent identity and capability-token model land in the schema and seed data, so M2+ mutations can record `actor_kind` from day one.

**Exit criterion:**
1. Two browser profiles logged in as `alex@demo.com` and `sam@demo.com`, both see each other in Settings → Household.
2. `just seed` provisions `alex-claude` agent identity tied to Alex with a capability token, plus a `sam-claude` for Sam, both written to a gitignored `.secrets/agent-tokens.json`.
3. Settings → Agents lists each user's agents and their `revoked_at` status.

## Tasks

### Schema (`packages/convex/schema.ts`)
- [ ] `households` table: `name`, `created_at`
- [ ] `users` table: `tokenIdentifier` (from Convex Auth), `household_id`, `email`, `display_name`, `avatar_url`
- [ ] `household_invites` table: `household_id`, `email`, `token`, `expires_at`, `created_by`
- [ ] `agents` table: `household_id`, `principal_user_id`, `display_name`, `kind` (`claude` | `openhands` | `custom`), `created_at`, `revoked_at?`
- [ ] `agent_tokens` table: `agent_id`, `token_hash` (sha256 of opaque secret), `allowed_tools` (string[]), `expires_at?`, `created_at`, `last_used_at?`, `revoked_at?`
- [ ] Indexes: `users.by_household`, `users.by_token_identifier`, `invites.by_token`, `agents.by_household`, `agents.by_principal`, `agent_tokens.by_token_hash`, `agent_tokens.by_agent`

### Shared types (`packages/shared/src/types.ts`)
- [ ] Zod schema for `User`, `Household`, `Invite`, `Agent`, `AgentToken`
- [ ] `ActorKind = 'human' | 'agent'`, `Actor = { kind, id, displayName }` — used by every mutation in M2+
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
- [ ] `createAgent({ display_name, kind })` — bound to current user; rejects cross-household
- [ ] `issueAgentToken({ agent_id, allowed_tools, expires_at? })` — returns the **plaintext token exactly once**, stores only `token_hash`
- [ ] `revokeAgent(id)` / `revokeAgentToken(id)` — sets `revoked_at`; tokens are checked at every MCP call
- [ ] Internal helper `resolveAgentToken(plaintext): { agent, allowed_tools } | null` — used by the MCP server's auth middleware (M4.5 wires it up; the helper exists here so it's testable in isolation)

### Queries
- [ ] `currentUser()` — returns user row or null
- [ ] `currentHousehold()` — with member list
- [ ] `inviteByToken(token)` — for accept flow preview
- [ ] `myAgents()` — current user's agents + their non-revoked tokens (without plaintext)

### UI (`apps/web/app/`)
- [ ] `/login` — email/password form, link to sign-up
- [ ] `/signup` — supports optional `?invite=TOKEN` query param
- [ ] `/invite/[token]` — preview household name, accept button
- [ ] `/settings` — household name (editable), member list (read-only), "Invite member" button with copyable link
- [ ] `/settings/agents` — list current user's agents (name, kind, allowed tools, last used, revoke button); "Create agent" form; "Issue token" reveals plaintext **once** with copy button + warning
- [ ] Auth-gated layout: unauthed → `/login`; authed → routes available
- [ ] Logout button in header

### Seed script (`packages/convex/seed.ts`)
- [ ] `just seed` runs `npx convex run seed:seedDemo`
- [ ] Creates household "The Demo Family"
- [ ] Creates `alex@demo.com` / `password` and `sam@demo.com` / `password` in same household
- [ ] Creates agent `alex-claude` (kind=`claude`, principal=Alex) with a token allowing the M4.5 read+log tool set; same for `sam-claude`
- [ ] Writes plaintext tokens to gitignored `.secrets/agent-tokens.json` so the dev/MCP loop can pick them up
- [ ] Idempotent (safe to re-run); rotates tokens only when `--rotate` flag is passed

### Tests
- [ ] Vitest: invite flow — generate, accept, attaches to correct household
- [ ] Vitest: cannot accept expired or consumed invite
- [ ] Vitest: sign-up without invite creates new household
- [ ] Vitest: `updateHousehold` only allowed for members
- [ ] Vitest: `createAgent` rejects when caller not in household
- [ ] Vitest: `issueAgentToken` — plaintext returned once, only `token_hash` stored, `resolveAgentToken` returns the agent for valid plaintext
- [ ] Vitest: revoked tokens fail `resolveAgentToken` even if hash matches
- [ ] Vitest: expired tokens fail `resolveAgentToken`

## Verification
- `just seed` creates both demo users **and** both demo agents with tokens written to `.secrets/agent-tokens.json`
- Browser 1 signs in as Alex, Browser 2 as Sam
- Both see both members in `/settings`
- Each user's `/settings/agents` shows their own agent
- Invite flow: invite `test@demo.com` → open invite URL in incognito → sign up → lands in same household

## Out of scope
- Passkeys (v2)
- Email delivery (invite URL is copy-paste only)
- Removing members
- Role / permission differentiation (both are equal members)
- Password reset flow (v2)
- MCP server actually consuming tokens (M4.5)
- OAuth-style agent flows (v2 — opaque tokens are fine for two-user household)
