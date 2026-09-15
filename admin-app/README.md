# Town-X Admin Console

Separate admin frontend for Town-X. Runs on **http://localhost:5190**.

## Setup

```powershell
cd Town_X-ADMIN/admin-app
copy .env.example .env
npm install
npm run dev
```

Ensure the backend is running on `http://localhost:8024`.

## Admin login (local dev)

After seeding backend users:

```powershell
cd Town_X-BE
python seed_users.py
```

| Field | Value |
|-------|-------|
| Email | `admin@townx.demo` |
| Password | `Admin@123` |

## Architecture

- **One backend** (`Town_X-BE` :8024) — shared SQLite DB
- **User app** (`Town_X-FE/my-app` :5188)
- **Admin app** (this project :5190)

Admin APIs live under `/api/admin/*` and require JWT + `role=admin`.

## Key routes

- `/login`
- `/dashboard`
- `/advertisements/*`
- `/properties/*`
- `/users/*`
- `/settings`
