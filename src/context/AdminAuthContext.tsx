'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateDbUser } from '@/services/db';

export type AdminModule = 'barbearia' | 'manicure';

interface AdminAuthContextType {
  isAuthenticated: (module: AdminModule) => boolean;
  login: (module: AdminModule, user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: (module: AdminModule) => void;
  isReady: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'los_santos_admin_sessions';

// Credenciais padrão (podem ser sobrescritas por variáveis de ambiente)
const CREDENTIALS = {
  barbearia: {
    users: [
      (process.env.NEXT_PUBLIC_ADMIN_BARBEARIA_USER || 'barbearia').toLowerCase(),
      'admin.barbearia',
    ],
    pass: process.env.NEXT_PUBLIC_ADMIN_BARBEARIA_PASS || 'barbearia123',
    label: 'Barbearia & Loja',
  },
  manicure: {
    users: [
      (process.env.NEXT_PUBLIC_ADMIN_MANICURE_USER || 'manicure').toLowerCase(),
      'admin.manicure',
    ],
    pass: process.env.NEXT_PUBLIC_ADMIN_MANICURE_PASS || 'manicure123',
    label: 'Manicure',
  },
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<{ barbearia: boolean; manicure: boolean }>({
    barbearia: false,
    manicure: false,
  });
  const [isReady, setIsReady] = useState(false);

  // Carrega sessões salvas no localStorage após montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => {
          setSessions({
            barbearia: Boolean(parsed.barbearia),
            manicure: Boolean(parsed.manicure),
          });
          setIsReady(true);
        });
      } else {
        queueMicrotask(() => {
          setIsReady(true);
        });
      }
    } catch {
      queueMicrotask(() => {
        setIsReady(true);
      });
    }
  }, []);

  const login = async (module: AdminModule, user: string, pass: string) => {
    // 1. Tenta autenticar diretamente no Supabase na tabela isolada ls_users
    const dbResult = await authenticateDbUser(user, pass, module);

    if (dbResult.success) {
      const updated = { ...sessions, [module]: true };
      setSessions(updated);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { success: true };
    }

    // Se o banco retornou um erro específico (ex: usuário não encontrado, senha incorreta ou sem permissão de cargo)
    if (dbResult.error && dbResult.error !== 'SUPABASE_OFFLINE') {
      return {
        success: false,
        error: dbResult.error,
      };
    }

    // 2. Fallback offline: caso o Supabase não esteja configurado ou a tabela ainda não tenha sido criada
    const config = CREDENTIALS[module];
    const normalizedUser = user.trim().toLowerCase();

    const isUserValid = config.users.includes(normalizedUser);
    const isPassValid = pass === config.pass;

    if (isUserValid && isPassValid) {
      const updated = { ...sessions, [module]: true };
      setSessions(updated);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { success: true };
    }

    return {
      success: false,
      error: `Usuário ou senha incorretos para o painel de ${config.label}.`,
    };
  };

  const logout = (module: AdminModule) => {
    const updated = { ...sessions, [module]: false };
    setSessions(updated);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isAuthenticated = (module: AdminModule) => {
    return Boolean(sessions[module]);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, isReady }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser utilizado dentro de AdminAuthProvider');
  }
  return context;
}
