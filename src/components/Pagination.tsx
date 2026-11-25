'use client';

import React from 'react';
import {
  Flex,
  HStack,
  Text,
  Button,
  IconButton,
  Select,
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  colorScheme?: string;
  accentColor?: string;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  colorScheme = 'yellow',
  accentColor = '#d9a647',
  itemsPerPageOptions = [5, 10, 20, 50],
  itemLabel = 'agendamentos',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const borderColor = '#232936';

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calcula quais botões numéricos de página exibir (janela de até 5 páginas)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align="center"
      pt={4}
      mt={4}
      borderTop="1px solid"
      borderColor={borderColor}
      gap={4}
      w="100%"
    >
      {/* Informações de contagem e seletor por página */}
      <HStack spacing={3} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
        <Text fontSize="xs" color="gray.400">
          Mostrando{' '}
          <Text as="span" color="white" fontWeight="700">
            {startItem} - {endItem}
          </Text>{' '}
          de{' '}
          <Text as="span" color="white" fontWeight="700">
            {totalItems}
          </Text>{' '}
          {itemLabel}
        </Text>

        {onItemsPerPageChange && (
          <HStack spacing={1.5}>
            <Text fontSize="2xs" color="gray.500">
              Exibir:
            </Text>
            <Select
              size="xs"
              w="70px"
              bg="#0b0d13"
              borderColor={borderColor}
              color="gray.200"
              borderRadius="lg"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </HStack>
        )}
      </HStack>

      {/* Controles de Navegação (Primeira, Anterior, Números, Próxima, Última) */}
      <HStack spacing={{ base: 1, sm: 1.5 }} justify="center">
        {/* Botão Primeira Página (<<) */}
        <IconButton
          aria-label="Primeira página"
          icon={<FiChevronsLeft size={13} />}
          size="sm"
          w={{ base: '28px', sm: '34px' }}
          h={{ base: '28px', sm: '34px' }}
          minW={{ base: '28px', sm: '34px' }}
          display={{ base: 'none', sm: 'inline-flex' }}
          variant="outline"
          borderColor={borderColor}
          color="gray.400"
          borderRadius="lg"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
        />

        {/* Botão Página Anterior (<) */}
        <IconButton
          aria-label="Página anterior"
          icon={<FiChevronLeft size={13} />}
          size="sm"
          w={{ base: '28px', sm: '34px' }}
          h={{ base: '28px', sm: '34px' }}
          minW={{ base: '28px', sm: '34px' }}
          variant="outline"
          borderColor={borderColor}
          color="gray.400"
          borderRadius="lg"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        />

        {/* Botões Numéricos de Página */}
        {pageNumbers.map((p) => {
          const isActive = p === currentPage;
          return (
            <Button
              key={p}
              size="sm"
              w={{ base: '28px', sm: '34px' }}
              h={{ base: '28px', sm: '34px' }}
              minW={{ base: '28px', sm: '34px' }}
              p={0}
              fontSize={{ base: '2xs', sm: 'xs' }}
              fontWeight={isActive ? '800' : '600'}
              borderRadius="lg"
              variant={isActive ? 'solid' : 'outline'}
              bg={isActive ? accentColor : 'transparent'}
              color={isActive ? (colorScheme === 'pink' ? 'white' : 'black') : 'gray.300'}
              borderColor={isActive ? accentColor : borderColor}
              _hover={{
                bg: isActive ? accentColor : 'whiteAlpha.100',
                color: isActive ? (colorScheme === 'pink' ? 'white' : 'black') : 'white',
              }}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}

        {/* Botão Próxima Página (>) */}
        <IconButton
          aria-label="Próxima página"
          icon={<FiChevronRight size={13} />}
          size="sm"
          w={{ base: '28px', sm: '34px' }}
          h={{ base: '28px', sm: '34px' }}
          minW={{ base: '28px', sm: '34px' }}
          variant="outline"
          borderColor={borderColor}
          color="gray.400"
          borderRadius="lg"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        />

        {/* Botão Última Página (>>) */}
        <IconButton
          aria-label="Última página"
          icon={<FiChevronsRight size={13} />}
          size="sm"
          w={{ base: '28px', sm: '34px' }}
          h={{ base: '28px', sm: '34px' }}
          minW={{ base: '28px', sm: '34px' }}
          display={{ base: 'none', sm: 'inline-flex' }}
          variant="outline"
          borderColor={borderColor}
          color="gray.400"
          borderRadius="lg"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      </HStack>
    </Flex>
  );
}
