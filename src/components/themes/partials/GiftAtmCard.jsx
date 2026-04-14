'use client';
import React from 'react';
import toast from 'react-hot-toast';
import { Cormorant_Garamond, Poppins } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

const getPhoto = (p) => {
    if (!p) return null;
    let ph = p;
    if (typeof ph === 'string' && ph.startsWith('[')) {
        try {
            const parsed = JSON.parse(ph);
            if (Array.isArray(parsed) && parsed.length > 0) ph = parsed[0];
        } catch (e) {}
    }
    if (Array.isArray(ph)) ph = ph[0];
    if (typeof ph === 'object' && ph !== null) {
        if (ph.photo) ph = ph.photo;
        else if (ph.url) ph = ph.url;
        else return null;
    }
    if (typeof ph !== 'string') return null;
    ph = ph.replace(/\\/g, '/');
    if (!ph.startsWith('http') && !ph.startsWith('/')) {
        ph = `${STORAGE_URL}/${ph}`;
    }
    return ph;
};

const styleVariants = {
    golden: {
        card: "bg-gradient-to-tr from-[#1a1411] via-[#3a2c24] to-[#1a1411] border-[#bd9a5f]/40",
        glow: "bg-[#bd9a5f]/20",
        btn: "bg-gradient-to-r from-[#1a1411] to-[#3a2c24] border-[#bd9a5f]/30 hover:border-[#bd9a5f]/80 text-[#bd9a5f]",
        textBtn: "text-white/90",
        textMain: "text-white drop-shadow-md",
        textSub: "text-white/50",
        logo: "brightness-0 invert opacity-90",
        chip: "text-[#d4af37]",
        circle: "bg-white/40 mix-blend-screen"
    },
    emerald: {
        card: "bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#022c22] border-[#10b981]/40",
        glow: "bg-[#10b981]/15",
        btn: "bg-gradient-to-r from-[#064e3b] to-[#047857] border-[#10b981]/30 hover:border-[#10b981]/80 text-[#34d399]",
        textBtn: "text-white/90",
        textMain: "text-white drop-shadow-md",
        textSub: "text-[#ecfdf5]/50",
        logo: "brightness-0 invert opacity-90",
        chip: "text-[#d4af37]",
        circle: "bg-white/40 mix-blend-screen"
    },
    navy: {
        card: "bg-gradient-to-tr from-[#0f172a] via-[#1e3a8a] to-[#0f172a] border-[#60a5fa]/40",
        glow: "bg-[#3b82f6]/20",
        btn: "bg-gradient-to-r from-[#1e40af] to-[#1d4ed8] border-[#60a5fa]/30 hover:border-[#60a5fa]/80 text-[#93c5fd]",
        textBtn: "text-white/90",
        textMain: "text-white drop-shadow-md",
        textSub: "text-[#eff6ff]/50",
        logo: "brightness-0 invert opacity-90",
        chip: "text-[#d4af37]",
        circle: "bg-white/40 mix-blend-screen"
    },
    obsidian: {
        card: "bg-gradient-to-tr from-[#000000] via-[#18181b] to-[#000000] border-[#52525b]/60",
        glow: "bg-[#e4e4e7]/10",
        btn: "bg-gradient-to-r from-[#27272a] to-[#3f3f46] border-[#71717a]/40 hover:border-[#a1a1aa] text-[#e4e4e7]",
        textBtn: "text-white/90",
        textMain: "text-white drop-shadow-md",
        textSub: "text-[#a1a1aa]",
        logo: "brightness-0 invert opacity-90",
        chip: "text-[#d4af37]",
        circle: "bg-white/40 mix-blend-screen"
    },
    rosegold: {
        card: "bg-gradient-to-tr from-[#ffe4e6] via-[#fbcfe8] to-[#ffe4e6] border-[#f472b6]/40",
        glow: "bg-[#fb7185]/30",
        btn: "bg-gradient-to-r from-[#fbcfe8] to-[#f9a8d4] border-[#db2777]/30 hover:border-[#db2777]/80 text-[#db2777]",
        textBtn: "text-[#831843]",
        textMain: "text-[#831843]",
        textSub: "text-[#be185d]/60",
        logo: "brightness-0 opacity-70",
        chip: "text-[#be185d]/60",
        circle: "bg-[#be185d]/20 mix-blend-multiply"
    },
    pearl: {
        card: "bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border-[#cbd5e1]",
        glow: "bg-[#cbd5e1]/50",
        btn: "bg-gradient-to-r from-[#e2e8f0] to-[#cbd5e1] border-[#94a3b8] hover:border-[#64748b] text-[#475569]",
        textBtn: "text-[#334155]",
        textMain: "text-[#334155]",
        textSub: "text-[#64748b]",
        logo: "brightness-0 opacity-70",
        chip: "text-[#94a3b8]",
        circle: "bg-[#64748b]/20 mix-blend-multiply"
    }
};

