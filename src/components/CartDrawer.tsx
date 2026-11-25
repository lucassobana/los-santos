'use client';

import React, { useState } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Image,
  Text,
  IconButton,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { generateClothingWhatsAppUrl } from '@/lib/whatsapp';
import { createDbOrder } from '@/services/db';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const toast = useToast();

  const cardBg = '#161922';
  const borderColor = '#232936';

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Sacola vazia',
        description: 'Adicione pelo menos um item à sacola para finalizar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const cartForWhatsApp = items.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      size: i.selectedSize,
    }));

    try {
      // Registra o pedido no Supabase com status pendente
      createDbOrder({
        customerName: customerName.trim() || 'Cliente WhatsApp',
        totalAmount: totalPrice,
        items: cartForWhatsApp.map((it) => ({
          productId: it.id,
          productName: it.name,
          quantity: it.quantity,
          price: it.price,
          size: it.size,
        })),
        date: new Date().toISOString().split('T')[0],
        status: 'pendente',
        notes: customerNotes ? `[Loja de Roupas] ${customerNotes}` : '[Loja de Roupas]',
      });
    } catch (err) {
      console.warn('Erro ao salvar pedido na base de dados:', err);
    }

    const url = generateClothingWhatsAppUrl(cartForWhatsApp, customerName, customerNotes);
    window.open(url, '_blank');

    toast({
      title: 'Redirecionando para o WhatsApp!',
      description: 'Conclua seu pedido enviando a mensagem preparada no WhatsApp da loja.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Drawer isOpen={isCartOpen} placement="right" onClose={closeCart} size={{ base: 'full', sm: 'md' }}>
      <DrawerOverlay backdropFilter="blur(6px)" />
      <DrawerContent bg="#12151e" borderLeft={{ base: 'none', sm: '1px solid' }} borderColor={borderColor}>
        <DrawerCloseButton color="gray.400" top={4} right={4} />
        <DrawerHeader borderBottom="1px solid" borderColor={borderColor} py={4}>
          <Flex alignItems="center" gap={2}>
            <FiShoppingBag color="#d9a647" />
            <Text fontSize={{ base: 'md', sm: 'lg' }} fontWeight="700">
              Sua Sacola de Compras
            </Text>
            {items.length > 0 && (
              <Badge colorScheme="yellow" borderRadius="full" px={2} fontSize="xs">
                {items.reduce((acc, i) => acc + i.quantity, 0)} itens
              </Badge>
            )}
          </Flex>
        </DrawerHeader>

        <DrawerBody px={{ base: 4, sm: 6 }} py={4}>
          {items.length === 0 ? (
            <Flex direction="column" align="center" justify="center" h="70%" textAlign="center" gap={4}>
              <Box p={6} borderRadius="full" bg="whiteAlpha.50" color="gray.500">
                <FiShoppingBag size={48} />
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="600" color="gray.300">
                  Sua sacola está vazia
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Explore o catálogo de roupas e escolha suas peças favoritas.
                </Text>
              </Box>
              <Button colorScheme="yellow" bg="brand.500" color="black" onClick={closeCart} size="sm">
                Explorar Catálogo
              </Button>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {items.map((item) => (
                <Box
                  key={`${item.product.id}-${item.selectedSize}`}
                  p={3}
                  borderRadius="xl"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <HStack spacing={3} align="start">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      boxSize={{ base: '64px', sm: '72px' }}
                      objectFit="cover"
                      borderRadius="lg"
                    />
                    <Box flex={1}>
                      <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                        {item.product.name}
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <Badge size="sm" variant="subtle" colorScheme="yellow">
                          Tam: {item.selectedSize}
                        </Badge>
                        <Text fontSize="xs" color="gray.400">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" mt={3}>
                        {/* Stepper +/- */}
                        <HStack
                          spacing={1}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          px={1}
                          bg="#0b0d13"
                        >
                          <IconButton
                            aria-label="Diminuir"
                            icon={<FiMinus size={12} />}
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)
                            }
                          />
                          <Text fontSize="xs" fontWeight="700" px={2}>
                            {item.quantity}
                          </Text>
                          <IconButton
                            aria-label="Aumentar"
                            icon={<FiPlus size={12} />}
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)
                            }
                          />
                        </HStack>

                        <HStack spacing={2}>
                          <Text fontWeight="700" fontSize="sm" color="brand.400">
                            R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </Text>
                          <IconButton
                            aria-label="Remover item"
                            icon={<FiTrash2 size={14} />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeItem(item.product.id, item.selectedSize)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  </HStack>
                </Box>
              ))}

              <Divider my={3} borderColor={borderColor} />

              {/* Informações adicionais para o WhatsApp */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.400" mb={3} textTransform="uppercase">
                  Dados para o Pedido (Opcional)
                </Text>
                <VStack spacing={3}>
                  <FormControl size="sm">
                    <FormLabel fontSize="xs" mb={1} color="gray.300">
                      Seu Nome
                    </FormLabel>
                    <Input
                      placeholder="Ex: João da Silva"
                      size="sm"
                      borderRadius="lg"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl size="sm">
                    <FormLabel fontSize="xs" mb={1} color="gray.300">
                      Observações / Endereço de Entrega
                    </FormLabel>
                    <Textarea
                      placeholder="Ex: Entregar no bairro centro, ou prefiro retirar na loja..."
                      size="sm"
                      rows={2}
                      borderRadius="lg"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter
            borderTop="1px solid"
            borderColor={borderColor}
            flexDirection="column"
            gap={3}
            pb={{ base: 6, sm: 4 }}
          >
            <Flex justify="space-between" w="100%" align="center">
              <Box>
                <Text fontSize="xs" color="gray.400">
                  Total Estimado
                </Text>
                <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="800" color="brand.400">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </Text>
              </Box>
              <Button
                variant="ghost"
                size="xs"
                colorScheme="red"
                leftIcon={<FiTrash2 />}
                onClick={clearCart}
              >
                Limpar
              </Button>
            </Flex>

            <Button
              leftIcon={<FaWhatsapp size={20} />}
              w="100%"
              size="lg"
              bg="#25D366"
              color="white"
              borderRadius="xl"
              fontWeight="700"
              _hover={{
                bg: '#1ebc57',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
              }}
              onClick={handleCheckout}
            >
              Pedir via WhatsApp
            </Button>
            <Text fontSize="2xs" color="gray.500" textAlign="center">
              O pagamento e a entrega serão combinados diretamente no WhatsApp da loja.
            </Text>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
