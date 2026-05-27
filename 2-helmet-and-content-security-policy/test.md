# Test flows — fs-m18-l2-helmet-and-content-security-policy

> Prerequisites: `npm install && npm run start:dev` (or `nest start --watch`) from the `backend/` directory.
> The `.env` default sets `APP_PORT=3000` and `CSP_REPORT_ONLY=true`.

---

## Flow 0 — Helmet headers present on root route

**Goal:** Verify that Helmet security headers are set on every response.

**Steps:**

```bash
curl -I http://localhost:3000/
```

**Expected response headers (non-exhaustive):**

| Header | Expected value |
|---|---|
| `Content-Security-Policy-Report-Only` | contains `default-src 'self'`, `script-src 'self' 'nonce-<base64>'`, `object-src 'none'`, `report-uri /csp-report` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Powered-By` | **must be absent** |

**Cleanup:** Press `Ctrl+C` to stop the server.

---

## Flow 1 — CSP nonce rotates between requests

**Goal:** Confirm that the nonce value changes on every request (no static nonce).

**Steps:**

```bash
# First request — capture nonce value
NONCE1=$(curl -sI http://localhost:3000/ | grep -i "content-security-policy" | grep -oP "nonce-\K[^']+")
echo "Nonce 1: $NONCE1"

# Second request — capture nonce value
NONCE2=$(curl -sI http://localhost:3000/ | grep -i "content-security-policy" | grep -oP "nonce-\K[^']+")
echo "Nonce 2: $NONCE2"

# Assert they differ
[ "$NONCE1" != "$NONCE2" ] && echo "PASS: nonces differ" || echo "FAIL: nonces are identical"
```

**Expected output:**

```
Nonce 1: <some_base64_value>
Nonce 2: <different_base64_value>
PASS: nonces differ
```

**Cleanup:** Press `Ctrl+C` to stop the server.

---

## Flow 2 — CSP report endpoint returns 204

**Goal:** Confirm that `POST /csp-report` accepts a violation payload and returns 204.

**Steps:**

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/csp-report \
  -H "Content-Type: application/csp-report" \
  -d '{"csp-report":{"document-uri":"http://localhost:3000/demo","violated-directive":"script-src-elem","blocked-uri":"inline"}}'
```

**Expected output:**

```
204
```

**Expected server log (warn level):**

```
[CspReportController] {"documentUri":"http://localhost:3000/demo","violatedDirective":"script-src-elem","blockedUri":"inline","userAgent":"curl/..."}
```

**Cleanup:** Press `Ctrl+C` to stop the server.
