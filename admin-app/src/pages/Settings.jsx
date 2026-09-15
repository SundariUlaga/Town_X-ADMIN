export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Settings</h2>
        <p className="text-sm text-ink-muted">Admin console preferences and environment info</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-slate-500">API URL</dt>
            <dd className="font-medium text-slate-900">{import.meta.env.VITE_API_URL || "http://localhost:8024"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Environment</dt>
            <dd className="font-medium text-slate-900">Development</dd>
          </div>
          <div>
            <dt className="text-slate-500">Notes</dt>
            <dd className="text-slate-700">
              Admin actions are enforced on the backend with JWT + role=admin checks. Use seeded credentials
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">admin@townx.demo</code>
              after running
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">python seed_users.py</code>.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
