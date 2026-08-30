'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  Filter,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { InventoryItem } from '../../types/dashboard';

export const HospitalInventoryManager: React.FC = () => {
  const { inventory, updateInventoryStock, restockItem, currentHospital } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const hospitalInventory = inventory.filter((i) => i.hospital_id === currentHospital.id);

  const filteredItems = hospitalInventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.item_name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = hospitalInventory.filter((i) => i.is_low_stock).length;

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Pharmaceutical &amp; Emergency Supply Inventory</span>
            </h3>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {hospitalInventory.length} Monitored Items
            </span>
            {lowStockCount > 0 && (
              <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                {lowStockCount} Critical Deficits
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Tracks ventilators, rapid intubation kits, defibrillator pads, and IV fluids for {currentHospital.name}.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#111728] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pharmaceutical, item name, category..."
            className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-64 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080d16] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {['all', 'medication', 'equipment', 'trauma_supplies', 'blood_bank'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-amber-600 text-amber-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.is_low_stock;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
                isLow
                  ? 'bg-red-50/70 dark:bg-gradient-to-br dark:from-red-950/30 dark:via-[#111728] dark:to-[#111728] border-red-300 dark:border-red-500/50'
                  : 'bg-white dark:bg-[#111728] border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">{item.category.replace('_', ' ')}</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.item_name}</h4>
                </div>
                {isLow && (
                  <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                    LOW STOCK
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between my-3">
                <div className="font-mono">
                  <span className={`text-2xl font-black ${isLow ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {item.current_stock}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ Min {item.minimum_threshold} {item.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Restock Actions:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => restockItem(item.id, 5)}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 font-bold text-[10px]"
                  >
                    +5 Units
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
