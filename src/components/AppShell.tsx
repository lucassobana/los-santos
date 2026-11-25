'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDedicated = pathname.startsWith('/admin') || pathname.startsWith('/confirmar');

  if (isDedicated) {
    // Páginas com header dedicado (admin e confirmação direta) não exibem navbar/footer públicos
    return (
      <Box minH="100vh" bg="#0b0d13">
        {children}
      </Box>
    );
  }

  // Páginas públicas com Navbar, Footer e Drawer do Carrinho
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <Navbar />
      <Box as="main" flex={1}>
        {children}
      </Box>
      <Footer />
      <CartDrawer />
    </Box>
  );
}