export default function GiftAtmCard({ acc, delayData, variant = "golden" }) {
    if (!acc) return null;
    
    const bankName = acc.bank?.name || acc.bank_name || 'Bank';
    const bankLogo = getPhoto(acc.bank?.logo);
    
    // Auto-detect inherited from strings (basic guess based on filename string passed or direct variant)
    let activeStyle = styleVariants.golden;
    const vLower = variant.toLowerCase();
    if (vLower.includes('navy')) activeStyle = styleVariants.navy;
    else if (vLower.includes('garden') && !vLower.includes('motion')) activeStyle = styleVariants.emerald;
    else if (vLower.includes('botanical') || vLower.includes('nature')) activeStyle = styleVariants.emerald;
    else if (vLower.includes('rose') || vLower.includes('blush') || vLower.includes('romance') || vLower.includes('tropical') || vLower.includes('floral')) activeStyle = styleVariants.rosegold;
    else if (vLower.includes('white') || vLower.includes('minimalist') || vLower.includes('pearl')) activeStyle = styleVariants.pearl;
    else if (vLower.includes('black') || vLower.includes('monochrome') || vLower.includes('midnight') || vLower.includes('cinematic') || vLower.includes('elegant')) activeStyle = styleVariants.obsidian;
    else if (styleVariants[vLower]) activeStyle = styleVariants[vLower];
    
    return (
        <div className="g1-reveal w-full" data-delay={delayData || "1"}>
            {/* ATM Card UI */}
            <div className={`relative w-full aspect-[1.586/1] rounded-2xl shadow-xl p-6 flex flex-col justify-between overflow-hidden border ${activeStyle.card} mx-auto max-w-[340px]`}>
                
                {/* Background pattern & glow */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none ${activeStyle.glow}`}></div>
                <div className={`absolute -left-16 -bottom-16 w-56 h-56 rounded-full blur-3xl pointer-events-none ${activeStyle.glow}`}></div>

                {/* Card Top: Chip & Bank Info */}
                <div className="flex justify-between items-start relative z-10 w-full">
                    {/* EMV Chip SVG */}
                    <svg className={`w-10 h-8 opacity-90 ${activeStyle.chip}`} viewBox="0 0 512 512" fill="currentColor">
                        <path d="M416 112H96c-17.67 0-32 14.33-32 32v224c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32V144c0-17.67-14.33-32-32-32zm-288 32h80v64h-80v-64zm0 128h80v64h-80v-64zm160-128h128v64H288v-64zm0 128h128v64H288v-64z"/>
                    </svg>
                    
                    {/* Dynamic Bank Logo from API */}
                    {bankLogo ? (
                        <img src={bankLogo} alt={bankName} className={`h-10 max-w-[160px] object-contain drop-shadow-sm ${activeStyle.logo}`} />
                    ) : (
                        <span className={`${cormorant.className} text-2xl font-bold uppercase tracking-widest ${activeStyle.textMain}`}>{bankName}</span>
                    )}
                </div>

                {/* Card Middle: Account Number */}
                <div className="relative z-10 text-left mt-4">
                    <p className={`${poppins.className} text-xl tracking-[0.25em] font-medium whitespace-nowrap ${activeStyle.textMain}`}>
                        {String(acc.account_number).match(/.{1,4}/g)?.join(' ') || acc.account_number}
                    </p>
                </div>

                {/* Card Bottom: Holder Name */}
                <div className="flex justify-between items-end relative z-10">
                    <div className="text-left w-full overflow-hidden">
                        <p className={`text-[8px] uppercase tracking-[0.2em] mb-1 font-sans ${activeStyle.textSub}`}>Card Holder</p>
                        <p className={`${poppins.className} text-sm uppercase tracking-widest font-semibold truncate pr-2 ${activeStyle.textMain}`}>{acc.account_holder}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        {/* Generic Master/Visa-like circles */}
                        <div className="flex -space-x-3 opacity-90">
                            <div className={`w-6 h-6 rounded-full ${activeStyle.circle}`}></div>
                            <div className={`w-6 h-6 rounded-full ${activeStyle.circle}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button onClick={() => { navigator.clipboard.writeText(acc.account_number); toast.success('Nomor rekening disalin!'); }}
                className={`${poppins.className} mt-5 mb-5 mx-auto max-w-[340px] border w-full py-3.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 ${activeStyle.btn}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span className={`${activeStyle.textBtn}`}>Salin Rekening {bankName}</span>
            </button>
        </div>
    );
}
