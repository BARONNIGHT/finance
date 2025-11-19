import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from './types';
import { getStoredTransactions, saveStoredTransactions, User } from './services/storageService';
import { generatePDFReport } from './services/pdfService';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import AIAdvisor from './components/AIAdvisor';
import LoginScreen from './components/LoginScreen';

import { 
  LayoutDashboard, 
  List, 
  FileText, 
  Plus, 
  Download,
  Wallet,
  LogOut,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

enum Tab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  REPORT = 'report'
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filter state
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Initialize User session
  useEffect(() => {
    const savedSession = localStorage.getItem('finpro_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  // Load transactions when user changes
  useEffect(() => {
    if (user) {
      const data = getStoredTransactions(user.username);
      setTransactions(data);
      // Save session persistence
      localStorage.setItem('finpro_session', JSON.stringify(user));
    } else {
      setTransactions([]);
      localStorage.removeItem('finpro_session');
    }
  }, [user]);

  // Save to storage on transaction change (only if user is logged in)
  useEffect(() => {
    if (user) {
      saveStoredTransactions(user.username, transactions);
    }
  }, [transactions, user]);

  const handleLogout = () => {
    setUser(null);
    setActiveTab(Tab.DASHBOARD);
  };

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...data, id: uuidv4() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Computed stats for the selected month
  const stats = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense, count: monthlyTransactions.length };
  }, [transactions, currentMonth]);

  // Chart Data
  const chartData = useMemo(() => {
     const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
     const groups: Record<string, number> = {};
     monthlyTransactions.forEach(t => {
        groups[t.category] = (groups[t.category] || 0) + t.amount;
     });
     
     return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonth]);

  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // If no user is logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800 tracking-tight block leading-none">FINPRO</span>
              <span className="text-[10px] text-gray-500 font-medium">Hi, {user.name.split(' ')[0]}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Custom Month Picker UI */}
             <div className="relative bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer min-w-[140px] border border-transparent hover:border-gray-300">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-700 capitalize select-none">
                    {format(new Date(currentMonth), 'MMMM yyyy', { locale: id })}
                </span>
                {/* Invisible native input covering the custom UI */}
                <input 
                    type="month" 
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Ganti Periode"
                />
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* TAB: DASHBOARD */}
        {activeTab === Tab.DASHBOARD && (
          <>
            <div className="grid grid-cols-1 gap-4">
               {/* Total Balance */}
               <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  
                  <p className="text-emerald-100 text-sm font-medium mb-1 relative z-10">Sisa Saldo Bulan Ini</p>
                  <h2 className="text-3xl font-bold mb-4 relative z-10">Rp {stats.balance.toLocaleString('id-ID')}</h2>
                  <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm relative z-10">
                     <div>
                        <p className="text-xs text-emerald-100">Pemasukan</p>
                        <p className="font-semibold">Rp {stats.income.toLocaleString('id-ID')}</p>
                     </div>
                     <div className="h-8 w-[1px] bg-emerald-400/30"></div>
                     <div className="text-right">
                        <p className="text-xs text-emerald-100">Pengeluaran</p>
                        <p className="font-semibold">Rp {stats.expense.toLocaleString('id-ID')}</p>
                     </div>
                  </div>
               </div>

               {/* AI Advisor Widget */}
               <AIAdvisor transactions={transactions} />

               {/* Charts */}
               {stats.expense > 0 ? (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                   <h3 className="text-sm font-bold text-gray-700 mb-4">Distribusi Pengeluaran</h3>
                   <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mt-2">
                      {chartData.slice(0,4).map((item, i) => (
                          <div key={item.name} className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length]}}></div>
                              <span className="truncate">{item.name}</span>
                          </div>
                      ))}
                   </div>
                </div>
               ) : (
                   <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                       Belum ada pengeluaran bulan ini.
                   </div>
               )}
            </div>

            <div className="flex justify-between items-center pt-2">
                <h3 className="font-bold text-gray-800">Riwayat Terkini</h3>
                <button onClick={() => setActiveTab(Tab.HISTORY)} className="text-primary text-sm font-medium">Lihat Semua</button>
            </div>
            <TransactionList transactions={transactions} filterMonth={currentMonth} />
          </>
        )}

        {/* TAB: HISTORY */}
        {activeTab === Tab.HISTORY && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Riwayat Transaksi</h2>
            <TransactionList transactions={transactions} filterMonth={currentMonth} />
          </div>
        )}

        {/* TAB: REPORT */}
        {activeTab === Tab.REPORT && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Laporan & Ekspor</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Laporan Bulanan</h3>
                    <p className="text-sm text-gray-500">Ekspor detail transaksi bulan {format(new Date(currentMonth), 'MMMM yyyy', { locale: id })} ke dalam format PDF yang rapi.</p>
                </div>
                <button 
                    onClick={() => generatePDFReport(transactions.filter(t => t.date.startsWith(currentMonth)), format(new Date(currentMonth), 'MMMM yyyy', { locale: id }))}
                    className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Unduh PDF
                </button>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-200 p-2 rounded-full">
                        <UserIcon size={16} className="text-emerald-700" />
                    </div>
                    <div>
                        <p className="text-xs text-emerald-600 font-medium">Akun Pengguna</p>
                        <p className="text-sm font-bold text-emerald-800">{user.name}</p>
                    </div>
                </div>
                <div className="h-[1px] bg-emerald-200/50 my-2"></div>
                <ul className="space-y-2 text-sm text-emerald-700">
                    <li className="flex justify-between">
                        <span>Jumlah Transaksi</span>
                        <span className="font-medium">{stats.count}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Rata-rata Pengeluaran Harian</span>
                        <span className="font-medium">Rp {stats.count > 0 ? Math.round(stats.expense / 30).toLocaleString('id-ID') : 0}</span>
                    </li>
                </ul>
            </div>
          </div>
        )}

      </main>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 md:right-[calc(50%-220px)] bg-gray-900 text-white w-14 h-14 rounded-full shadow-xl shadow-gray-400/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus size={28} />
      </button>

      {/* Add Transaction Modal/Sheet */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300">
                <TransactionForm 
                    onAddTransaction={handleAddTransaction} 
                    onClose={() => setShowAddForm(false)} 
                />
            </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === Tab.DASHBOARD ? 'text-primary' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={20} strokeWidth={activeTab === Tab.DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          <button 
            onClick={() => setActiveTab(Tab.HISTORY)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === Tab.HISTORY ? 'text-primary' : 'text-gray-400'}`}
          >
            <List size={20} strokeWidth={activeTab === Tab.HISTORY ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Catatan</span>
          </button>
          <button 
            onClick={() => setActiveTab(Tab.REPORT)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === Tab.REPORT ? 'text-primary' : 'text-gray-400'}`}
          >
            <FileText size={20} strokeWidth={activeTab === Tab.REPORT ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Laporan</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;