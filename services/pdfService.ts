import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction } from '../types';

export const generatePDFReport = (transactions: Transaction[], periodTitle: string) => {
  // Use 'any' to bypass TypeScript errors regarding missing properties on jsPDF type
  const doc: any = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text("FINPRO - Laporan Keuangan", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Periode: ${periodTitle}`, 14, 30);
  doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, 14, 36);

  // Summary Calculation
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Summary Table
  autoTable(doc, {
    startY: 45,
    head: [['Ringkasan', 'Jumlah']],
    body: [
      ['Total Pemasukan', `Rp ${totalIncome.toLocaleString('id-ID')}`],
      ['Total Pengeluaran', `Rp ${totalExpense.toLocaleString('id-ID')}`],
      ['Sisa Saldo', `Rp ${balance.toLocaleString('id-ID')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    }
  });

  // Detailed Transactions
  doc.text("Rincian Transaksi", 14, doc.lastAutoTable.finalY + 15);

  const tableRows = transactions.map(t => [
    format(new Date(t.date), 'dd/MM/yyyy', { locale: id }),
    t.category,
    t.description,
    t.type === 'income' ? `Rp ${t.amount.toLocaleString('id-ID')}` : '-',
    t.type === 'expense' ? `Rp ${t.amount.toLocaleString('id-ID')}` : '-',
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Tanggal', 'Kategori', 'Catatan', 'Masuk', 'Keluar']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Blue 500
    columnStyles: {
      3: { halign: 'right', textColor: [22, 163, 74] }, // Green text
      4: { halign: 'right', textColor: [220, 38, 38] }, // Red text
    },
    styles: { fontSize: 9 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Dicetak melalui aplikasi FINPRO', 14, doc.internal.pageSize.height - 10);
    doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }

  doc.save(`Laporan_Keuangan_${periodTitle.replace(/\s+/g, '_')}.pdf`);
};