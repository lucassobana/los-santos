'use client';

import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length > 0 ? product.sizes[0] : 'Único'
  );
  const [isAdded, setIsAdded] = useState(false);
  const toast = useToast();

  const cardBg = '#161922';
  const borderColor = '#232936';

  const handleAddToCart = () => {
    addItem(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);

    toast({
      title: 'Adicionado à sacola!',
      description: `${product.name} (Tam: ${selectedSize})`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
        borderColor: 'brand.500',
      }}
      display="flex"
      flexDirection="column"
      h="100%"
    >
      {/* Imagem do Produto */}
      <Box position="relative" overflow="hidden" h={{ base: '220px', sm: '260px', md: '280px' }} bg="blackAlpha.400">
        <Image
          src={product.image}
          alt={product.name}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.06)' }}
        />
        <Badge
          position="absolute"
          top={3}
          left={3}
          bg="rgba(11, 13, 19, 0.85)"
          color="white"
          borderRadius="full"
          px={2.5}
          py={1}
          fontSize="2xs"
          backdropFilter="blur(6px)"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          {product.category}
        </Badge>
        {product.featured && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            bg="brand.500"
            color="black"
            borderRadius="full"
            px={2}
            py={0.5}
            fontWeight="700"
            fontSize="2xs"
          >
            DESTAQUE
          </Badge>
        )}
      </Box>

      {/* Conteúdo */}
      <VStack p={{ base: 4, sm: 5 }} align="stretch" spacing={3} flex={1} justify="space-between">
        <Box>
          <Text fontWeight="700" fontSize={{ base: 'sm', sm: 'md' }} noOfLines={1} title={product.name}>
            {product.name}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1} noOfLines={2}>
            {product.description}
          </Text>
        </Box>

        <Box>
          {/* Seleção de Tamanho */}
          <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase" mb={1.5}>
            Tamanho Disponível:
          </Text>
          <HStack spacing={1.5} wrap="wrap">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <Button
                  key={size}
                  size="xs"
                  variant={isSelected ? 'solid' : 'outline'}
                  bg={isSelected ? 'brand.500' : 'transparent'}
                  color={isSelected ? 'black' : 'gray.300'}
                  borderColor={isSelected ? 'brand.500' : borderColor}
                  _hover={{
                    borderColor: 'brand.400',
                  }}
                  onClick={() => setSelectedSize(size)}
                  minW="32px"
                  h="28px"
                  borderRadius="md"
                >
                  {size}
                </Button>
              );
            })}
          </HStack>
        </Box>

        <Box pt={2}>
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontSize="xs" color="gray.400">
              Valor
            </Text>
            <Text fontSize={{ base: 'lg', sm: 'xl' }} fontWeight="800" color="brand.400">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </Text>
          </Flex>

          <Button
            leftIcon={isAdded ? <FiCheck /> : <FiShoppingBag />}
            w="100%"
            size="sm"
            bg={isAdded ? 'green.500' : 'brand.500'}
            color={isAdded ? 'white' : 'black'}
            _hover={{
              bg: isAdded ? 'green.600' : 'brand.400',
              transform: 'translateY(-1px)',
            }}
            _active={{ bg: 'brand.600' }}
            onClick={handleAddToCart}
          >
            {isAdded ? 'Adicionado!' : 'Adicionar à Sacola'}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
