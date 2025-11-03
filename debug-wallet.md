# Debug Wallet Connection Issue

## Triệu chứng
- Lỗi "Failed to connect wallet" khi kết nối ví từ frontend
- Backend trả về "Invalid signature" (401)

## Các nguyên nhân có thể

### 1. Signature Verification Đang Thất Bại

**Kiểm tra:**
- Xem backend logs khi connect (tôi đã thêm detailed logging)
- Xem browser console logs (tôi đã thêm logging ở frontend)

**Logs cần chú ý trong backend terminal:**
```
[Wallet] Connect request received
[Wallet] Request body: {...}
[Crypto] Verifying signature for: <wallet-address>
[Crypto] Signature bytes length: 64  (phải là 64)
[Crypto] Public key bytes length: 32 (phải là 32)
[Crypto] Signature valid: false    (đây là vấn đề nếu false)
```

### 2. Wallet Adapter Không Sign Đúng Format

**Triệu chứng:**
- Signature bytes length không phải 64
- Public key bytes length không phải 32

**Giải pháp:** Kiểm tra xem wallet có support `signMessage` không

### 3. Message Format Không Đúng

**Kiểm tra:** So sánh message được sign với message được verify
- Frontend log: `[Connect] Message: ...`
- Backend log: `[Crypto] Message: ...`

Chúng phải giống HOÀN TOÀN (bao gồm cả timestamp)

### 4. Ví Chưa Được Cấu Hình Đúng

**Checklist:**
- [ ] Wallet đã switch sang Devnet chưa?
- [ ] Wallet có SOL trong Devnet không?
- [ ] Wallet có support signMessage không? (Phantom & Solflare đều support)

## Cách Debug

### Step 1: Kiểm tra Backend Logs
Mở terminal GMI-BE và xem logs khi bạn connect wallet

### Step 2: Kiểm tra Browser Console
Mở DevTools → Console tab và xem logs:
- `[Connect] Wallet address`
- `[Connect] Message`
- `[Connect] Signature`
- `[Connect] API Response`

### Step 3: So sánh Message
Message từ frontend và backend PHẢI GIỐNG NHAU byte-by-byte

### Step 4: Kiểm tra Network Tab
1. Mở DevTools → Network tab
2. Filter: `wallet`
3. Khi connect, tìm request `POST /api/wallet/connect`
4. Kiểm tra:
   - Request Headers: có `x-access-code: GMI2025`?
   - Request Payload: có đầy đủ address, type, signature, message?
   - Response: status code là gì? (401 = Invalid signature)

## Giải pháp tạm thời: Skip signature verification (CHỈ ĐỂ TEST)

Nếu bạn muốn test các chức năng khác mà chưa fix được signature, có thể tạm thời comment out verification:

⚠️ **LƯU Ý: CHỈ dùng cho local testing, KHÔNG deploy lên production!**

## Khắc phục

Sau khi xác định được vấn đề từ logs, có thể cần:

1. **Fix signature format** nếu byte lengths không đúng
2. **Fix message encoding** nếu messages không match
3. **Update wallet adapter** nếu wallet không support signMessage
4. **Check database** nếu có lỗi database connection

## Test với CURL

Để test backend độc lập (không qua frontend):

```bash
# Tạo một test signature (sẽ fail nhưng giúp test backend)
curl -X POST http://localhost:3001/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "x-access-code: GMI2025" \
  -d '{
    "address": "test",
    "type": "phantom",
    "signature": "test",
    "message": "test"
  }'

# Expected: {"error":"Invalid signature"}
# Nếu trả về {"error":"Access denied"} → access code không đúng
# Nếu trả về {"error":"Missing required fields"} → thiếu fields
```
