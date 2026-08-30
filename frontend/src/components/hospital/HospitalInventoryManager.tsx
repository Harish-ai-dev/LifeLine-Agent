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
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { InventoryItem } from '../../types/dashboard';

export const HospitalInventoryManager: React.FC = () => {
  const { inventory, updateInventoryStock, restockItem, currentHospital } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#111728] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supply, medicine, category..."
              className="bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-52 sm:w-64 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#080d16] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-100 dark:bg-amber-600 text-amber-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-amber-100 dark:bg-amber-600 text-amber-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-[#080d16] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {['all', 'medication', 'equipment', 'trauma_supplies', 'blood_bank'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
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

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs font-mono">
          No inventory items found matching filter criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* ── TABLE VIEW WITH HORIZONTAL SCROLL FOR MOBILE ─────────────────── */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">SKU / Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Restock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const isLow = item.is_low_stock;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isLow ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{item.item_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">SKU: {item.id}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-sm text-slate-900 dark:text-white">
                        <span className={isLow ? 'text-red-600 dark:text-red-400' : ''}>
                          {item.current_stock}
                        </span>{' '}
                        <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-xs">
                        Min {item.minimum_threshold} {item.unit}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {isLow ? (
                          <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block animate-pulse">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
                            title="Decrease 1 Unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => restockItem(item.id, 5)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 font-bold text-[10px]"
                            title="Restock +5 Units"
                          >
                            +5 {item.unit}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── CARD GRID VIEW ───────────────────────────────────────────────── */
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
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
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
                    <span
                      className={`text-2xl font-black ${
                        isLow ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.current_stock}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      / Min {item.minimum_threshold} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Restock Actions:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm"
                      title="Decrease 1 Unit"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => restockItem(item.id, 5)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 font-bold text-[10px]"
                      title="Restock +5 Units"
                    >
                      +5 Units
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
