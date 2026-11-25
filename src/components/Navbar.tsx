'use client';

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Text,
  Badge,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiShoppingBag,
  FiMenu,
  FiHome,
  FiScissors,
  FiHeart,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { WHATSAPP_NUMBERS } from '@/lib/whatsapp';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

  const navLinks = [
    { name: 'Início', href: '/', icon: FiHome },
    { name: 'Loja de Roupas', href: '/loja', badge: 'Destaque', icon: FiShoppingBag },
    { name: 'Barbearia', href: '/barbearia', icon: FiScissors },
    { name: 'Manicure', href: '/manicure', icon: FiHeart },
  ];

  return (
    <>
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={100}
        bg="rgba(11, 13, 19, 0.92)"
        backdropFilter="blur(14px)"
        borderBottom="1px solid"
        borderColor="#232936"
        transition="all 0.3s ease"
      >
        <Container maxW="container.xl" px={{ base: 3, sm: 4, md: 8 }}>
          <Flex h={{ base: 14, md: 16 }} alignItems="center" justifyContent="space-between">
            {/* Logo */}
            <Link href="/">
              <Flex alignItems="center" gap={2} cursor="pointer">
                <Box
                  w={{ base: 7, md: 8 }}
                  h={{ base: 7, md: 8 }}
                  borderRadius="lg"
                  bgGradient="linear(to-br, brand.400, brand.600)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="900"
                  color="black"
                  fontSize={{ base: 'sm', md: 'lg' }}
                  boxShadow="0 0 15px rgba(217, 166, 71, 0.4)"
                >
                  LS
                </Box>
                <Box>
                  <Text
                    fontWeight="800"
                    fontSize={{ base: 'md', md: 'lg' }}
                    letterSpacing="widest"
                    bgGradient="linear(to-r, white, gray.300)"
                    bgClip="text"
                    textTransform="uppercase"
                  >
                    Los Santos
                  </Text>
                  <Text fontSize="2xs" color="gray.400" letterSpacing="wider" mt="-1" display={{ base: 'none', sm: 'block' }}>
                    CONCEPT & STYLE
                  </Text>
                </Box>
              </Flex>
            </Link>

            {/* Links Desktop */}
            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      fontWeight="500"
                      color={isActive ? 'brand.400' : 'gray.300'}
                      bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                      _hover={{
                        bg: 'whiteAlpha.200',
                        color: 'brand.300',
                      }}
                      position="relative"
                    >
                      {link.name}
                      {link.badge && (
                        <Badge
                          ml={2}
                          fontSize="2xs"
                          colorScheme="yellow"
                          borderRadius="full"
                          px={1.5}
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </HStack>

            {/* Actions: Cart & Mobile Hamburger */}
            <HStack spacing={{ base: 2, md: 3 }}>
              {/* Botão Sacola */}
              <Button
                leftIcon={<FiShoppingBag />}
                variant="solid"
                size="sm"
                bg="brand.500"
                color="black"
                px={{ base: 3, md: 4 }}
                _hover={{
                  bg: 'brand.400',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(217, 166, 71, 0.4)',
                }}
                _active={{ bg: 'brand.600' }}
                onClick={openCart}
                position="relative"
              >
                <Text display={{ base: 'none', sm: 'inline' }}>Sacola</Text>
                {totalItems > 0 && (
                  <Badge
                    ml={{ base: 0, sm: 2 }}
                    bg="black"
                    color="white"
                    borderRadius="full"
                    px={1.5}
                    fontSize="xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Botão Menu Hamburger Mobile */}
              <IconButton
                aria-label="Abrir Menu"
                icon={<FiMenu size={20} />}
                variant="ghost"
                size="sm"
                color="gray.300"
                display={{ base: 'flex', md: 'none' }}
                onClick={onMobileOpen}
                _hover={{ bg: 'whiteAlpha.200' }}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Drawer de Navegação Mobile */}
      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose} size="xs">
        <DrawerOverlay backdropFilter="blur(6px)" />
        <DrawerContent bg="#12151e" borderRight="1px solid" borderColor="#232936">
          <DrawerCloseButton color="gray.400" top={4} right={4} />
          <DrawerHeader borderBottom="1px solid" borderColor="#232936" py={4}>
            <Flex align="center" gap={2}>
              <Box
                w={7}
                h={7}
                borderRadius="lg"
                bgGradient="linear(to-br, brand.400, brand.600)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="900"
                color="black"
                fontSize="sm"
              >
                LS
              </Box>
              <Text fontWeight="800" fontSize="md" letterSpacing="wider">
                LOS SANTOS
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody px={3} py={5}>
            <VStack spacing={2} align="stretch">
              <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase" px={3} mb={1}>
                Navegação
              </Text>

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;
                return (
                  <Link key={link.href} href={link.href} onClick={onMobileClose}>
                    <Button
                      w="100%"
                      justifyContent="space-between"
                      variant="ghost"
                      size="md"
                      fontWeight={isActive ? '700' : '500'}
                      color={isActive ? 'brand.400' : 'gray.300'}
                      bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                      _hover={{ bg: 'whiteAlpha.100', color: 'brand.300' }}
                      borderRadius="xl"
                      leftIcon={<IconComponent size={18} />}
                      px={3}
                    >
                      <Text flex={1} textAlign="left" ml={1}>
                        {link.name}
                      </Text>
                      {link.badge && (
                        <Badge
                          fontSize="2xs"
                          colorScheme="yellow"
                          borderRadius="full"
                          px={1.5}
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}

              <Divider my={4} borderColor="#232936" />

              {/* Ações Rápidas no Menu Mobile */}
              <Text fontSize="2xs" fontWeight="700" color="gray.500" textTransform="uppercase" px={3} mb={1}>
                Atendimento Rápido
              </Text>

              <Button
                leftIcon={<FaWhatsapp color="#25D366" size={18} />}
                variant="outline"
                size="sm"
                borderColor="#232936"
                color="gray.300"
                justifyContent="flex-start"
                borderRadius="xl"
                onClick={() => {
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBERS.LOJA_E_BARBEARIA.replace(/\D/g, '')}?text=${encodeURIComponent(
                      'Olá! Gostaria de falar com o atendimento da Los Santos.'
                    )}`,
                    '_blank'
                  );
                }}
              >
                Falar no WhatsApp
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
