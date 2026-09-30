export default function AIScanner() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mt-8 overflow-hidden">

      <h2 className="text-2xl font-bold text-green-400 mb-6">
        AI Market Scanner
      </h2>

      <div className="space-y-4 font-mono text-sm">

        <div className="text-green-400 animate-pulse">
          Scanning NVDA momentum...
        </div>

        <div className="text-blue-400 animate-pulse">
          Detecting institutional inflow...
        </div>

        <div className="text-yellow-400 animate-pulse">
          Parsing market sentiment...
        </div>

        <div className="text-red-400 animate-pulse">
          Risk analysis in progress...
        </div>

      </div>

    </div>
  );
}