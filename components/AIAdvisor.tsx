import React, { useState } from 'react';
import { Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (transactions.length === 0) {
        setAdvice("Belum ada data transaksi untuk dianalisis. Silakan tambahkan catatan keuangan Anda terlebih dahulu.");
        return;
    }
    setLoading(true);
    const result = await analyzeFinances(transactions);
    setAdvice(result || "Gagal mendapatkan analisis.");
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-yellow-300" />
                Analisis AI Advisor
            </h2>
        </div>

        {!advice && !loading && (
            <div className="text-center py-8">
                <p className="text-indigo-100 mb-6">
                    Dapatkan wawasan cerdas tentang pola pengeluaran Anda dan saran penghematan dari Gemini AI.
                </p>
                <button
                    onClick={handleAnalyze}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                    <Sparkles size={18} />
                    Analisa Sekarang
                </button>
            </div>
        )}

        {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="animate-spin text-white" size={32} />
                <p className="text-indigo-100 animate-pulse">Sedang menganalisis data keuangan Anda...</p>
            </div>
        )}

        {advice && !loading && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-sm leading-relaxed shadow-inner text-indigo-50">
                <div className="prose prose-invert prose-sm max-w-none">
                     {/* Simple markdown rendering for bold/lists */}
                    {advice.split('\n').map((line, i) => {
                         if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace(/#/g, '')}</h3>
                         if (line.startsWith('**')) return <p key={i} className="font-bold mb-2">{line.replace(/\*\*/g, '')}</p>
                         if (line.startsWith('-')) return <li key={i} className="ml-4 mb-1 list-disc">{line.replace('-', '')}</li>
                         if (line.match(/^\d\./)) return <li key={i} className="ml-4 mb-1 list-decimal">{line.replace(/^\d\./, '')}</li>
                         return <p key={i} className="mb-2">{line}</p>
                    })}
                </div>
                <button
                    onClick={handleAnalyze}
                    className="mt-6 text-xs font-medium text-indigo-200 hover:text-white flex items-center gap-1 transition-colors"
                >
                    <RefreshCw size={12} />
                    Analisa Ulang
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;