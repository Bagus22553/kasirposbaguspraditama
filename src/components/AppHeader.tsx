import React from 'react';
import {
  Store,
  LayoutGrid,
  BarChart3,
  UtensilsCrossed,
  Package,
  Layers,
  Printer,
  Tablet,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export type NavTab = 'pos' | 'dashboard' | 'menu' | 'raw_materials';

interface AppHeaderProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  runningOrdersCount: number;
  lowStockCount: number;
  isTabletBezel: boolean;
  onToggleBezel: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onChangeTab,
  runningOrdersCount,
  lowStockCount,
  isTabletBezel,
  onToggleBezel,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">RestoPOS Pro</h1>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                Tablet POS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sistem Kasir, Manajemen Menu & Bahan Baku Restoran</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => onChangeTab('pos')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'pos'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kasir POS</span>
            {runningOrdersCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {runningOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard Admin</span>
          </button>

          <button
            onClick={() => onChangeTab('menu')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'menu'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Manajemen Menu</span>
          </button>

          <button
            onClick={() => onChangeTab('raw_materials')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'raw_materials'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Bahan Baku (Baku)</span>
            {lowStockCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                !
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools: Tablet Frame Toggle */}
        <div className="flex items-center gap-2">
          {currentTab === 'pos' && (
            <button
              onClick={onToggleBezel}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isTabletBezel
                  ? 'bg-slate-800 border-rose-500/50 text-rose-300 shadow-xs'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>{isTabletBezel ? 'Bingkai iPad On' : 'Layar Penuh'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
