import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type }) => {
  let colorClass = '';
  let Icon = Wallet;

  if (type === 'income') {
    colorClass = 'text-green-600';
    Icon = ArrowUpCircle;
  } else if (type === 'expense') {
    colorClass = 'text-red-600';
    Icon = ArrowDownCircle;
  } else {
    colorClass = 'text-blue-600';
    Icon = Wallet;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4 border border-gray-100">
      <div className={`p-3 rounded-full bg-gray-50 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
        <p className={`text-lg font-bold ${colorClass}`}>
          Rp {amount.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;