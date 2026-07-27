import React, { useState } from 'react';
import { Search, BookOpen, Sparkles, Filter } from 'lucide-react';
import { AMHARIC_FAMILIES, ETHIOPIC_PUNCTUATION, ETHIOPIC_NUMERALS } from '../engine/amharicPhoneticEngine';

export const KeyCombinationGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFamilies = Object.values(AMHARIC_FAMILIES).filter((fam) => {
    const term = searchTerm.toLowerCase();
    return (
      fam.consonant.toLowerCase().includes(term) ||
      fam.name.toLowerCase().includes(term) ||
      Object.values(fam.orders).some((o) => o && o.includes(term))
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Windows 10 Amharic Phonetic Key Combination Reference
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exact key combinations used when Language Lock is active (QWERTY key + Vowel modifiers)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search key (e.g. s, ch, t, g)..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Vowel Order Explanation Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-xs space-y-2 text-slate-300">
        <div className="font-bold text-amber-400 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Vowel Modifier Rules (Orders 1 - 7 + Labialized):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-[11px] font-mono pt-1">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 1 (Ä)</span>
            <span className="text-slate-400">Base Key (e.g. s)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 2 (U)</span>
            <span className="text-slate-400">+ u (e.g. su)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 3 (I)</span>
            <span className="text-slate-400">+ i (e.g. si)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 4 (A)</span>
            <span className="text-slate-400">+ a (e.g. sa)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 5 (E)</span>
            <span className="text-slate-400">+ e (e.g. se)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 6 (I/Short)</span>
            <span className="text-slate-400">+ I or alone</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Order 7 (O)</span>
            <span className="text-slate-400">+ o (e.g. so)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-amber-300 font-bold block">Labialized</span>
            <span className="text-slate-400">+ w / wa</span>
          </div>
        </div>
      </div>

      {/* Main Table of Consonant Families */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Key</th>
              <th className="p-3">Name</th>
              <th className="p-3 text-center">1st (Ä)</th>
              <th className="p-3 text-center">2nd (U)</th>
              <th className="p-3 text-center">3rd (I)</th>
              <th className="p-3 text-center">4th (A)</th>
              <th className="p-3 text-center">5th (E)</th>
              <th className="p-3 text-center">6th (Short)</th>
              <th className="p-3 text-center">7th (O)</th>
              <th className="p-3 text-center">Labialized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-serif">
            {filteredFamilies.map((fam) => (
              <tr key={fam.consonant} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-mono text-amber-400 font-bold text-xs font-sans">
                  {fam.consonant}
                </td>
                <td className="p-3 font-sans text-slate-300 text-xs">
                  {fam.name}
                </td>
                <td className="p-3 text-center font-bold text-sm text-slate-100">{fam.orders[1]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[2]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[3]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[4]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[5]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[6]}</td>
                <td className="p-3 text-center text-sm text-slate-300">{fam.orders[7]}</td>
                <td className="p-3 text-center text-sm text-amber-300 font-bold">
                  {fam.orders.labialized || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Punctuation & Ethiopic Numbers Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ethiopic Punctuation */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-xs text-amber-400">Ethiopic Punctuation</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Wordspace (::):</span>
              <span className="font-serif font-bold text-amber-300 text-sm">፡</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Full Stop (:::):</span>
              <span className="font-serif font-bold text-amber-300 text-sm">።</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Comma (,):</span>
              <span className="font-serif font-bold text-amber-300 text-sm">፥</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Semicolon (;):</span>
              <span className="font-serif font-bold text-amber-300 text-sm">፤</span>
            </div>
          </div>
        </div>

        {/* Ethiopic Numerals */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-xs text-amber-400">Ethiopic Numerals</h3>
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono">
            {Object.entries(ETHIOPIC_NUMERALS).map(([num, ethChar]) => (
              <div key={num} className="p-1.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{num}</span>
                <span className="font-serif font-bold text-amber-300 text-sm">{ethChar}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
