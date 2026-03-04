"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  funFact: "",
  openSeat: "",
  connectionDifficulty: "",
  accessToNewPeople: "",
};

const seatOptions = ["Yes", "No", "Depends"];
const connectionOptions = ["Very Difficult", "Difficult", "N/A", "Easy", "Very Easy"];

const optionStyle = {
  Yes: "border-emerald-300/80 bg-emerald-200/20 text-emerald-900",
  No: "border-rose-300/80 bg-rose-200/20 text-rose-900",
  Depends: "border-amber-300/80 bg-amber-200/20 text-amber-900",
  "Very Difficult": "border-rose-400/80 bg-rose-200/20 text-rose-900",
  Difficult: "border-amber-400/80 bg-amber-200/20 text-amber-900",
  "N/A": "border-zinc-300/80 bg-zinc-200/20 text-zinc-900",
  Easy: "border-emerald-300/80 bg-emerald-200/20 text-emerald-900",
  "Very Easy": "border-teal-300/80 bg-teal-200/20 text-teal-900",
};

const optionHover = {
  Yes: "hover:border-emerald-400/80",
  No: "hover:border-rose-400/80",
  Depends: "hover:border-amber-400/80",
  "Very Difficult": "hover:border-rose-500/80",
  Difficult: "hover:border-amber-500/80",
  "N/A": "hover:border-zinc-400/80",
  Easy: "hover:border-emerald-400/80",
  "Very Easy": "hover:border-teal-400/80",
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  function launchConfetti() {
    const pieces = Array.from({ length: 80 }, () => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        left: `${Math.random() * 100}%`,
        width: `${6 + Math.random() * 8}px`,
        delay: `${Math.random() * 0.4}s`,
        duration: `${1.3 + Math.random() * 1}s`,
        drift: `${direction * (80 + Math.random() * 140)}px`,
        rotate: `${Math.random() * 360}deg`,
      };
    });

    setConfettiPieces(pieces);
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setConfettiPieces([]);
    }, 2400);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to save response.");
      }

      setForm(initialForm);
      setIsError(false);
      setStatus("Thanks for your response");
      launchConfetti();
    } catch (error) {
      setIsError(true);
      setStatus(error.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <main className="relative isolate min-h-screen overflow-hidden bg-[#1f2e53] text-zinc-900">
      <div
        className="pointer-events-none absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/low-poly-bg.svg')" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(250,247,239,0.94)_0%,rgba(250,247,239,0.84)_40%,rgba(250,247,239,0.74)_100%)]" />
      <div className="absolute left-[-230px] top-[-130px] h-[22rem] w-[22rem] rounded-full bg-white/16 blur-[150px]" />
      <div className="absolute right-[-220px] bottom-[-140px] h-[22rem] w-[22rem] rounded-full bg-rose-200/18 blur-[160px]" />

      <section className="relative mx-auto flex min-h-screen max-w-[90rem] items-center px-6 py-6 lg:px-12">
        <div className="grid w-full gap-5 rounded-3xl border border-zinc-300/80 bg-white/95 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_70px_rgba(17,24,39,0.2)] backdrop-blur-xl md:p-10">
          {celebrating ? (
            <div className="pointer-events-none absolute inset-0 z-30">
              <div className="relative h-full w-full overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-semibold text-emerald-700">
                  Thanks for your response
                </p>
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className="confetti-piece absolute rounded-full bg-emerald-500/90"
                    style={{
                      left: piece.left,
                      width: piece.width,
                      height: piece.width,
                      animationDelay: piece.delay,
                      animationDuration: piece.duration,
                      "--x-drift": piece.drift,
                      transform: `rotate(${piece.rotate})`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-zinc-300 bg-white/98 p-7 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] md:p-9 animate-[fade-up_0.9s_ease-out]">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-lg text-zinc-800">
                Name
                <input
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-lg text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  name="name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="grid gap-2 text-lg text-zinc-800">
                Email
                <input
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-lg text-zinc-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  name="email"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="grid gap-2 text-lg text-zinc-800">
                Fun fact
                <textarea
                  className="min-h-28 w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-lg text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={form.funFact}
                  onChange={(event) => setForm((prev) => ({ ...prev, funFact: event.target.value }))}
                  name="fun_fact"
                  required
                />
              </label>

              <fieldset className="rounded-md border border-zinc-300/90 px-4 py-3">
                <legend className="px-1 text-base text-zinc-700">
                  How difficult do you find it to make new friends or meaningful connections outside of the people you already know?
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connectionOptions.map((option) => (
                    <label
                      key={option}
                      className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        form.connectionDifficulty === option
                          ? optionStyle[option]
                          : `border-zinc-300 text-base text-zinc-800 ${optionHover[option]}`
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        required
                        name="connectionDifficulty"
                        value={option}
                        checked={form.connectionDifficulty === option}
                        onChange={(event) => setForm((prev) => ({ ...prev, connectionDifficulty: event.target.value }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-md border border-zinc-300/90 px-4 py-3">
                <legend className="px-1 text-base text-zinc-700">
                  Have you ever wanted to meet new people but felt like there weren’t easy ways or places to do it?
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connectionOptions.map((option) => (
                    <label
                      key={option}
                      className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        form.accessToNewPeople === option
                          ? optionStyle[option]
                          : `border-zinc-300 text-base text-zinc-800 ${optionHover[option]}`
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        required
                        name="accessToNewPeople"
                        value={option}
                        checked={form.accessToNewPeople === option}
                        onChange={(event) => setForm((prev) => ({ ...prev, accessToNewPeople: event.target.value }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-md border border-zinc-300/90 px-4 py-3">
                <legend className="px-1 text-base text-zinc-700">
                  If you are sitting in Talley and have an open seat, would you be open to sharing it with someone?
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {seatOptions.map((option) => (
                    <label
                      key={option}
                      className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        form.openSeat === option
                          ? optionStyle[option]
                          : `border-zinc-300 text-lg text-zinc-800 ${optionHover[option]}`
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        required
                        name="openSeat"
                        value={option}
                        checked={form.openSeat === option}
                        onChange={(event) => setForm((prev) => ({ ...prev, openSeat: event.target.value }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                className="mt-1 w-fit rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 px-6 py-2.5 text-base font-semibold text-white transition hover:scale-[1.02] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Submitting..." : "Submit response"}
              </button>
            </form>

            {status ? (
              <p className={`mt-3 text-sm ${isError ? "text-red-600" : "text-emerald-700"}`}>
                {status}
              </p>
            ) : null}

          </div>
        </div>
      </section>
    </main>
  );
}
