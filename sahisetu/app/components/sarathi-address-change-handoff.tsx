"use client";

import { useState } from "react";
import { indianStatesAndUts, karnatakaDlAddressChangeRoute } from "../lib/official-routes";

export function SarathiAddressChangeHandoff({ hindi }: { hindi: boolean }) {
  const [stateOrUt, setStateOrUt] = useState("Karnataka");
  const isKarnataka = stateOrUt === "Karnataka";

  return (
    <section className="rounded-2xl border border-[#b9d8ed] bg-[#f4faff] p-5 text-[#234c65]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1e638f]">
        {hindi ? "आधिकारिक पता-परिवर्तन अगला कदम" : "Official address-change next step"}
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        {hindi ? "Sarathi पर पता परिवर्तन जारी रखें" : "Continue the address change on Sarathi"}
      </h2>
      <label className="mt-4 block text-sm font-semibold" htmlFor="sarathi-state-or-ut">
        {hindi ? "राज्य या केंद्र शासित प्रदेश" : "State or UT"}
      </label>
      <select
        id="sarathi-state-or-ut"
        value={stateOrUt}
        onChange={(event) => setStateOrUt(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#8bb9d2] bg-white px-3 py-2.5 text-sm font-medium text-[#234c65]"
      >
        {indianStatesAndUts.map((place) => (
          <option key={place}>{place}</option>
        ))}
      </select>
      <p className="mt-4 text-sm leading-6">
        {hindi
          ? `Sarathi पर ${stateOrUt} चुनें, फिर Driving Licence → Services on Driving Licence → Change of Address चुनें। वहाँ अपना DL नंबर और जन्म तिथि दर्ज करें।`
          : `In Sarathi, select ${stateOrUt}, then choose Driving Licence → Services on Driving Licence → Change of Address. Enter your DL number and date of birth there.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={karnatakaDlAddressChangeRoute.serviceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-[#1e638f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#164f72]"
        >
          {hindi ? "Sarathi खोलें ↗" : "Open Sarathi ↗"}
        </a>
        <a
          href={karnatakaDlAddressChangeRoute.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-[#8bb9d2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e638f] hover:bg-[#e6f4fb]"
        >
          {hindi ? "आधिकारिक मार्गदर्शन ↗" : "Official guidance ↗"}
        </a>
      </div>
      <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs leading-5 text-[#496779]">
        {isKarnataka
          ? hindi
            ? `Karnataka इस डेमो में जाँचा गया परिदृश्य है। आधिकारिक मार्गदर्शन ${karnatakaDlAddressChangeRoute.checkedOn} को जाँचा गया था; Sarathi में दिखने वाली वर्तमान आवश्यकताओं का पालन करें।`
            : `Karnataka is the verified scenario in this demo. Official guidance was checked on ${karnatakaDlAddressChangeRoute.checkedOn}; follow the current requirements shown in Sarathi.`
          : hindi
            ? `${stateOrUt} के लिए SahiSetu ने राज्य-विशिष्ट आवश्यकताओं को सत्यापित नहीं किया है। Sarathi में दिखने वाली वर्तमान आवश्यकताओं का पालन करें।`
            : `SahiSetu has not verified state-specific requirements for ${stateOrUt}. Follow the current requirements shown in Sarathi.`}
      </p>
      <p className="mt-3 text-xs leading-5 text-[#496779]">
        {hindi
          ? "यह बटन आधिकारिक सेवा खोलता है। SahiSetu आपकी जानकारी स्थानांतरित या सबमिट नहीं करता।"
          : "This opens the official service. SahiSetu does not transfer or submit your information."}
      </p>
    </section>
  );
}
