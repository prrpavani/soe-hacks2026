"use client";

import { useState } from "react";
import Link from "next/link";

function toPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function toDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const metricCards = [
  { id: "total", title: "Total submissions" },
  { id: "yes", title: "Yes to sharing" },
  { id: "no", title: "Not sharing" },
  { id: "depends", title: "Depends" },
];

const barClasses = {
  Yes: "bg-gradient-to-r from-emerald-500 to-teal-400",
  No: "bg-gradient-to-r from-rose-500 to-red-400",
  Depends: "bg-gradient-to-r from-amber-500 to-orange-400",
};

const metricColor = {
  total: "from-amber-100 to-orange-100 border-amber-300",
  yes: "from-emerald-100 to-teal-100 border-emerald-300",
  no: "from-rose-100 to-red-100 border-rose-300",
  depends: "from-violet-100 to-fuchsia-100 border-violet-300",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [unlocked, setUnlocked] = useState(false);

  const total = submissions.length;
  const yesCount = submissions.filter((item) => item.openSeat === "Yes").length;
  const noCount = submissions.filter((item) => item.openSeat === "No").length;
  const dependsCount = submissions.filter((item) => item.openSeat === "Depends").length;

  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const weeklyTrend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    return {
      key: toDayKey(day),
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
      yes: 0,
      no: 0,
      depends: 0,
    };
  });

  const trendMap = Object.fromEntries(weeklyTrend.map((day) => [day.key, day]));

  submissions.forEach((submission) => {
    const date = new Date(submission.createdAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = toDayKey(date);
    const bucket = trendMap[key];
    if (!bucket) {
      return;
    }

    bucket.count += 1;
    if (submission.openSeat === "Yes") {
      bucket.yes += 1;
    } else if (submission.openSeat === "No") {
      bucket.no += 1;
    } else {
      bucket.depends += 1;
    }
  });

  const weeklyMax = Math.max(...weeklyTrend.map((day) => day.count), 1);

  const trendCoordinates = weeklyTrend.map((entry, index) => {
    const x = (index / (weeklyTrend.length - 1 || 1)) * 100;
    const y = 92 - (entry.count / weeklyMax) * 76;
    return [x, y];
  });

  const trendLine = trendCoordinates.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const trendFill = `M ${trendCoordinates.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} L 100 92 L 0 92 Z`;

  const metrics = {
    total,
    yes: yesCount,
    no: noCount,
    depends: dependsCount,
  };

  async function loadDashboard(nextPassword = password) {
    const response = await fetch(`/api/submissions?password=${encodeURIComponent(nextPassword)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load data.");
    }

    setSubmissions(Array.isArray(payload.submissions) ? payload.submissions : []);
    setError("");
  }

  async function handleUnlock(event) {
    event.preventDefault();
    try {
      await loadDashboard(password);
      setUnlocked(true);
    } catch (e) {
      setError(e.message || "Access denied.");
      setUnlocked(false);
    }
  }

  async function handleRefresh() {
    try {
      await loadDashboard(password);
    } catch (e) {
      setError(e.message || "Failed to refresh.");
    }
  }

  async function handleClear() {
    const shouldClear = window.confirm("Clear all entries from submissions.json?");
    if (!shouldClear) {
      return;
    }

    const response = await fetch(
      `/api/submissions?password=${encodeURIComponent(password)}`,
      {
        method: "DELETE",
      },
    );
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to clear data.");
      return;
    }

    await handleRefresh();
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#1f2e53] px-6 py-14 text-zinc-900">
      <div
        className="pointer-events-none absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/low-poly-bg.svg')" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(250,247,239,0.82)_0%,rgba(250,247,239,0.7)_45%,rgba(250,247,239,0.6)_100%)]" />
      <div className="absolute left-[-230px] top-[-120px] h-[24rem] w-[24rem] rounded-full bg-white/14 blur-[145px]" />
      <div className="absolute right-[-220px] bottom-[-120px] h-[22rem] w-[22rem] rounded-full bg-rose-200/16 blur-[150px]" />

      <section className="relative mx-auto w-full max-w-6xl">
        <div className="rounded-3xl border border-zinc-300/80 bg-white/80 p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_22px_60px_rgba(17,24,39,0.15)] backdrop-blur-xl animate-[fade-up_0.8s_ease-out]">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-zinc-900 via-rose-800 to-amber-700 bg-clip-text text-transparent">
                  Talley seat-sharing stats
                </span>
              </h1>
            </div>
            <Link
              href="/"
              className="mt-4 inline-flex w-fit rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-wide text-zinc-700 transition hover:border-rose-400 hover:text-rose-700 md:mt-0"
            >
              Back to form
            </Link>
          </div>

          {!unlocked ? (
            <form className="mt-8 grid w-full gap-4" onSubmit={handleUnlock}>
              <label className="grid gap-2 text-sm text-zinc-700">
                Password
                <input
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                />
              </label>
              <button className="w-fit rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 px-6 py-2 text-sm font-medium text-white transition hover:scale-[1.02]" type="submit">
                Unlock dashboard
              </button>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((metric) => {
                  const value = metrics[metric.id];
                  return (
                    <article
                      key={metric.id}
                      className={`rounded-2xl border ${metricColor[metric.id]} bg-gradient-to-br p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]`}
                    >
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">{metric.title}</p>
                      <p className="mt-2 text-4xl font-semibold text-zinc-900">{value}</p>
                    </article>
                  );
                })}
              </div>

              <article className="rounded-2xl border border-zinc-300 bg-zinc-50/80 p-4">
                <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-zinc-600">Open seat breakdown</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Yes", yesCount],
                    ["No", noCount],
                    ["Depends", dependsCount],
                  ].map(([label, value]) => {
                    const pct = toPercent(value, total);
                    return (
                      <div key={label} className="grid gap-3" style={{ gridTemplateColumns: "80px 1fr 76px" }}>
                        <span className="text-zinc-700">{label}</span>
                        <div className="overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${barClasses[label]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-right text-zinc-700">{value} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl border border-zinc-300 bg-zinc-50/80 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-zinc-600">Seven-day response trend</h2>
                  <span className="text-xs text-zinc-500">{toPercent(weeklyTrend.reduce((sum, day) => sum + day.count, 0), total)}% of total from last 7 days</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Each bar mixes yes/no/depends sentiment.
                </p>

                <div className="mt-4">
                  <svg aria-label="Weekly response trend" className="h-40 w-full rounded-xl bg-white/85 p-3" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(251,146,60,0.45)" />
                      <stop offset="100%" stopColor="rgba(251,146,60,0.08)" />
                    </linearGradient>
                    <path d={trendFill} fill="url(#trendFill)" stroke="none" />
                    <polyline
                      fill="none"
                      stroke="url(#trendStroke)"
                      strokeWidth="3"
                      points={trendLine}
                    />
                    <defs>
                      <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#e11d48" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mt-4 space-y-2">
                  {weeklyTrend.map((day) => (
                    <div key={day.key} className="grid gap-2" style={{ gridTemplateColumns: "72px 1fr 76px" }}>
                      <div className="text-xs text-zinc-600">
                        <p>{day.label}</p>
                        <p>{day.date}</p>
                      </div>
                      <div className="overflow-hidden rounded-full bg-zinc-200">
                        <div
                          className="flex h-3"
                          style={{ width: `${toPercent(day.count, weeklyMax)}%` }}
                        >
                          <span
                            className="h-3 bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: day.count ? `${(day.yes / day.count) * 100}%` : "0%" }}
                          />
                          <span
                            className="h-3 bg-gradient-to-r from-rose-500 to-red-400"
                            style={{ width: day.count ? `${(day.no / day.count) * 100}%` : "0%" }}
                          />
                          <span
                            className="h-3 bg-gradient-to-r from-amber-500 to-orange-400"
                            style={{ width: day.count ? `${((day.depends / day.count) * 100)}%` : "0%" }}
                          />
                        </div>
                      </div>
                      <p className="text-right text-xs text-zinc-600">{day.count}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-zinc-300 bg-zinc-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-zinc-600">Recent responses</h2>
                  <span className="text-xs text-zinc-500">Sorted by newest first</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-300 text-zinc-600">
                        <th className="pb-2 text-left font-medium">Time</th>
                        <th className="pb-2 text-left font-medium">Name</th>
                        <th className="pb-2 text-left font-medium">Email</th>
                        <th className="pb-2 text-left font-medium">Open seat</th>
                        <th className="pb-2 text-left font-medium">Fun fact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSubmissions.map((item) => (
                        <tr key={item.id} className="border-b border-zinc-200">
                          <td className="py-3 align-top text-zinc-700">{new Date(item.createdAt).toLocaleString()}</td>
                          <td className="py-3 align-top text-zinc-700">{item.name}</td>
                          <td className="py-3 align-top text-zinc-700">{item.email}</td>
                          <td className="py-3 align-top text-zinc-700">{item.openSeat}</td>
                          <td className="py-3 align-top text-zinc-700">{item.funFact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-2 text-sm font-medium text-white transition hover:scale-[1.02]"
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
                <button
                  className="rounded-full border border-rose-500/60 bg-rose-50 px-6 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  onClick={handleClear}
                >
                  Clear all
                </button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
