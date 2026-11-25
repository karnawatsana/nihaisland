# NIHA ISLAND — Phase 1

Love Island–inspired birthday game show. Next.js 15 · React 19 · TypeScript · Tailwind · Motion.

Routes: `/play` (TV, 16:9) · `/host` (phone remote, PIN) · `/setup` (create room, edit cast & poster) · `/demo` (fictional sandbox, one **LAUNCH DEMO** button).

## Run locally (no accounts needed)
```bash
npm install
npm run dev        # http://localhost:3000 (also reachable on your LAN)
```
Open `/demo` → LAUNCH DEMO. For the real party: `/setup` → create room + PIN, edit cast, upload Niharika's portrait (transparent PNG/WebP is best), then open the TV link on the TV and the QR on the host phone.

Without Supabase, sync runs through the Next server (SSE push + polling). This works across devices on the same network, but state lives in server memory and is lost on restart. **It does not work on Vercel** (serverless instances don't share memory) — use Supabase there.

## Deploy on Vercel + Supabase
1. Create a Supabase project. SQL Editor → run `supabase/schema.sql` (includes the `grant … to service_role` line newer projects need).
2. Project Settings → API: copy the **Project URL**, **anon key**, **service_role key**.
3. Push this repo to GitHub, import it in Vercel, and add env vars (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server only)
   - `ROOM_SECRET` (any long random string; signs host tokens)
4. Deploy. `/setup` shows "Sync backend: Supabase ✓" when configured.

How it works: the table is only reachable server-side (RLS on, no policies). Host commands go to `/api/rooms/:code/command` with a PIN-derived token; the server updates the row and sends a tiny Realtime *broadcast* ping; TVs/phones then re-fetch. A 2.5 s poll is the safety net for reconnects.

## Phase 2 hooks
`src/lib/sequence.ts` is the single ordered list of scenes; `src/components/rounds.tsx` has `GAME_SCREENS` — register a component per round id and the host remote and sync need no changes.

## Notes
- Host PIN cannot be recovered; create a new room if lost. The only public command is the TV's own ENTER THE VILLA button.
- Sound is synthesised in the browser (no audio files/licensing); browsers need one click on the TV page to allow audio.
- Palms, sky, clouds and sea are original generated graphics; no Love Island/Peacock assets are used.
