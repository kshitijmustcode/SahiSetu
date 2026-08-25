const journey = [
  ["01", "Upload your documents", "Add your current licence and proof of new address."],
  ["02", "We read and check them", "We find the new address and stop if an image is unclear."],
  ["03", "Confirm your address", "Use the reviewed address when you fill the official form."],
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
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Prepare your new address <span className="text-[#19713d]">before</span> you apply.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#526558]">Upload your current licence and proof of new address. SahiSetu reads them, checks clarity, and prepares an address you can review before using it on Parivahan.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/apply" className="rounded-xl bg-[#166534] px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-[#166534]/20 transition hover:bg-[#10572b]">Prepare my new address <span aria-hidden="true">→</span></a>
              <a href="#how-it-works" className="rounded-xl border border-[#cfe0d1] bg-white px-6 py-3.5 text-center text-base font-semibold text-[#285536] transition hover:bg-[#f4faf3]">How it works</a>
            </div>
            <p className="mt-4 text-sm text-[#728176]">No real documents, payments, or government systems are used in this demo.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-10 -z-0 rounded-full bg-[#dff3df] blur-3xl" /><div className="relative rounded-3xl border border-[#d7e8d8] bg-white p-5 shadow-2xl shadow-[#244c2d]/10 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">From documents to one address</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#e4eee5] bg-[#fbfefb] p-4"><span className="text-xl">🪪</span><p className="mt-3 font-semibold">Current licence</p><p className="mt-1 text-sm leading-5 text-[#637467]">Your old address is expected here.</p></div><div className="rounded-2xl border border-[#e4eee5] bg-[#fbfefb] p-4"><span className="text-xl">⌂</span><p className="mt-3 font-semibold">New-address proof</p><p className="mt-1 text-sm leading-5 text-[#637467]">We read the new address from this.</p></div></div>
            <div className="my-4 flex items-center gap-3 text-sm font-semibold text-[#39834f]"><span className="h-px flex-1 bg-[#cfe3d2]" />SahiSetu prepares<span className="h-px flex-1 bg-[#cfe3d2]" /></div>
            <div className="rounded-2xl border border-[#b9dfc0] bg-[#f1fbf3] p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#37804d]">Your address to review</p><p className="mt-2 text-lg font-semibold leading-7 text-[#215d34]">12 M.G. Road, Indiranagar,<br />Bengaluru, Karnataka 560038</p><p className="mt-3 text-sm leading-5 text-[#4b6953]">Edit it if needed, then check it against your proof.</p><a href="/apply" className="mt-4 block w-full rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#246538] shadow-sm ring-1 ring-[#b9dfc0]">Prepare my address →</a></div>
            <p className="mt-4 text-center text-xs leading-5 text-[#647466]">SahiSetu does not submit to Parivahan for you.</p>
          </div></div>
        </section>

        <section id="how-it-works" className="border-t border-[#e1eade] py-16 sm:py-20"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Less retyping. Fewer surprises later.</h2><p className="mt-4 leading-7 text-[#637467]">Already filled the government form? SahiSetu can also compare the address you entered against your proof before you continue.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{journey.map(([number, title, detail]) => <article key={number} className="rounded-2xl border border-[#dfebdf] bg-white p-6"><span className="text-sm font-bold text-[#4c9461]">{number}</span><h3 className="mt-9 text-xl font-semibold">{title}</h3><p className="mt-2 leading-6 text-[#637467]">{detail}</p></article>)}</div></section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">SahiSetu is an independent prototype, not an official government service.</footer>
      </div>
    </main>
  );
}
