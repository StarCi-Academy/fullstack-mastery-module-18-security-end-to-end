// (EN: Vault AppRole loader — authenticates to Vault and fetches DB_PASSWORD before server start)
// (VI: Vault AppRole loader — xác thực với Vault và fetch DB_PASSWORD trước khi server start)
import vaultLib from "node-vault"

// (EN: shape of secrets returned from Vault)
// (VI: kiểu dữ liệu secrets trả về từ Vault)
export interface VaultSecrets {
    DB_PASSWORD: string
    VAULT_TOKEN_TTL: number
}

// (EN: singleton Vault client instance shared across the application)
// (VI: instance Vault client dùng chung trong toàn ứng dụng)
let vaultClient: ReturnType<typeof vaultLib> | null = null

export function getVaultClient(): ReturnType<typeof vaultLib> {
    // (EN: throw if called before vaultLoader initializes the client)
    // (VI: throw nếu gọi trước khi vaultLoader khởi tạo client)
    if (!vaultClient) {
        throw new Error("Vault client not initialized — call vaultLoader() first")
    }
    return vaultClient
}

// (EN: performs AppRole login, reads DB_PASSWORD from KV v2, returns secrets map)
// (VI: thực hiện AppRole login, đọc DB_PASSWORD từ KV v2, trả về map secrets)
export async function vaultLoader(): Promise<VaultSecrets> {
    const endpoint = process.env.VAULT_ADDR ?? "http://localhost:8200"
    const roleId = process.env.VAULT_ROLE_ID
    const secretId = process.env.VAULT_SECRET_ID

    if (!roleId || !secretId) {
        // (EN: fail-fast — bootstrap requires Vault credentials in env)
        // (VI: fail-fast — bootstrap yêu cầu Vault credentials trong env)
        throw new Error("VAULT_ROLE_ID and VAULT_SECRET_ID must be set in environment")
    }

    // (EN: create Vault client — no token yet, login via AppRole)
    // (VI: tạo Vault client — chưa có token, đăng nhập qua AppRole)
    const client = vaultLib({ endpoint })

    // (EN: AppRole login — receive client_token and lease_duration (token TTL in seconds))
    // (VI: AppRole login — nhận client_token và lease_duration (token TTL tính bằng giây))
    const login = await client.approleLogin({ role_id: roleId, secret_id: secretId })
    client.token = login.auth.client_token as string

    // (EN: read DB_PASSWORD from KV v2 path secret/data/db)
    // (VI: đọc DB_PASSWORD từ KV v2 path secret/data/db)
    const db = await client.read("secret/data/db")

    // (EN: KV v2 nests data under .data.data — not .data directly)
    // (VI: KV v2 lồng data trong .data.data — không phải .data trực tiếp)
    const password = (db.data as { data: { password: string } }).data.password
    const ttl = (login.auth as { lease_duration: number }).lease_duration

    // (EN: store client singleton for use by VaultRefreshService)
    // (VI: lưu client singleton để VaultRefreshService dùng)
    vaultClient = client

    return { DB_PASSWORD: password, VAULT_TOKEN_TTL: ttl }
}
