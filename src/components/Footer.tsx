'use client';

import React from 'react';
import {
  Box,
  Container,
  Text,
  HStack,
  Flex,
  Badge,
} from '@chakra-ui/react';
import Link from 'next/link';

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="#07090e"
      borderTop="1px solid"
      borderColor="#232936"
      mt="auto"
      py={{ base: 8, md: 10 }}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={6}
        >
          <Box>
            <Flex align="center" gap={2}>
              <Box
                w={6}
                h={6}
                borderRadius="md"
                bgGradient="linear(to-br, brand.400, brand.600)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="900"
                color="black"
                fontSize="xs"
              >
                LS
              </Box>
              <Text fontWeight="800" letterSpacing="wider" color="white">
                LOS SANTOS
              </Text>
            </Flex>
            <Text fontSize="xs" color="gray.400" mt={1}>
              Moda Streetwear • Barbearia Clássica & Moderna • Manicure Especializada
            </Text>
          </Box>

          <HStack spacing={{ base: 4, sm: 6 }} fontSize="sm" color="gray.400" wrap="wrap">
            <Link href="/loja">
              <Text _hover={{ color: 'brand.400' }}>Loja</Text>
            </Link>
            <Link href="/barbearia">
              <Text _hover={{ color: 'brand.400' }}>Barbearia</Text>
            </Link>
            <Link href="/manicure">
              <Text _hover={{ color: 'brand.400' }}>Manicure</Text>
            </Link>
          </HStack>

          <HStack spacing={4}>
            <Badge colorScheme="green" variant="subtle" px={2.5} py={1} borderRadius="full" fontSize="xs">
              Atendimento via WhatsApp
            </Badge>
          </HStack>
        </Flex>

        <Box borderTop="1px solid" borderColor="#1e232f" mt={8} pt={6}>
          <Text fontSize="2xs" color="gray.500" textAlign="center">
            © {new Date().getFullYear()} Los Santos. Todos os direitos reservados. Pedidos e agendamentos confirmados via WhatsApp.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
