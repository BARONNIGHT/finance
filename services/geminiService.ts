import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

export const analyzeFinances = async (transactions: Transaction[]) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });

    // Prepare a summary for the AI to avoid sending too much data if the list is huge
    // For this demo, we send the last 50 transactions or filter by current month
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);

    const summary = JSON.stringify(recentTransactions);

    const prompt = `
      Bertindaklah sebagai penasihat keuangan pribadi yang profesional namun ramah untuk aplikasi bernama FINPRO.
      
      Berikut adalah data transaksi terbaru pengguna dalam format JSON:
      ${summary}
      
      Tolong berikan analisis singkat dalam format Markdown yang mencakup:
      1. Ringkasan kondisi keuangan saat ini (Pemasukan vs Pengeluaran).
      2. Kategori pengeluaran terbesar.
      3. Saran praktis untuk penghematan atau pengelolaan uang yang lebih baik berdasarkan data tersebut.
      4. Nada bicara yang memotivasi.

      Gunakan Bahasa Indonesia yang baik dan benar.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Maaf, saya tidak dapat menganalisis data keuangan Anda saat ini. Pastikan koneksi internet Anda stabil atau coba lagi nanti.";
  }
};