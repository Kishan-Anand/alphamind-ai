import AccountProfile from "@/components/AccountProfile";
import DashboardNavigation from "@/components/DashboardNavigation";

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-black text-white md:flex-row">
      <DashboardNavigation activePage="settings" />
      <section className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

        <div>
          <h1 className="text-3xl font-bold sm:text-4xl xl:text-5xl">
            Settings
          </h1>

          <p className="text-zinc-400 mt-2">
            Manage your AI trading preferences
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 xl:mt-10 xl:grid-cols-2 xl:gap-6">
          <AccountProfile />
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