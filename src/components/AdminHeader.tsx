'use client';

import React from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  Button,
  Badge,
  Text,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  FiGrid,
  FiCalendar,
  FiDollarSign,
  FiPlusSquare,
  FiExternalLink,
  FiScissors,
  FiHeart,
  FiLogOut,
} from 'react-icons/fi';
import { useAdminAuth } from '@/context/AdminAuthContext';

export type AdminTab = 'dashboard' | 'agenda' | 'faturamento' | 'cadastros';

interface AdminHeaderProps {
  currentModule: 'barbearia_loja' | 'manicure';
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  agendaCount?: number;
  cadastrosCount?: number;
}

export default function AdminHeader({
  currentModule,
  activeTab,
  onTabChange,
  agendaCount,
  cadastrosCount,
}: AdminHeaderProps) {
  const isManicure = currentModule === 'manicure';
  const themeColor = isManicure ? 'pink' : 'yellow';
  const activeColor = isManicure ? '#ed64a6' : '#d9a647';
  const borderColor = '#232936';
  const { logout } = useAdminAuth();
  const toast = useToast();

  const handleLogout = () => {
    logout(isManicure ? 'manicure' : 'barbearia');
    toast({
      title: 'Sessão encerrada',
      description: `Você saiu do painel de ${isManicure ? 'Manicure' : 'Barbearia & Loja'}.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={90}
      bg="rgba(11, 13, 19, 0.96)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      {/* Linha Superior: Logo, Identificação e Alternador de Painel */}
      <Box borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.05)" py={3}>
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            {/* Logo Admin */}
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                borderRadius="lg"
                bgGradient={
                  isManicure
                    ? 'linear(to-br, pink.400, pink.600)'
                    : 'linear(to-br, brand.400, brand.600)'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="900"
                color="black"
                fontSize="sm"
              >
                LS
              </Box>
              <Box>
                <HStack spacing={2}>
                  <Text fontWeight="900" fontSize="sm" letterSpacing="wider" color="white">
                    LOS SANTOS
                  </Text>
                  <Badge
                    colorScheme={themeColor}
                    variant="subtle"
                    borderRadius="md"
                    px={2}
                    py={0.5}
                    fontSize="2xs"
                    fontWeight="800"
                  >
                    {isManicure ? 'PAINEL MANICURE' : 'BARBEARIA & LOJA'}
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            {/* Ações Rápidas: Alternar Painel, Link para o Site e Logout */}
            <HStack spacing={2}>
              {isManicure ? (
                <Link href="/admin">
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="yellow"
                    borderRadius="lg"
                    leftIcon={<FiScissors />}
                    fontSize="2xs"
                  >
                    Painel Barbearia & Loja
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/manicure">
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="pink"
                    borderRadius="lg"
                    leftIcon={<FiHeart />}
                    fontSize="2xs"
                  >
                    Painel Manicure
                  </Button>
                </Link>
              )}

              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                  rightIcon={<FiExternalLink size={11} />}
                  fontSize="2xs"
                >
                  Ver Site
                </Button>
              </Link>

              <Button
                size="xs"
                variant="ghost"
                color="red.400"
                _hover={{ bg: 'red.900', color: 'red.200' }}
                leftIcon={<FiLogOut size={12} />}
                fontSize="2xs"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Linha Inferior: 3 ABAS PRINCIPAIS (Agenda, Faturamento, Cadastros) */}
      <Box py={2}>
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
          <Flex
            overflowX="auto"
            gap={2}
            py={0.5}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* ABA 1: DASHBOARD */}
            <Button
              size="sm"
              borderRadius="xl"
              variant={activeTab === 'dashboard' ? 'solid' : 'ghost'}
              bg={activeTab === 'dashboard' ? activeColor : 'transparent'}
              color={activeTab === 'dashboard' ? (isManicure ? 'white' : 'black') : 'gray.400'}
              _hover={{
                bg: activeTab === 'dashboard' ? activeColor : 'whiteAlpha.100',
                color: activeTab === 'dashboard' ? (isManicure ? 'white' : 'black') : 'white',
              }}
              leftIcon={<FiGrid size={15} />}
              onClick={() => onTabChange('dashboard')}
              fontSize="xs"
              fontWeight="700"
              px={4}
            >
              Dashboard
              {agendaCount !== undefined && (
                <Badge
                  ml={2}
                  borderRadius="full"
                  px={1.5}
                  fontSize="2xs"
                  bg={activeTab === 'dashboard' ? (isManicure ? 'whiteAlpha.300' : 'blackAlpha.300') : '#232936'}
                  color={activeTab === 'dashboard' ? (isManicure ? 'white' : 'black') : 'gray.300'}
                >
                  {agendaCount}
                </Badge>
              )}
            </Button>

            {/* ABA 2: AGENDA (CALENDÁRIO DE HORÁRIOS) */}
            <Button
              size="sm"
              borderRadius="xl"
              variant={activeTab === 'agenda' ? 'solid' : 'ghost'}
              bg={activeTab === 'agenda' ? activeColor : 'transparent'}
              color={activeTab === 'agenda' ? (isManicure ? 'white' : 'black') : 'gray.400'}
              _hover={{
                bg: activeTab === 'agenda' ? activeColor : 'whiteAlpha.100',
                color: activeTab === 'agenda' ? (isManicure ? 'white' : 'black') : 'white',
              }}
              leftIcon={<FiCalendar size={15} />}
              onClick={() => onTabChange('agenda')}
              fontSize="xs"
              fontWeight="700"
              px={4}
            >
              Agenda
            </Button>

            {/* ABA 2: FATURAMENTO */}
            <Button
              size="sm"
              borderRadius="xl"
              variant={activeTab === 'faturamento' ? 'solid' : 'ghost'}
              bg={activeTab === 'faturamento' ? activeColor : 'transparent'}
              color={activeTab === 'faturamento' ? (isManicure ? 'white' : 'black') : 'gray.400'}
              _hover={{
                bg: activeTab === 'faturamento' ? activeColor : 'whiteAlpha.100',
                color: activeTab === 'faturamento' ? (isManicure ? 'white' : 'black') : 'white',
              }}
              leftIcon={<FiDollarSign size={15} />}
              onClick={() => onTabChange('faturamento')}
              fontSize="xs"
              fontWeight="700"
              px={4}
            >
              Faturamento
            </Button>

            {/* ABA 3: CADASTROS (SERVIÇOS, ROUPAS, PROFISSIONAIS) */}
            <Button
              size="sm"
              borderRadius="xl"
              variant={activeTab === 'cadastros' ? 'solid' : 'ghost'}
              bg={activeTab === 'cadastros' ? activeColor : 'transparent'}
              color={activeTab === 'cadastros' ? (isManicure ? 'white' : 'black') : 'gray.400'}
              _hover={{
                bg: activeTab === 'cadastros' ? activeColor : 'whiteAlpha.100',
                color: activeTab === 'cadastros' ? (isManicure ? 'white' : 'black') : 'white',
              }}
              leftIcon={<FiPlusSquare size={15} />}
              onClick={() => onTabChange('cadastros')}
              fontSize="xs"
              fontWeight="700"
              px={4}
            >
              {isManicure ? 'Cadastros (Procedimentos, Esmaltes, Equipe)' : 'Cadastros (Serviços, Roupas, Barbeiros)'}
              {cadastrosCount !== undefined && (
                <Badge
                  ml={2}
                  borderRadius="full"
                  px={1.5}
                  fontSize="2xs"
                  bg={activeTab === 'cadastros' ? (isManicure ? 'whiteAlpha.300' : 'blackAlpha.300') : '#232936'}
                  color={activeTab === 'cadastros' ? (isManicure ? 'white' : 'black') : 'gray.300'}
                >
                  {cadastrosCount}
                </Badge>
              )}
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
