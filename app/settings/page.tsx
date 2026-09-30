import Link from "next/link";
import AccountProfile from "@/components/AccountProfile";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}

      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 hidden md:flex flex-col">

        <h1 className="text-3xl font-bold text-green-400">
          AlphaMind
        </h1>

        <nav className="mt-12 space-y-4">

          <Link
            href="/dashboard"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            Dashboard
          </Link>

          <Link
            href="/screener"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            Stock Screener
          </Link>

          <Link
            href="/predictions"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            AI Predictions
          </Link>

          <Link
            href="/settings"
            className="bg-green-500/20 text-green-400 px-4 py-3 rounded-2xl block"
          >
            Settings
          </Link>

        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <section className="flex-1 p-8">

        <div>
          <h1 className="text-5xl font-bold">
            Settings
          </h1>

          <p className="text-zinc-400 mt-2">
            Manage your AI trading preferences
          </p>
        </div>

        {/* SETTINGS CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

          {/* PROFILE */}

          <AccountProfile />

          {/* AI SETTINGS */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              AI Preferences
            </h2>

            <div className="mt-6 space-y-6">

              <div className="flex items-center justify-between">

                <p>
                  Auto Buy Signals
                </p>

                <div className="w-14 h-8 bg-green-500 rounded-full flex items-center px-1">
                  <div className="w-6 h-6 bg-white rounded-full ml-auto"></div>
                </div>

              </div>

              <div className="flex items-center justify-between">

                <p>
                  Risk Alerts
                </p>

                <div className="w-14 h-8 bg-green-500 rounded-full flex items-center px-1">
                  <div className="w-6 h-6 bg-white rounded-full ml-auto"></div>
                </div>

              </div>

              <div className="flex items-center justify-between">

                <p>
                  Dark AI Theme
                </p>

                <div className="w-14 h-8 bg-green-500 rounded-full flex items-center px-1">
                  <div className="w-6 h-6 bg-white rounded-full ml-auto"></div>
                </div>

              </div>

            </div>

          </div>

          {/* SECURITY */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              Security
            </h2>

            <div className="mt-6 space-y-4">

              <button className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl py-3 transition">
                Change Password
              </button>

              <button className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-2xl py-3 transition">
                Enable 2FA
              </button>

            </div>

          </div>

          {/* SUBSCRIPTION */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <h2 className="text-2xl font-bold">
              Subscription
            </h2>

            <div className="mt-6">

              <p className="text-zinc-400">
                Current Plan
              </p>

              <h3 className="text-4xl font-bold text-green-400 mt-2">
                PRO AI
              </h3>

              <button className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-2xl font-bold transition">
                Upgrade Plan
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}