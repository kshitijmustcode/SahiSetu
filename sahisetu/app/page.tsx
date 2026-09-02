"use client";

import { useSyncExternalStore } from "react";

const journey = [
  ["01", "Upload your documents", "Add your current licence and proof of new address."],
  ["02", "We read and check them", "We find the new address and stop if an image is unclear."],
  ["03", "Confirm your address", "Use the reviewed address when you fill the official form."],
];

const judgeDemos = [
  { query: "normal", number: "01", title: "Normal application", detail: "Load both synthetic documents, review the extracted address, and create a report." },
  { query: "hiddenLicence", number: "02", title: "Hidden licence address", detail: "Shows that a licence with its address obscured should be replaced early." },
  { query: "blurryProof", number: "03", title: "Blurry address proof", detail: "Stops when the new address cannot be read reliably." },
  { query: "glareProof", number: "04", title: "Glare on proof", detail: "Tests whether glare makes the critical address information unsafe to use." },
  { query: "croppedProof", number: "05", title: "Cropped address proof", detail: "Flags a proof with incomplete address details instead of guessing." },
];

export default function Home() {
  const language = useSyncExternalStore((callback) => { window.addEventListener("sahisetu-language", callback); return () => window.removeEventListener("sahisetu-language", callback); }, () => window.localStorage.getItem("sahisetu-language") === "hi" ? "hi" : "en", () => "en");
  const hindi = language === "hi";
  const changeLanguage = (nextHindi: boolean) => { window.localStorage.setItem("sahisetu-language", nextHindi ? "hi" : "en"); window.dispatchEvent(new Event("sahisetu-language")); };
  const visibleJourney = hindi ? [["01", "दस्तावेज़ अपलोड करें", "मौजूदा लाइसेंस और नए पते का प्रमाण जोड़ें।"], ["02", "हम पढ़ते और जाँचते हैं", "हम नया पता ढूँढते हैं और छवि अस्पष्ट होने पर रोकते हैं।"], ["03", "अपने पते की पुष्टि करें", "आधिकारिक फॉर्म भरते समय जाँचे गए पते का उपयोग करें।"]] : journey;
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf8] text-[#17281f]">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          <a className="flex items-center gap-3 font-semibold tracking-tight" href="#top">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">स</span>
            <span className="text-xl">SahiSetu</span>
          </a>
          <div className="flex items-center gap-2"><a href="https://github.com/kshitijmustcode/SahiSetu" target="_blank" rel="noreferrer" className="rounded-lg border border-[#d7e1d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#285536] hover:bg-[#f4faf3]" aria-label="View the SahiSetu source code on GitHub">GitHub ↗</a><div className="flex rounded-lg border border-[#d7e1d7] bg-white p-1 text-xs font-semibold"><button onClick={() => changeLanguage(false)} className={`rounded-md px-2.5 py-1.5 ${!hindi ? "bg-[#193b63] text-white" : "text-[#526558]"}`}>English</button><button onClick={() => changeLanguage(true)} className={`rounded-md px-2.5 py-1.5 ${hindi ? "bg-[#193b63] text-white" : "text-[#526558]"}`}>हिन्दी</button></div><span className="hidden rounded-full border border-[#e8cd98] bg-[#fff8e8] px-3 py-1.5 text-xs font-medium text-[#80591b] sm:inline">{hindi ? "डेमो प्रोटोटाइप" : "Demo prototype"}</span></div>
        </nav>

        <section id="top" className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.06fr_.94fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-[#fff1d7] px-3 py-1.5 text-sm font-semibold text-[#8a5410]">{hindi ? "RTO कागज़ी कार्यवाही का स्पष्ट रास्ता" : "A clearer route through RTO paperwork"}</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{hindi ? <>आवेदन करने से <span className="text-[#19713d]">पहले</span> अपना नया पता तैयार करें।</> : <>Prepare your new address <span className="text-[#19713d]">before</span> you apply.</>}</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#526558]">{hindi ? "अपना मौजूदा लाइसेंस और नए पते का प्रमाण अपलोड करें। SahiSetu उन्हें पढ़ता है, स्पष्टता जाँचता है और Parivahan पर उपयोग से पहले आपके लिए पता तैयार करता है।" : "Upload your current licence and proof of new address. SahiSetu reads them, checks clarity, and prepares an address you can review before using it on Parivahan."}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/apply" className="rounded-xl bg-[#166534] px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-[#166534]/20 transition hover:bg-[#10572b]">{hindi ? "मेरा नया पता तैयार करें" : "Prepare my new address"} <span aria-hidden="true">→</span></a>
              <a href="#how-it-works" className="rounded-xl border border-[#cfe0d1] bg-white px-6 py-3.5 text-center text-base font-semibold text-[#285536] transition hover:bg-[#f4faf3]">{hindi ? "यह कैसे काम करता है" : "How it works"}</a>
            </div>
            <p className="mt-4 text-sm text-[#728176]">{hindi ? "इस डेमो में वास्तविक दस्तावेज़, भुगतान या सरकारी सिस्टम का उपयोग नहीं होता।" : "No real documents, payments, or government systems are used in this demo."}</p>
          </div>

          <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-10 -z-0 rounded-full bg-[#dff3df] blur-3xl" /><div className="relative rounded-3xl border border-[#d7e8d8] bg-white p-5 shadow-2xl shadow-[#244c2d]/10 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">{hindi ? "दस्तावेज़ों से एक पता" : "From documents to one address"}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#e4eee5] bg-[#fbfefb] p-4"><span className="text-xl">🪪</span><p className="mt-3 font-semibold">{hindi ? "मौजूदा लाइसेंस" : "Current licence"}</p><p className="mt-1 text-sm leading-5 text-[#637467]">{hindi ? "यहाँ पुराना पता अपेक्षित है।" : "Your old address is expected here."}</p></div><div className="rounded-2xl border border-[#e4eee5] bg-[#fbfefb] p-4"><span className="text-xl">⌂</span><p className="mt-3 font-semibold">{hindi ? "नए पते का प्रमाण" : "New-address proof"}</p><p className="mt-1 text-sm leading-5 text-[#637467]">{hindi ? "हम इससे नया पता पढ़ते हैं।" : "We read the new address from this."}</p></div></div>
            <div className="my-4 flex items-center gap-3 text-sm font-semibold text-[#39834f]"><span className="h-px flex-1 bg-[#cfe3d2]" />SahiSetu prepares<span className="h-px flex-1 bg-[#cfe3d2]" /></div>
            <div className="rounded-2xl border border-[#b9dfc0] bg-[#f1fbf3] p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#37804d]">{hindi ? "जाँचने के लिए आपका पता" : "Your address to review"}</p><p className="mt-2 text-lg font-semibold leading-7 text-[#215d34]">12 M.G. Road, Indiranagar,<br />Bengaluru, Karnataka 560038</p><p className="mt-3 text-sm leading-5 text-[#4b6953]">{hindi ? "ज़रूरत हो तो बदलें, फिर प्रमाण से मिलाएँ।" : "Edit it if needed, then check it against your proof."}</p><a href="/apply" className="mt-4 block w-full rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#246538] shadow-sm ring-1 ring-[#b9dfc0]">{hindi ? "मेरा पता तैयार करें →" : "Prepare my address →"}</a></div>
            <p className="mt-4 text-center text-xs leading-5 text-[#647466]">SahiSetu does not submit to Parivahan for you.</p>
          </div></div>
        </section>

        <section id="how-it-works" className="border-t border-[#e1eade] py-16 sm:py-20"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">{hindi ? "यह कैसे काम करता है" : "How it works"}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{hindi ? "कम टाइपिंग। बाद में कम परेशानियाँ।" : "Less retyping. Fewer surprises later."}</h2><p className="mt-4 leading-7 text-[#637467]">{hindi ? "SahiSetu नए पते को प्रमाण से पढ़ता है ताकि आप आवेदन से पहले उसकी जाँच कर सकें।" : "SahiSetu reads the new address from proof so you can review it before applying."}</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{visibleJourney.map(([number, title, detail]) => <article key={number} className="rounded-2xl border border-[#dfebdf] bg-white p-6"><span className="text-sm font-bold text-[#4c9461]">{number}</span><h3 className="mt-9 text-xl font-semibold">{title}</h3><p className="mt-2 leading-6 text-[#637467]">{detail}</p></article>)}</div></section>
        <section id="judge-demo" className="border-t border-[#e1eade] py-16 sm:py-20">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#31804a]">{hindi ? "लाइव डेमो आज़माएँ" : "Explore the live demo"}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{hindi ? "सामान्य प्रवाह और सुरक्षा जाँच, दोनों देखें।" : "See the normal journey and the safeguards."}</h2><p className="mt-4 leading-7 text-[#637467]">{hindi ? "हर उदाहरण केवल सिंथेटिक डेटा का उपयोग करता है और OpenAI Vision जाँच से गुजरता है। सुरक्षा उदाहरणों में अपेक्षित fail-closed परिणाम की भी पुष्टि होती है।" : "Every example uses synthetic data and runs through the OpenAI Vision check. Safety fixtures also assert their expected fail-closed outcome."}</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">{judgeDemos.map((demo) => <a key={demo.query} href={`/apply?demo=${demo.query}`} className="group rounded-2xl border border-[#dbe8dc] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9cc9a3] hover:shadow-lg hover:shadow-[#244c2d]/5"><span className="text-sm font-bold text-[#4c9461]">{demo.number}</span><h3 className="mt-5 text-xl font-semibold group-hover:text-[#166534]">{demo.title}</h3><p className="mt-2 text-sm leading-6 text-[#637467]">{demo.detail}</p><span className="mt-5 inline-flex text-sm font-semibold text-[#246538]">Run this test <span className="ml-1" aria-hidden="true">→</span></span></a>)}</div>
          <div className="mt-8 rounded-2xl border border-[#d7e5d9] bg-[#f7fbf7] p-5 sm:p-6"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[#31804a]">{hindi ? "तैयारी स्कोर का अर्थ" : "What the readiness score means"}</p><p className="mt-2 text-sm leading-6 text-[#566b5a]">{hindi ? "यह सरकारी स्वीकृति की भविष्यवाणी नहीं, बल्कि अगले कदम के लिए एक स्पष्ट चेकलिस्ट है।" : "It is not a government-approval prediction. It is a checklist for the next best step."}</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
            ["25", hindi ? "बड़ी समस्या" : "Major issue", hindi ? "दस्तावेज़ बदलें या सुधारें।" : "Replace or correct the document."],
            ["65", hindi ? "समीक्षा बाकी" : "Review pending", hindi ? "दस्तावेज़ पढ़े गए; पता पुष्टि करें।" : "Documents are readable; confirm the address."],
            ["78", hindi ? "छोटा अंतर" : "Minor difference", hindi ? "स्पष्टीकरण नोट चाहिए।" : "A clarification note is needed."],
            ["95", hindi ? "जाँच पूरी" : "Checks complete", hindi ? "पता और दस्तावेज़ समीक्षा के लिए तैयार हैं।" : "Address and document checks are complete."],
          ].map(([score, label, detail]) => <div key={score} className="rounded-xl border border-[#dfeade] bg-white p-4"><p className="text-2xl font-bold text-[#1e6b37]">{score}</p><p className="mt-1 font-semibold">{label}</p><p className="mt-1 text-xs leading-5 text-[#637467]">{detail}</p></div>)}</div></div>
        </section>
        <footer className="border-t border-[#e1eade] py-7 text-sm text-[#66796a]">{hindi ? "SahiSetu एक स्वतंत्र प्रोटोटाइप है, आधिकारिक सरकारी सेवा नहीं।" : "SahiSetu is an independent prototype, not an official government service."}</footer>
      </div>
    </main>
  );
}
