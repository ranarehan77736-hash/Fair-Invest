# HorizonInvest API Contract

Base URL: `/api`
Authentication: `Authorization: Bearer <accessToken>`
Standard response:

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

## Health

- `GET /health`
- `GET /site-links`
- `GET /payment-accounts`

## Auth

- `POST /auth/register`
  - body: `{ name, email, phone?, password, referralCode? }`
- `POST /auth/login`
  - body: `{ email, password }`
- `POST /auth/refresh`
  - body: `{ refreshToken }`
- `POST /auth/logout`
  - body: `{ refreshToken }`

## User / Settings / Security

- `GET /users/me`
- `PATCH /users/me`
  - body: `{ name, email, phone?, country? }`
- `POST /users/change-password`
  - body: `{ currentPassword, newPassword }`
- `PATCH /users/two-factor`
  - body: `{ enabled: boolean }`
- `POST /users/two-factor/verify`
  - body: `{ code }` (placeholder local verification)
- `PATCH /users/notifications`
  - body: `{ emailNotifications, smsNotifications, investmentUpdates, referralActivity }`

## Investments / Plans

- `GET /investments/plans`
- `GET /investments/mine`
- `POST /investments/invest`
  - body: `{ planId, amount }`

## Wallet / Deposits / Withdrawals / Transactions

- `GET /wallet/balance`
- `GET /wallet/transactions`
- `GET /wallet/deposits`
- `GET /wallet/withdrawals`
- `POST /wallet/deposit`
  - body: `{ amount, method }`
  - method: `card | bank_transfer | easypaisa`
  - creates pending request; admin confirms completion
- `POST /wallet/withdraw`
  - body: `{ amount, method, accountDetails? }`
  - method: `bank_transfer | easypaisa`

## Referrals / Earnings

- `GET /referrals/overview`
- `GET /referrals/tree`
- `GET /referrals/earnings`
- `GET /referrals/commission-structure`

## Notifications

- `GET /notifications/mine`
- `PATCH /notifications/:id/read`

## Admin

Requires role `admin`.

- `GET /admin/metrics`
- `GET /admin/users`
- `PATCH /admin/users/:id/block`
- `PATCH /admin/users/:id/unblock`
- `GET /admin/transactions`
- `PATCH /admin/transactions/:id/status`
- `GET /admin/plans`
- `POST /admin/plans`
- `PATCH /admin/plans/:id`
- `DELETE /admin/plans/:id`
- `GET /admin/social-links`
- `POST /admin/social-links`
- `PATCH /admin/social-links/:id`
- `DELETE /admin/social-links/:id`
- `GET /admin/payment-accounts`
- `POST /admin/payment-accounts`
- `PATCH /admin/payment-accounts/:id`
- `DELETE /admin/payment-accounts/:id`
- `GET /admin/deposits`
- `PATCH /admin/deposits/:id/status`
- `GET /admin/withdrawals`
- `PATCH /admin/withdrawals/:id/status`

## Chat REST + Socket.IO

REST:
- `POST /chat/room`
- `GET /chat/rooms/mine`
- `GET /chat/:roomKey/messages`
- `POST /chat/message`
- `GET /chat/admin/rooms` (admin)
- `PATCH /chat/admin/rooms/:id/close` (admin)

Socket events:
- Client -> `chat:join` `{ roomKey }`
- Client -> `chat:message` `{ roomKey, content }`
- Server -> `chat:new-message` `{ id, content, senderRole, senderId, createdAt }`
