import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  filterMonth?: string; // "YYYY-MM"
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, filterMonth }) => {
  const groupedTransactions = useMemo(() => {
    // Filter first
    let filtered = transactions;
    if (filterMonth) {
      filtered = transactions.filter(t => t.date.startsWith(filterMonth));
    }

    // Sort by date desc
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const dateKey = t.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [transactions, filterMonth]);

  const dates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-300" size={32} />
        </div>
        <p className="text-gray-400 font-medium">Belum ada transaksi pada periode ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map(date => {
        const dayTransactions = groupedTransactions[date];
        const totalDaily = dayTransactions.reduce((sum, t) => 
            t.type === 'income' ? sum + t.amount : sum - t.amount
        , 0);

        return (
          <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Date Header */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-semibold text-gray-700 text-sm">
                {format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: id })}
              </h3>
              <span className={`text-xs font-bold ${totalDaily >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalDaily >= 0 ? '+' : ''}Rp {totalDaily.toLocaleString('id-ID')}
              </span>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50">
              {dayTransactions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{t.category}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px] md:max-w-xs">
                            {t.description || '-'}
                        </p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;