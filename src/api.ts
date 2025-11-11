const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001';

export type Account = {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  createdAt?: string;
  updatedAt?: string;
};

export type User = { id: string; username: string; email: string; accounts: Account[] };

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || 'Request failed';
    throw new Error(msg);
  }
  return json as T;
}

export async function listUsers(): Promise<{ count: number; users: User[] }> {
  return http('/api/allusers');
}