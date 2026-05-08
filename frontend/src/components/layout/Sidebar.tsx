const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r p-6 flex flex-col">
      <h1 className="text-xl font-bold text-primary mb-8">TaskFlow</h1>

      <nav className="space-y-3 text-gray-600">
        <div className="bg-purple-100 text-primary px-3 py-2 rounded-xl">Dashboard</div>
        <div>Boards</div>
        <div>Inbox</div>
        <div>Planner</div>
        <div>Activity</div>
        <div>Calendar</div>
        <div>Files</div>
        <div>Settings</div>
      </nav>

      <div className="mt-auto bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-xl">
        <p className="font-semibold">Upgrade to Pro</p>
        <button className="mt-2 bg-white text-primary px-3 py-1 rounded-lg text-sm">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;