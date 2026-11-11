import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const FRESH_STYLE = {
  Fresh: "bg-green-100 text-green-800 border-green-200",
  "Use soon": "bg-amber-100 text-amber-800 border-amber-200",
  Expired: "bg-red-100 text-red-800 border-red-200",
};

export default function ConsumerPage() {
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public endpoint — no auth header needed.
    fetch(`/api/public/trace/${batchId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch(() => setError("This batch could not be found."))
      .finally(() => setLoading(false));
  }, [batchId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-5 text-center">
          <div className="text-4xl">🥚</div>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Egg<span className="text-brand-500">Trace</span></h1>
          <p className="text-xs text-slate-500">Scan-to-trace · farm to table</p>
        </div>

        {loading && <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">Loading…</div>}
        {error && <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">{error}</div>}

        {data && (
          <div className="space-y-4">
            {data.recall?.active && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 font-bold text-red-700">⚠️ Product recall</div>
                <p className="mt-1 text-sm text-red-700">{data.recall.reason}</p>
                <p className="mt-1 text-xs text-red-600">Please do not consume. Contact your retailer.</p>
              </div>
            )}

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Batch</div>
                  <div className="font-mono text-sm font-semibold text-slate-800">{data.batchId}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${FRESH_STYLE[data.freshness.label] || ""}`}>
                  {data.freshness.label}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-400">Farm</dt><dd className="font-medium text-slate-800">{data.farm?.name}</dd></div>
                <div><dt className="text-slate-400">Origin</dt><dd className="font-medium text-slate-800">{data.farm?.location || "—"}</dd></div>
                <div><dt className="text-slate-400">Lay date</dt><dd className="font-medium text-slate-800">{new Date(data.layDate).toLocaleDateString()}</dd></div>
                <div><dt className="text-slate-400">Quality grade</dt><dd className="font-medium text-slate-800">{data.grade ? `Grade ${data.grade}` : "Not graded"}</dd></div>
              </dl>

              {data.freshness.label !== "Expired" && data.freshness.daysRemaining >= 0 && (
                <p className="mt-3 text-xs text-slate-500">Estimated {data.freshness.daysRemaining} day(s) of freshness remaining (laid {data.freshness.daysOld} day(s) ago).</p>
              )}
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Journey</h2>
              <ol className="relative border-l-2 border-brand-200 pl-5">
                {data.journey.map((j, i) => (
                  <li key={i} className="mb-4 last:mb-0">
                    <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-brand-400" />
                    <div className="text-sm font-semibold text-slate-800">{j.stage}</div>
                    {j.location && <div className="text-xs text-slate-500">{j.location}</div>}
                    <div className="text-xs text-slate-400">{new Date(j.date).toLocaleDateString()}</div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="pb-6 text-center text-xs text-slate-400">Verified by EggTrace AI · No personal data shown</p>
          </div>
        )}
      </div>
    </div>
  );
}
