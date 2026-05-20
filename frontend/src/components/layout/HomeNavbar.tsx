import { useNavigate } from "react-router-dom";

const HomeNavbar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="text-xl font-bold text-slate-900 cursor-pointer" onClick={() => navigate("/")}>
          TaskFlow
        </div>

        <nav className="flex flex-1 items-center justify-center gap-6 text-sm text-slate-600">
          {[
            { label: "Features", href: "#features" },
            { label: "Solutions", href: "#solutions" },
            { label: "Pricing", href: "#pricing" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                const anchor = document.querySelector(item.href);
                if (anchor) {
                  anchor.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="transition hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-white/80 backdrop-blur-md border border-gray-200 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
