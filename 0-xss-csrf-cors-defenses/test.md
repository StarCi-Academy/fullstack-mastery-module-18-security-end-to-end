# Test flows — 0-xss-csrf-cors-defenses

## Prerequisites

```bash
cd backend
npm install
npm run start:dev
```

Server starts on `http://localhost:3000`.

---

## Flow 1 — CORS rejection on unknown origin

Verify that a request from an origin not in the allowlist is blocked.

```bash
# Expect: no Access-Control-Allow-Origin header, connection refused by CORS
curl -s -o /dev/null -w "%{http_code}" \
  -H "Origin: https://evil.com" \
  -X OPTIONS http://localhost:3000/orders \
  -H "Access-Control-Request-Method: POST"
```

Expected result: `403` or response without `Access-Control-Allow-Origin`.

```bash
# Contrast: allowed origin receives the header
curl -s -o /dev/null -w "%{http_code}" \
  -H "Origin: http://localhost:3001" \
  -X OPTIONS http://localhost:3000/orders \
  -H "Access-Control-Request-Method: POST"
```

Expected result: `204` with `Access-Control-Allow-Origin: http://localhost:3001` in the response headers.

---

## Flow 2 — CSRF token required for mutation

Verify that POST /orders returns 403 without a valid CSRF token, and 201 with one.

```bash
# Step 1: obtain csrf-token via GET /csrf-token
curl -c /tmp/cookies.txt -s http://localhost:3000/csrf-token
# Expected: {"csrfToken":"<hex-string>"}

# Step 2: read token from the cookie jar
TOKEN=$(grep csrf-token /tmp/cookies.txt | awk '{print $7}')
echo "Token: $TOKEN"

# Step 3: POST without X-CSRF-Token header — expect 403
curl -b /tmp/cookies.txt \
  -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -X POST http://localhost:3000/orders \
  -d '{"comment":"test"}'
# Expected: 403

# Step 4: POST with correct X-CSRF-Token header — expect 201
curl -b /tmp/cookies.txt \
  -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -H "X-CSRF-Token: $TOKEN" \
  -X POST http://localhost:3000/orders \
  -d '{"comment":"<script>alert(1)</script>"}'
# Expected: 201 with encoded comment (no raw <script> tag in JSON response)
```

---

## Flow 3 — XSS output encoding via xss package

Verify that a stored comment containing an XSS payload is sanitized before being returned.

```bash
# Step 1: obtain fresh CSRF token
curl -c /tmp/cookies2.txt -s http://localhost:3000/csrf-token
TOKEN=$(grep csrf-token /tmp/cookies2.txt | awk '{print $7}')

# Step 2: POST a comment with XSS payload
curl -b /tmp/cookies2.txt \
  -s -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -H "X-CSRF-Token: $TOKEN" \
  -X POST http://localhost:3000/orders \
  -d '{"comment":"<img src=x onerror=alert(1)>"}'

# Step 3: GET all orders — verify the comment is sanitized
curl -s http://localhost:3000/orders
# Expected: comment field does NOT contain onerror= attribute
# The xss package strips dangerous attributes while preserving safe HTML structure
```
