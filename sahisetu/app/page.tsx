const journey = [
  ["01", "Share details", "Tell us what needs to change."],
  ["02", "Check documents", "Catch small mismatches before submission."],
  ["03", "Submit prepared", "Download a clarification note, if needed."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <a className="flex items-center gap-3 font-semibold tracking-tight" href="#top">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">स</span>
            <span className="text-xl">SahiSetu</span>
          </a>
          <span className="rounded-full border border-[#d8e6d9] bg-white px-3 py-1.5 text-xs font-medium text-[#356044]">Demo prototype</span>
        </nav>

        <section id="top" className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.06fr_.94fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-[#e8f5e9] px-3 py-1.5 text-sm font-semibold text-[#257341]">A clearer route through RTO paperwork</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Clear your documents <span className="text-[#19713d]">before</span> scrutiny begins.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#526558]">SahiSetu reviews your application and supporting documents before they reach the RTO—so a tiny address mismatch does not become a months-long delay.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/apply" className="rounded-xl bg-[#166534] px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-[#166534]/20 transition hover:bg-[#10572b]">Start address change <span aria-hidden="true">→</span></a>
              <a href="#how-it-works" className="rounded-xl border border-[#cfe0d1] bg-white px-6 py-3.5 text-center text-base font-semibold text-[#285536] transition hover:bg-[#f4faf3]">How it works</a>
            </div>
            <p className="mt-4 text-sm text-[#728176]">No real documents, payments, or government systems are used in this demo.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-10 -z-0 rounded-full bg-[#dff3df] blur-3xl" /><div className="relative rounded-3xl border border-[#d7e8d8] bg-white p-5 shadow-2xl shadow-[#244c2d]/10 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#edf2ed] pb-5"><div><p className="text-sm font-medium text-[#6d7d70]">Application check</p><p className="text-lg font-semibold">Address change</p></div><span className="rounded-full bg-[#e5f7e7] px-3 py-1 text-sm font-semibold text-[#277543]">2 of 3 clear</span></div>
            <div className="space-y-4 py-5"><CheckRow label="Driving licence" detail="DL 42 2020 0012345" status="Matched" /><CheckRow label="Address proof" detail="Aadhaar · Bengaluru" status="Matched" /><div className="rounded-2xl border border-[#f0d49f] bg-[#fff8e8] p-4"><div className="flex gap-3"><span className="mt-0.5 text-lg">⚠</span><div><p className="font-semibold text-[#7b4a09]">Small difference found</p><p className="mt-1 text-sm leading-5 text-[#815d29]">“Indira Nagar” on your form appears as “Indiranagar” on your proof.</p></div></div><a href="/apply" className="mt-4 block w-full rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-[#88500a] shadow-sm ring-1 ring-[#efd5a4]">Review and clarify</a></div></div>
            <div className="flex items-center gap-3 rounded-xl bg-[#f5faf4] p-3 text-sm text-[#41614a]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9f0dd] text-[#1e6b38]">✓</span>Your details stay in your control.</div>
          </div></div>
        </section>

        <section id="how-it-works" className="border-t border-[#e1eade] py-16 sm:py-20"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">A quick check before the waiting starts.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{journey.map(([number, title, detail]) => <article key={number} className="rounded-2xl border border-[#dfebdf] bg-white p-6"><span className="text-sm font-bold text-[#4c9461]">{number}</span><h3 className="mt-9 text-xl font-semibold">{title}</h3><p className="mt-2 leading-6 text-[#637467]">{detail}</p></article>)}</div></section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">SahiSetu is an independent prototype, not an official government service.</footer>
      </div>
    </main>
  );
}

function CheckRow({ label, detail, status }: { label: string; detail: string; status: string }) {
  return <div className="flex items-center justify-between rounded-xl border border-[#e5eee6] p-3"><div><p className="font-semibold">{label}</p><p className="mt-0.5 text-sm text-[#6a7a6d]">{detail}</p></div><span className="text-sm font-semibold text-[#238143]">✓ {status}</span></div>;
}
