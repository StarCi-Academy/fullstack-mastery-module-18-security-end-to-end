# Test Plan — 1-throttler-rate-limit-brute-force

## Prerequisites

- Docker Desktop running
- Redis container up: `docker compose -f .docker/compose.yaml up -d`
- Backend running: `cd backend && npm install && npm run start:dev`
- Base URL: `http://localhost:3000/api/v1`

---

## Flow 1 — Normal request returns 200

**Goal:** Verify `GET /products` returns HTTP 200 with a JSON product list for a fresh request.

```bash
# macOS / Linux
curl -s -w "\nHTTP %{http_code}" http://localhost:3000/api/v1/products

# Windows (PowerShell)
(Invoke-WebRequest -Uri http://localhost:3000/api/v1/products -SkipHttpErrorCheck).StatusCode
```

Response phải trả về (HTTP code): `200`

```json
[
  { "id": 1, "name": "Product A", "price": 99.99 },
  { "id": 2, "name": "Product B", "price": 49.99 },
  { "id": 3, "name": "Product C", "price": 199.99 }
]
```

---

## Flow 2 — Rate limit exceeded returns 429

**Goal:** Verify `GET /products` returns HTTP 429 with a `Retry-After` header after the `short` throttler limit (10 req / 10 s) is exceeded.

```bash
# macOS / Linux — send 11 requests, observe status codes
for i in $(seq 1 11); do
  curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/api/v1/products
done

# Windows (PowerShell)
1..11 | ForEach-Object {
  (Invoke-WebRequest -Uri http://localhost:3000/api/v1/products -SkipHttpErrorCheck).StatusCode
}
```

*Expected output:* `200 200 200 200 200 200 200 200 200 200 429`

```bash
# Inspect 429 headers
curl -i http://localhost:3000/api/v1/products
```

Response phải trả về (HTTP code): `429`

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

Header `Retry-After` phải có giá trị dương (số giây cần chờ).

---

## Flow 3 — Composite ip:email tracker key isolates per-account throttle

**Goal:** Verify that the `auth` throttler (5 req / 60 s) on `POST /auth/login` tracks per `ip:email` — throttling `a@demo.com` does NOT affect `b@demo.com` from the same IP.

**Step 3.1 — Exhaust throttle for `a@demo.com`:**

```bash
# macOS / Linux — send 6 requests for a@demo.com
for i in $(seq 1 6); do
  curl -o /dev/null -s -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"a@demo.com","password":"wrong"}'
done
```

*Expected output:* `401 401 401 401 401 429`
(first 5 return 401 Unauthorized — credentials wrong but not throttled; 6th returns 429)

**Step 3.2 — Verify `b@demo.com` is NOT throttled:**

```bash
curl -s -w "\nHTTP %{http_code}" \
  -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@demo.com","password":"wrong"}'
```

Response phải trả về (HTTP code): `401` (NOT 429 — different email, separate tracker key)

**Step 3.3 — Verify correct login works:**

```bash
curl -s -w "\nHTTP %{http_code}" \
  -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"password123"}'
```

Response phải trả về (HTTP code): `201`

```json
{ "accessToken": "demo-jwt-token-for-admin@demo.com" }
```

---

## Redis verification

After running the flows, verify counter storage in Redis:

```bash
# List all throttle keys
redis-cli KEYS "*"

# Check TTL on a throttle key
redis-cli TTL <key>

# Monitor Redis commands in real-time
redis-cli MONITOR
```

---

## Cleanup

```bash
# Stop Redis container
docker compose -f .docker/compose.yaml down

# Stop NestJS (Ctrl+C in the terminal running nest start --watch)
```
