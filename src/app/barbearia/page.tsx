'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Avatar,
  useToast,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Center,
} from '@chakra-ui/react';
import { FiClock, FiUser, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { INITIAL_BARBER_SERVICES, INITIAL_PROFESSIONALS } from '@/lib/mockData';
import { BarberService, Professional } from '@/types';
import Link from 'next/link';
import { generateBookingWhatsAppUrl, formatBookingMessage } from '@/lib/whatsapp';
import { createDbAppointment, getDbProfessionals, getDbServices } from '@/services/db';

export default function BarbeariaPage() {
  const [barbers, setBarbers] = useState<Professional[]>(
    INITIAL_PROFESSIONALS.filter((p) => p.role === 'barbeiro')
  );
  const [services, setServices] = useState<BarberService[]>(INITIAL_BARBER_SERVICES);

  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedShift, setSelectedShift] = useState<'manha' | 'tarde' | 'noite'>('tarde');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<{
    customerName: string;
    customerPhone: string;
    serviceId: string;
    serviceName: string;
    professionalId?: string;
    professionalName: string;
    date: string;
    shift: 'manha' | 'tarde' | 'noite';
    price: number;
    notes?: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProfs, loadedServs] = await Promise.all([
          getDbProfessionals(),
          getDbServices('barbearia'),
        ]);
        const loadedBarbers = loadedProfs.filter((p) => p.role === 'barbeiro');
        setBarbers(loadedBarbers);
        setServices(loadedServs as BarberService[]);
        if (loadedServs.length > 0) {
          setSelectedService(loadedServs[0] as BarberService);
        }
      } catch (err) {
        console.warn('Erro ao carregar serviços da barbearia:', err);
      }
    }
    loadData();
  }, []);

  const toast = useToast();
  const cardBg = '#161922';
  const borderColor = '#232936';

  const handleBooking = async () => {
    if (!customerName.trim()) {
      toast({
        title: 'Informe seu nome',
        description: 'Precisamos do seu nome para identificar o agendamento.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: 'Informe seu WhatsApp / Telefone',
        description: 'Digite seu telefone com DDD (apenas números).',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedService) {
      toast({
        title: 'Selecione um serviço',
        description: 'Escolha qual serviço deseja realizar na barbearia.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const bookingParams = {
      type: 'barbearia' as const,
      serviceName: selectedService.name,
      professionalName: selectedBarber?.name || 'Qualquer barbeiro disponível',
      date: selectedDate,
      shift: selectedShift,
      customerName,
      notes,
    };

    const url = generateBookingWhatsAppUrl(bookingParams);

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        const msg = formatBookingMessage(bookingParams);
        navigator.clipboard.writeText(msg).catch(() => {});
      } catch {
        // Fallback se permissão de clipboard estiver desativada
      }
    }

    // Abre o WhatsApp para o cliente enviar a mensagem
    window.open(url, '_blank');

    // Armazena os dados do agendamento aguardando a confirmação de envio do cliente
    setPendingBooking({
      customerName,
      customerPhone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: selectedBarber?.id,
      professionalName: selectedBarber?.name || 'Qualquer barbeiro disponível',
      date: selectedDate,
      shift: selectedShift,
      price: selectedService.price,
      notes,
      url,
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSent = async () => {
    if (!pendingBooking) return;
    try {
      setIsRegistering(true);
      // Salva no banco de dados SOMENTE após o cliente confirmar que enviou a mensagem
      await createDbAppointment({
        customerName: pendingBooking.customerName,
        customerPhone: pendingBooking.customerPhone,
        serviceId: pendingBooking.serviceId,
        serviceName: pendingBooking.serviceName,
        professionalId: pendingBooking.professionalId,
        professionalName: pendingBooking.professionalName,
        date: pendingBooking.date,
        shift: pendingBooking.shift,
        price: pendingBooking.price,
        status: 'solicitado',
        notes: pendingBooking.notes ? `[Barbearia] ${pendingBooking.notes}` : '[Barbearia]',
        type: 'barbearia',
      });

      toast({
        title: 'Agendamento registrado!',
        description: 'Seu pedido foi incluído na agenda. Nossa equipe entrará em contato para confirmar o horário.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Limpa os campos do formulário
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setIsConfirmModalOpen(false);
      setPendingBooking(null);
    } catch (e) {
      console.error('Erro ao registrar agendamento:', e);
      toast({
        title: 'Erro ao registrar no sistema',
        description: 'Houve uma falha ao salvar na agenda, mas sua mensagem foi enviada no WhatsApp!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      setIsConfirmModalOpen(false);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelBooking = () => {
    setIsConfirmModalOpen(false);
    setPendingBooking(null);
    toast({
      title: 'Agendamento não registrado',
      description: 'Como a mensagem não foi enviada, o horário não foi incluído na agenda.',
      status: 'info',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box pb={{ base: 16, md: 24 }}>
      {/* Header Banner */}
      <Box
        pt={{ base: 8, md: 16 }}
        pb={{ base: 8, md: 12 }}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg="#0f1118"
      >
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
          <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} flexWrap="wrap" gap={2} mb={2}>
            <Badge colorScheme="blue" px={2} py={0.5} borderRadius="md" fontSize="2xs">
              Agendamento Online
            </Badge>
            <Link href="/admin">
              <Button size="xs" variant="ghost" color="brand.400" _hover={{ bg: 'whiteAlpha.100' }} fontSize="2xs">
                Painel Administrativo Barbearia & Loja →
              </Button>
            </Link>
          </Flex>
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontWeight="900" letterSpacing="tight">
            Barbearia Los Santos
          </Heading>
          <Text color="gray.400" mt={2} fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} maxW="2xl">
            Escolha o serviço desejado, o barbeiro de sua preferência, data e turno. O agendamento é concluído no WhatsApp onde o barbeiro confirma o horário exato!
          </Text>
        </Container>
      </Box>

      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} mt={{ base: 6, md: 10 }}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 8, lg: 10 }}>
          {/* Coluna 1 & 2: Seleção de Serviços e Barbeiros */}
          <Box gridColumn={{ lg: 'span 2' }}>
            {/* Passo 1: Serviço */}
            <Box mb={{ base: 8, md: 10 }}>
              <HStack spacing={2} mb={4}>
                <Box
                  w={7}
                  h={7}
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="700"
                  fontSize="xs"
                >
                  1
                </Box>
                <Heading as="h3" size={{ base: 'sm', md: 'md' }}>
                  Escolha o Serviço
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 3, sm: 4 }}>
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <Box
                      key={service.id}
                      p={{ base: 4, sm: 5 }}
                      borderRadius="2xl"
                      bg={cardBg}
                      border="2px solid"
                      borderColor={isSelected ? 'blue.400' : borderColor}
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{ borderColor: 'blue.300', transform: 'translateY(-2px)' }}
                      onClick={() => setSelectedService(service)}
                      position="relative"
                    >
                      {isSelected && (
                        <Badge
                          position="absolute"
                          top={3}
                          right={3}
                          colorScheme="blue"
                          borderRadius="full"
                        >
                          <FiCheck />
                        </Badge>
                      )}
                      <Text fontWeight="700" fontSize={{ base: 'sm', sm: 'md' }}>
                        {service.name}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1} noOfLines={2}>
                        {service.description}
                      </Text>

                      <Flex justify="space-between" align="center" mt={4} pt={2} borderTop="1px solid" borderColor={borderColor}>
                        <HStack spacing={1} color="gray.400" fontSize="xs">
                          <FiClock size={12} />
                          <Text>{service.durationMin} min</Text>
                        </HStack>
                        <Text fontWeight="800" color="blue.400" fontSize="md">
                          R$ {service.price.toFixed(2).replace('.', ',')}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Passo 2: Barbeiro */}
            <Box mb={{ base: 8, md: 10 }}>
              <HStack spacing={2} mb={4}>
                <Box
                  w={7}
                  h={7}
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="700"
                  fontSize="xs"
                >
                  2
                </Box>
                <Heading as="h3" size={{ base: 'sm', md: 'md' }}>
                  Escolha o Barbeiro (Opcional)
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={{ base: 3, sm: 4 }}>
                {/* Opção sem preferência */}
                <Box
                  p={3.5}
                  borderRadius="2xl"
                  bg={cardBg}
                  border="2px solid"
                  borderColor={selectedBarber === null ? 'blue.400' : borderColor}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ borderColor: 'blue.300' }}
                  onClick={() => setSelectedBarber(null)}
                  textAlign="center"
                >
                  <Avatar size="sm" mb={2} icon={<FiUser />} bg="gray.700" />
                  <Text fontWeight="700" fontSize="xs">
                    Sem preferência
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    Quem estiver livre
                  </Text>
                </Box>

                {barbers.map((barber) => {
                  const isSelected = selectedBarber?.id === barber.id;
                  return (
                    <Box
                      key={barber.id}
                      p={3.5}
                      borderRadius="2xl"
                      bg={cardBg}
                      border="2px solid"
                      borderColor={isSelected ? 'blue.400' : borderColor}
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{ borderColor: 'blue.300' }}
                      onClick={() => setSelectedBarber(barber)}
                      textAlign="center"
                    >
                      <Avatar size="sm" src={barber.avatar} mb={2} />
                      <Text fontWeight="700" fontSize="xs">
                        {barber.name}
                      </Text>
                      <Text fontSize="2xs" color="gray.400" noOfLines={1}>
                        {barber.specialty}
                      </Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Passo 3: Data e Turno */}
            <Box>
              <HStack spacing={2} mb={4}>
                <Box
                  w={7}
                  h={7}
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="700"
                  fontSize="xs"
                >
                  3
                </Box>
                <Heading as="h3" size={{ base: 'sm', md: 'md' }}>
                  Data e Preferência de Turno
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 4, sm: 6 }}>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                    Dia desejado
                  </FormLabel>
                  <Input
                    type="date"
                    borderRadius="xl"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                    Preferência de Turno
                  </FormLabel>
                  <HStack spacing={2}>
                    {[
                      { key: 'manha', label: 'Manhã' },
                      { key: 'tarde', label: 'Tarde' },
                      { key: 'noite', label: 'Noite' },
                    ].map((shift) => {
                      const isSelected = selectedShift === shift.key;
                      return (
                        <Button
                          key={shift.key}
                          size="sm"
                          flex={1}
                          borderRadius="xl"
                          variant={isSelected ? 'solid' : 'outline'}
                          colorScheme="blue"
                          bg={isSelected ? 'blue.500' : 'transparent'}
                          borderColor={isSelected ? 'blue.500' : borderColor}
                          onClick={() => setSelectedShift(shift.key as 'manha' | 'tarde' | 'noite')}
                        >
                          {shift.label}
                        </Button>
                      );
                    })}
                  </HStack>
                </FormControl>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Coluna 3: Resumo do Agendamento & Envio */}
          <Box>
            <Box
              position={{ lg: 'sticky' }}
              top="90px"
              p={{ base: 5, sm: 6 }}
              borderRadius="3xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              boxShadow="0 10px 30px rgba(0,0,0,0.3)"
            >
              <Heading as="h4" size="md" mb={4}>
                Resumo do Agendamento
              </Heading>

              <VStack align="stretch" spacing={3.5} divider={<Box borderBottom="1px solid" borderColor={borderColor} />}>
                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="700">
                    Serviço Selecionado
                  </Text>
                  <Text fontWeight="700" fontSize="sm" mt={0.5}>
                    {selectedService?.name || 'Nenhum'}
                  </Text>
                  {selectedService && (
                    <Text fontSize="xs" color="blue.400" fontWeight="700">
                      R$ {selectedService.price.toFixed(2).replace('.', ',')} ({selectedService.durationMin} min)
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="700">
                    Profissional
                  </Text>
                  <Text fontWeight="600" fontSize="xs" mt={0.5}>
                    {selectedBarber?.name || 'Qualquer barbeiro disponível'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="700">
                    Data e Turno
                  </Text>
                  <Text fontWeight="600" fontSize="xs" mt={0.5}>
                    {selectedDate.split('-').reverse().join('/')} • Turno da {selectedShift}
                  </Text>
                </Box>

                <Box>
                  <FormControl isRequired mb={3}>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                      Seu Nome Completo
                    </FormLabel>
                    <Input
                      placeholder="Ex: Carlos Eduardo"
                      borderRadius="lg"
                      size="sm"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired mb={3}>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                      Seu WhatsApp / Telefone (somente números)
                    </FormLabel>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ex: 35992158424 (com DDD)"
                      borderRadius="lg"
                      size="sm"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={customerPhone}
                      maxLength={15}
                      onChange={(e) => {
                        const numericOnly = e.target.value.replace(/\D/g, '');
                        setCustomerPhone(numericOnly);
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                      Observação (Opcional)
                    </FormLabel>
                    <Textarea
                      placeholder="Ex: Gostaria de cortar às 15:30 se possível..."
                      borderRadius="lg"
                      size="sm"
                      rows={2}
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </FormControl>
                </Box>
              </VStack>

              <Button
                mt={5}
                w="100%"
                size="lg"
                bg="#25D366"
                color="white"
                borderRadius="xl"
                fontWeight="700"
                isLoading={isSubmitting}
                leftIcon={<FaWhatsapp size={20} />}
                _hover={{
                  bg: '#1ebc57',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
                }}
                onClick={handleBooking}
              >
                Solicitar no WhatsApp
              </Button>

              <Text fontSize="2xs" color="gray.400" textAlign="center" mt={3}>
                O barbeiro irá responder confirmando o horário exato da sua sessão.
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* Modal de confirmação: Só entra na agenda após o cliente confirmar que enviou no WhatsApp */}
      <Modal isOpen={isConfirmModalOpen} onClose={handleCancelBooking} isCentered size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor} color="white" borderRadius="2xl" mx={4}>
          <ModalHeader pt={6} pb={2}>
            <HStack spacing={3}>
              <Center w={10} h={10} borderRadius="full" bg="rgba(37, 211, 102, 0.15)" color="#25D366" border="1px solid" borderColor="#25D366">
                <FaWhatsapp size={22} />
              </Center>
              <Box>
                <Heading size="md" color="white">
                  Mensagem Enviada?
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Confirmação de Agendamento
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="gray.400" top={4} right={4} />

          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.300">
                Abrimos o seu WhatsApp com o texto do agendamento pré-preenchido para a nossa equipe.
              </Text>

              {pendingBooking && (
                <Box bg="#0b0d13" p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                  <VStack spacing={2} align="stretch" fontSize="xs">
                    <HStack justify="space-between">
                      <Text color="gray.400">Cliente:</Text>
                      <Text fontWeight="700" color="white">{pendingBooking.customerName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.400">Serviço:</Text>
                      <Text fontWeight="700" color="brand.400">{pendingBooking.serviceName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.400">Barbeiro:</Text>
                      <Text fontWeight="600" color="white">{pendingBooking.professionalName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.400">Data e Turno:</Text>
                      <Text fontWeight="600" color="white">
                        {pendingBooking.date.includes('-')
                          ? pendingBooking.date.split('-').reverse().join('/')
                          : pendingBooking.date}{' '}
                        • {pendingBooking.shift.charAt(0).toUpperCase() + pendingBooking.shift.slice(1)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <Box bg="rgba(37, 211, 102, 0.08)" border="1px dashed" borderColor="#25D366" p={3} borderRadius="xl" textAlign="center">
                <Text fontSize="xs" fontWeight="700" color="#25D366" textTransform="uppercase">
                  Importante
                </Text>
                <Text fontSize="xs" color="gray.300" mt={1}>
                  O horário só aparecerá na agenda do barbeiro após você confirmar que apertou o botão <strong>Enviar</strong> no WhatsApp.
                </Text>
              </Box>

              <Center>
                <Button
                  size="xs"
                  variant="ghost"
                  color="#25D366"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  leftIcon={<FaWhatsapp />}
                  onClick={() => pendingBooking?.url && window.open(pendingBooking.url, '_blank')}
                >
                  Não abriu? Clique para reabrir o WhatsApp
                </Button>
              </Center>
            </VStack>
          </ModalBody>

          <ModalFooter pb={6} pt={2} display="flex" flexDirection="column" gap={2}>
            <Button
              w="100%"
              size="lg"
              bg="#25D366"
              color="white"
              fontWeight="700"
              fontSize="sm"
              borderRadius="xl"
              _hover={{ bg: '#1ebc57', transform: 'translateY(-1px)' }}
              isLoading={isRegistering}
              leftIcon={<FiCheck size={18} />}
              onClick={handleConfirmSent}
            >
              Sim, já enviei a mensagem!
            </Button>
            <Button
              w="100%"
              size="md"
              variant="ghost"
              color="gray.400"
              borderRadius="xl"
              fontSize="xs"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              onClick={handleCancelBooking}
              isDisabled={isRegistering}
            >
              Não enviei / Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
