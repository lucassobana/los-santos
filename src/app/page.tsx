'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Button,
  Badge,
  Flex,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FiShoppingBag, FiScissors, FiHeart, FiArrowRight } from 'react-icons/fi';
import HubCard from '@/components/HubCard';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { getDbProducts } from '@/services/db';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(INITIAL_PRODUCTS.slice(0, 3));

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getDbProducts('roupas');
        const featured = data.filter((p) => p.featured);
        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 3) : data.slice(0, 3));
      } catch (err) {
        console.warn('Erro ao carregar produtos em destaque:', err);
      }
    }
    loadFeatured();
  }, []);

  return (
    <Box pb={{ base: 12, md: 20 }}>
      {/* Hero Section */}
      <Box
        position="relative"
        pt={{ base: 8, sm: 12, md: 20 }}
        pb={{ base: 8, sm: 12, md: 16 }}
        textAlign="center"
        overflow="hidden"
      >
        {/* Glow ambient background */}
        <Box
          position="absolute"
          top="10%"
          left="50%"
          transform="translateX(-50%)"
          w={{ base: '260px', sm: '380px', md: '600px' }}
          h="260px"
          borderRadius="full"
          bg="brand.500"
          opacity={0.08}
          filter="blur(100px)"
          pointerEvents="none"
        />

        <Container maxW="container.lg" px={{ base: 4, sm: 6 }}>
          <Badge
            colorScheme="yellow"
            variant="outline"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            mb={{ base: 3, md: 4 }}
            textTransform="uppercase"
            letterSpacing="wider"
            borderColor="brand.400"
            color="brand.400"
          >
            Portal de Serviços • Los Santos
          </Badge>

          <Heading
            as="h1"
            fontSize={{ base: '2xl', sm: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight="900"
            lineHeight="1.2"
            letterSpacing="tight"
          >
            O que você deseja{' '}
            <Text
              as="span"
              bgGradient="linear(to-r, brand.300, brand.500, brand.300)"
              bgClip="text"
            >
              fazer hoje?
            </Text>
          </Heading>

          <Text
            fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
            color="gray.400"
            maxW="2xl"
            mx="auto"
            mt={{ base: 3, md: 4 }}
            lineHeight="relaxed"
          >
            Escolha uma das opções abaixo para navegar no catálogo de roupas exclusivas ou agendar seu horário com nossos profissionais.
          </Text>
        </Container>
      </Box>

      {/* Grid com as 3 Opções Principais */}
      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, sm: 5, md: 6 }}>
          {/* Opção 1: Loja de Roupas (Destaque Principal) */}
          <HubCard
            title="Loja de Roupas"
            subtitle="Moda Streetwear & Casual"
            description="Explore nosso catálogo completo de camisetas, moletons, calças e acessórios. Monte sua sacola e finalize o pedido direto pelo WhatsApp."
            href="/loja"
            icon={FiShoppingBag}
            accentColor="#d9a647"
            gradient="linear(to-r, #c58d2b, #e3be75)"
            tag="Catálogo Online"
            buttonText="Acessar Loja"
          />

          {/* Opção 2: Agendamento Barbearia */}
          <HubCard
            title="Barbearia"
            subtitle="Cortes, Barba & Visagismo"
            description="Escolha seu barbeiro de preferência, selecione o serviço e envie sua solicitação de agendamento diretamente para o WhatsApp da barbearia."
            href="/barbearia"
            icon={FiScissors}
            accentColor="#3182ce"
            gradient="linear(to-r, #2b6cb0, #4299e1)"
            tag="Agendamento Fácil"
            buttonText="Agendar Barbearia"
          />

          {/* Opção 3: Agendamento Manicure */}
          <HubCard
            title="Manicure"
            subtitle="Unhas, Fibra & Spa dos Pés"
            description="Confira os serviços de manicure tradicional, alongamento em fibra e esmaltação em gel. Agende sua sessão pelo WhatsApp com a manicure."
            href="/manicure"
            icon={FiHeart}
            accentColor="#ed64a6"
            gradient="linear(to-r, #d53f8c, #f687b3)"
            tag="Agendamento Fácil"
            buttonText="Agendar Manicure"
          />
        </SimpleGrid>

        {/* Seção Destaques da Loja (Prioridade) */}
        <Box mt={{ base: 12, md: 20 }}>
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            mb={{ base: 6, md: 8 }}
            gap={4}
          >
            <Box>
              <HStack spacing={2}>
                <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md" fontSize="2xs">
                  Mais Pedidos
                </Badge>
                <Text fontSize="2xs" color="gray.400" fontWeight="600" textTransform="uppercase">
                  Destaques da Loja de Roupas
                </Text>
              </HStack>
              <Heading as="h2" size={{ base: 'md', sm: 'lg' }} mt={1}>
                Tendências do Catálogo
              </Heading>
            </Box>

            <Link href="/loja" style={{ width: 'auto' }}>
              <Button
                variant="outline"
                colorScheme="yellow"
                color="brand.400"
                borderColor="brand.400"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: 'whiteAlpha.100' }}
                size="sm"
                borderRadius="xl"
              >
                Ver Catálogo Completo
              </Button>
            </Link>
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, sm: 6 }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
