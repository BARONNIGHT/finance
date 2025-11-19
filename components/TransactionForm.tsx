import React, { useState } from 'react';
import { TransactionType, CATEGORIES } from '../types';
import { PlusCircle, MinusCircle, Save } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (transaction: any) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Tambah Transaksi
      </h2>

      {/* Type Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            type === 'expense' 
              ? 'bg-white text-red-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MinusCircle size={16} />
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            type === 'income' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PlusCircle size={16} />
          Pemasukan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold transition-all"
            placeholder="0"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none bg-white transition-all"
                    required
                >
                    <option value="" disabled>Pilih...</option>
                    {CATEGORIES[type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Catatan (Opsional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Contoh: Makan siang nasi padang"
          />
        </div>

        <div className="pt-4 flex gap-3">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
                Batal
            </button>
            <button
                type="submit"
                className="flex-[2] bg-primary hover:bg-emerald-600 text-white py-3 rounded-xl font-medium shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
                <Save size={18} />
                Simpan Transaksi
            </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;