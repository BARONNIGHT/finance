import { Transaction } from '../types';

// Kunci penyimpanan
const USERS_KEY = 'finpro_users';
const TRANSACTIONS_PREFIX = 'finpro_transactions_';

// --- AUTH SERVICE SIMULATION ---

export interface User {
  username: string;
  name: string;
  password?: string; // In real app, never store plain text!
}

export const registerUser = (user: User): { success: boolean; message: string } => {
  try {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (users[user.username]) {
      return { success: false, message: "Username sudah digunakan." };
    }

    users[user.username] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: "Registrasi berhasil!" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
};

export const loginUser = (username: string, password: string): { success: boolean; user?: User; message: string } => {
  try {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : {};
    const user = users[username];

    if (user && user.password === password) {
      const { password, ...safeUser } = user; // Exclude password from return
      return { success: true, user: safeUser as User, message: "Login berhasil." };
    }

    return { success: false, message: "Username atau password salah." };
  } catch (error) {
    return { success: false, message: "Gagal memproses login." };
  }
};

// --- TRANSACTION SERVICE (SCOPED BY USER) ---

export const getStoredTransactions = (userId: string): Transaction[] => {
  try {
    const key = `${TRANSACTIONS_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const saveStoredTransactions = (userId: string, transactions: Transaction[]) => {
  try {
    const key = `${TRANSACTIONS_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};
