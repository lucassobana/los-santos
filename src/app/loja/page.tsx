'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Flex,
  Select,
} from '@chakra-ui/react';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { useCart } from '@/context/CartContext';
import { getDbProducts } from '@/services/db';

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const { totalItems, totalPrice, openCart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      const data = await getDbProducts('roupas');
      setProducts(data);
    }
    loadProducts();
  }, []);

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['Todas', ...Array.from(set)];
  }, [products]);

  // Filtragem e Ordenação
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'Todas' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0; // relevance
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const searchBg = '#161922';
  const borderColor = '#232936';

  return (
    <Box pb={24}>
      {/* Header Banner */}
      <Box
        pt={{ base: 8, md: 16 }}
        pb={{ base: 8, md: 12 }}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg="#0f1118"
      >
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap={5}
          >
            <Box>
              <Badge colorScheme="yellow" mb={2} px={2} py={0.5} borderRadius="md" fontSize="2xs">
                Catálogo Oficial
              </Badge>
              <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontWeight="900" letterSpacing="tight">
                Loja de Roupas
              </Heading>
              <Text color="gray.400" mt={2} fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} maxW="xl">
                Selecione as peças, escolha o tamanho e adicione à sacola. Para finalizar, o pedido é enviado diretamente para o WhatsApp da loja para combinar a entrega!
              </Text>
            </Box>

            {/* Banner de aviso rápido de WhatsApp */}
            <Box
              p={{ base: 3, sm: 4 }}
              borderRadius="2xl"
              bg="#161922"
              border="1px solid"
              borderColor="brand.500"
              boxShadow="0 4px 20px rgba(217, 166, 71, 0.15)"
              w={{ base: '100%', md: 'auto' }}
            >
              <HStack spacing={3}>
                <Box
                  p={2}
                  borderRadius="xl"
                  bg="brand.500"
                  color="black"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiShoppingBag size={18} />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="brand.400">
                    SEM PAGAMENTO NO SITE
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    Tudo finalizado diretamente com o atendente via WhatsApp
                  </Text>
                </Box>
              </HStack>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Barra de Filtros e Busca */}
      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} mt={{ base: 6, md: 8 }}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={4}
          justify="space-between"
          align={{ base: 'stretch', lg: 'center' }}
        >
          {/* Busca por texto */}
          <InputGroup maxW={{ base: '100%', lg: '380px' }}>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nome, modelo..."
              borderRadius="xl"
              bg={searchBg}
              borderColor={borderColor}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fontSize="sm"
            />
          </InputGroup>

          {/* Categorias (Pills com rolagem horizontal no mobile) */}
          <HStack
            spacing={2}
            overflowX="auto"
            py={1}
            px={1}
            maxW={{ base: '100%', lg: '60%' }}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Button
                  key={cat}
                  size="sm"
                  borderRadius="full"
                  variant={isSelected ? 'solid' : 'ghost'}
                  bg={isSelected ? 'brand.500' : 'transparent'}
                  color={isSelected ? 'black' : 'gray.300'}
                  border="1px solid"
                  borderColor={isSelected ? 'brand.500' : borderColor}
                  _hover={{
                    bg: isSelected ? 'brand.400' : 'whiteAlpha.100',
                  }}
                  onClick={() => setSelectedCategory(cat)}
                  flexShrink={0}
                  fontSize="xs"
                >
                  {cat}
                </Button>
              );
            })}
          </HStack>

          {/* Ordenação */}
          <Select
            maxW={{ base: '100%', lg: '180px' }}
            borderRadius="xl"
            size="sm"
            bg={searchBg}
            borderColor={borderColor}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            fontSize="xs"
          >
            <option value="relevance">Mais Relevantes</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="name-asc">Nome (A - Z)</option>
          </Select>
        </Flex>

        {/* Informações da Busca */}
        <Flex justify="space-between" align="center" mt={5} mb={4}>
          <Text fontSize="xs" color="gray.400">
            Mostrando <b>{filteredProducts.length}</b> {filteredProducts.length === 1 ? 'peça' : 'peças'}
          </Text>
        </Flex>

        {/* Grid de Produtos */}
        {filteredProducts.length === 0 ? (
          <Box
            textAlign="center"
            py={14}
            px={4}
            borderRadius="2xl"
            border="1px dashed"
            borderColor={borderColor}
            my={6}
          >
            <Text fontSize="md" fontWeight="600" color="gray.300">
              Nenhuma peça encontrada
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Tente buscar por outro termo ou selecione a categoria &quot;Todas&quot;.
            </Text>
            <Button
              mt={4}
              size="sm"
              variant="outline"
              colorScheme="yellow"
              borderRadius="xl"
              onClick={() => {
                setSelectedCategory('Todas');
                setSearchQuery('');
              }}
            >
              Limpar Filtros
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} spacing={{ base: 4, sm: 6, md: 8 }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Floating Cart Indicator na parte inferior quando houver itens */}
      {totalItems > 0 && (
        <Box
          position="fixed"
          bottom={{ base: 4, sm: 6 }}
          left="50%"
          transform="translateX(-50%)"
          zIndex={90}
          w={{ base: 'calc(100% - 24px)', sm: '460px' }}
        >
          <Flex
            bg="#161922"
            border="1px solid"
            borderColor="brand.500"
            borderRadius="2xl"
            p={{ base: 3, sm: 3.5 }}
            boxShadow="0 10px 30px rgba(0,0,0,0.7)"
            align="center"
            justify="space-between"
            backdropFilter="blur(16px)"
          >
            <HStack spacing={2.5}>
              <Box
                p={2}
                borderRadius="lg"
                bg="brand.500"
                color="black"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiShoppingBag size={18} />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="700" color="white">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'} na sacola
                </Text>
                <Text fontSize="xs" color="brand.400" fontWeight="800">
                  Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                </Text>
              </Box>
            </HStack>

            <Button
              size="sm"
              bg="brand.500"
              color="black"
              _hover={{ bg: 'brand.400' }}
              onClick={openCart}
              borderRadius="xl"
              fontWeight="700"
              px={{ base: 3, sm: 4 }}
              fontSize="xs"
            >
              Ver Sacola
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
