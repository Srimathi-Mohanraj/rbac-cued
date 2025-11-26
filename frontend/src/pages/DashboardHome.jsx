export default function DashboardHome({ user }) {
  const name = user?.name || (user && user.username) || 'Admin';
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">RBAC Demo</h1>
        <p className="text-sm text-slate-500">Welcome back, <strong>{name}</strong></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-slate-500">Today Orders</h3>
          <div className="text-2xl font-bold mt-2">$1,173.94</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-slate-500">This Month</h3>
          <div className="text-2xl font-bold mt-2">$27,968.95</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-slate-500">All-Time Sales</h3>
          <div className="text-2xl font-bold mt-2">$1,123,414.78</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-sm text-slate-500">This is your dashboard home. Replace this component with your full dashboard content when ready.</p>
      </div>
    </div>
  );
}
