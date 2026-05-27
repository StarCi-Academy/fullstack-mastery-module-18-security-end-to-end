#!/usr/bin/env bash
# (EN: vault-init.sh — idempotent script to enable AppRole auth and seed KV secret)
# (VI: vault-init.sh — script idempotent để enable AppRole auth và seed KV secret)
set -euo pipefail

VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-dev-root-token}"

export VAULT_ADDR
export VAULT_TOKEN

echo "[vault-init] Waiting for Vault to be ready..."
until vault status > /dev/null 2>&1; do
  sleep 1
done
echo "[vault-init] Vault is ready."

# (EN: enable KV v2 secrets engine at path 'secret' — idempotent, ignore error if already enabled)
# (VI: enable KV v2 secrets engine tại path 'secret' — idempotent, bỏ qua lỗi nếu đã enable)
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "[vault-init] KV v2 already enabled."

# (EN: seed DB_PASSWORD secret at path secret/data/db)
# (VI: seed DB_PASSWORD secret tại path secret/data/db)
vault kv put secret/db password=super-secret-db-pass-2026
echo "[vault-init] Seeded secret/db."

# (EN: enable AppRole auth method — idempotent)
# (VI: enable AppRole auth method — idempotent)
vault auth enable approle 2>/dev/null || echo "[vault-init] AppRole already enabled."

# (EN: write policy that grants read access to secret/data/*)
# (VI: write policy cấp quyền đọc secret/data/*)
vault policy write app-policy - <<'EOF'
path "secret/data/*" {
  capabilities = ["read"]
}
EOF
echo "[vault-init] Policy app-policy written."

# (EN: create AppRole with 1h token TTL — idempotent)
# (VI: tạo AppRole với token TTL 1h — idempotent)
vault write auth/approle/role/app-role \
  token_policies="app-policy" \
  token_ttl=1h \
  token_max_ttl=4h
echo "[vault-init] AppRole app-role configured."

# (EN: print role_id and generate secret_id — store these in backend/.env)
# (VI: in role_id và tạo secret_id — lưu vào backend/.env)
ROLE_ID=$(vault read -field=role_id auth/approle/role/app-role/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/app-role/secret-id)

echo ""
echo "========================================="
echo "[vault-init] Copy these into backend/.env"
echo "========================================="
echo "VAULT_ROLE_ID=${ROLE_ID}"
echo "VAULT_SECRET_ID=${SECRET_ID}"
echo "========================================="
