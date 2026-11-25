'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Badge,
  Spinner,
  Center,
  Divider,
} from '@chakra-ui/react';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiScissors,
  FiHeart,
  FiArrowLeft,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAdminAuth, AdminModule } from '@/context/AdminAuthContext';

interface AdminAuthGuardProps {
  module: AdminModule;
  children: React.ReactNode;
}

export default function AdminAuthGuard({ module, children }: AdminAuthGuardProps) {
  const { isAuthenticated, login, isReady } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isManicure = module === 'manicure';
  const accentColor = isManicure ? 'pink.400' : 'brand.400';
  const accentHover = isManicure ? 'pink.500' : 'brand.500';
  const moduleLabel = isManicure ? 'Manicure' : 'Barbearia & Loja';
  const otherModuleUrl = isManicure ? '/admin' : '/admin/manicure';
  const otherModuleLabel = isManicure ? 'Painel Barbearia & Loja' : 'Painel Manicure';

  if (!isReady) {
    return (
      <Center minH="100vh" bg="#0b0d13">
        <VStack spacing={4}>
          <Spinner size="xl" color={accentColor} thickness="3px" />
          <Text color="gray.400" fontSize="sm">
            Verificando permissões...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (isAuthenticated(module)) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await login(module, username, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  return (
    <Box minH="100vh" bg="#0b0d13" display="flex" alignItems="center" justifyContent="center" py={12} px={4}>
      <Container maxW="md">
        <Box
          bg="#161922"
          border="1px solid"
          borderColor="#232936"
          borderRadius="2xl"
          p={{ base: 6, sm: 8 }}
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.6)"
          position="relative"
          overflow="hidden"
        >
          {/* Barra decorativa superior */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="4px"
            bg={isManicure ? 'linear-gradient(90deg, #ed64a6, #d53f8c)' : 'linear-gradient(90deg, #d9a647, #c58d2b)'}
          />

          <VStack spacing={6} align="stretch">
            {/* Cabeçalho */}
            <VStack spacing={3} textAlign="center">
              <Center
                w={14}
                h={14}
                borderRadius="2xl"
                bg={isManicure ? 'rgba(237, 100, 166, 0.12)' : 'rgba(217, 166, 71, 0.12)'}
                color={accentColor}
                border="1px solid"
                borderColor={isManicure ? 'rgba(237, 100, 166, 0.3)' : 'rgba(217, 166, 71, 0.3)'}
                fontSize="2xl"
              >
                {isManicure ? <FiHeart /> : <FiScissors />}
              </Center>

              <VStack spacing={1}>
                <HStack justify="center" spacing={2}>
                  <Heading as="h1" size="md" color="white" fontWeight="800">
                    Acesso Restrito
                  </Heading>
                  <Badge
                    colorScheme={isManicure ? 'pink' : 'yellow'}
                    variant="subtle"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="2xs"
                  >
                    {moduleLabel}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.400">
                  Faça login para gerenciar o painel administrativo da {moduleLabel}.
                </Text>
              </VStack>
            </VStack>

            {/* Alerta de Erro */}
            {errorMessage && (
              <Alert status="error" borderRadius="lg" bg="red.900" color="red.100" fontSize="xs" border="1px solid" borderColor="red.700">
                <AlertIcon color="red.300" />
                {errorMessage}
              </Alert>
            )}

            {/* Formulário de Login */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Usuário
                  </FormLabel>
                  <InputGroup size="md">
                    <Input
                      type="text"
                      placeholder="Digite seu usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      bg="#12151e"
                      borderColor="#232936"
                      color="white"
                      _hover={{ borderColor: 'gray.600' }}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                      borderRadius="lg"
                      fontSize="sm"
                      autoFocus
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Senha
                  </FormLabel>
                  <InputGroup size="md">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg="#12151e"
                      borderColor="#232936"
                      color="white"
                      _hover={{ borderColor: 'gray.600' }}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                      borderRadius="lg"
                      fontSize="sm"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        size="xs"
                        variant="ghost"
                        color="gray.400"
                        _hover={{ color: 'white' }}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  bg={accentColor}
                  color="black"
                  fontWeight="700"
                  borderRadius="lg"
                  _hover={{ bg: accentHover }}
                  isLoading={isLoading}
                  leftIcon={<FiLock />}
                  mt={2}
                >
                  Entrar no Painel
                </Button>
              </VStack>
            </form>

            <Divider borderColor="#232936" />

            {/* Links e Alternância */}
            <VStack spacing={2} fontSize="xs">
              <Link href={otherModuleUrl} style={{ width: '100%' }}>
                <Button
                  w="full"
                  size="sm"
                  variant="outline"
                  borderColor="#232936"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  leftIcon={isManicure ? <FiScissors /> : <FiHeart />}
                >
                  Ir para {otherModuleLabel}
                </Button>
              </Link>

              <Link href="/" style={{ width: '100%' }}>
                <Button
                  w="full"
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'white' }}
                  leftIcon={<FiArrowLeft />}
                >
                  Voltar ao Site Público
                </Button>
              </Link>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
