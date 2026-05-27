# Test flows — fs-m18-l3-secrets-management-vault

## Prerequisites

```bash
# Start Vault dev server
docker compose -f .docker/compose.yaml up -d

# Seed AppRole + KV secret (copy output into backend/.env)
bash .docker/vault-init.sh

# Install dependencies and start app
cd backend && npm install && npm run start:dev
```

---

## Flow 1 — Happy path: AppRole login + fingerprint endpoint

**Goal:** verify that `DB_PASSWORD` is loaded from Vault before the server starts and the fingerprint endpoint returns a deterministic SHA-256 prefix.

### Steps

```bash
# 1. Confirm app started (log: "Vault authenticated via AppRole")

# 2. Call fingerprint endpoint
curl -s http://localhost:3000/debug/db-pass-fingerprint | jq .
```

### Expected response

```json
{
  "fingerprint": "<first 16 hex chars of sha256('super-secret-db-pass-2026')>",
  "loadedAt": "<ISO timestamp>"
}
```

### Verification

- `fingerprint` is deterministic: running `echo -n 'super-secret-db-pass-2026' | sha256sum | cut -c1-16` locally must produce the same value.
- `fingerprint` does NOT equal the raw password string.
- Server logs do NOT contain `super-secret-db-pass-2026`.

---

## Flow 2 — Graceful degradation: Vault down during runtime refresh

**Goal:** verify that stopping Vault mid-run does not crash the app; the fingerprint endpoint continues to serve from the cached secret.

### Steps

```bash
# 1. Trigger a manual refresh while Vault is UP — should succeed
curl -s -X POST http://localhost:3000/debug/refresh | jq .
# Expected: { "ok": true }

# 2. Stop Vault container
docker stop vault

# 3. Trigger a manual refresh while Vault is DOWN — should degrade gracefully
curl -s -X POST http://localhost:3000/debug/refresh | jq .
# Expected: { "ok": false, "error": "..." }

# 4. Fingerprint endpoint must still return HTTP 200 with the cached fingerprint
curl -s http://localhost:3000/debug/db-pass-fingerprint | jq .
# Expected: same fingerprint as before — app is still alive

# 5. Check terminal log — must contain "vault.refresh.failed", NOT an uncaught exception stack trace

# 6. Restart Vault and verify recovery
docker start vault
# Wait ~10s for Vault to be ready, then:
curl -s -X POST http://localhost:3000/debug/refresh | jq .
# Expected: { "ok": true }
```

### Verification

- App process stays alive throughout steps 2–5.
- Terminal log line `vault.refresh.failed` is present (warn level), not an unhandled rejection.
- After Vault recovers (step 6), refresh succeeds and fingerprint reflects any updated secrets.
