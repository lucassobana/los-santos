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
} from '@chakra-ui/react';
import { FiClock, FiUser, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { INITIAL_BARBER_SERVICES, INITIAL_PROFESSIONALS } from '@/lib/mockData';
import { BarberService, Professional } from '@/types';
import Link from 'next/link';
import { generateBookingWhatsAppUrl } from '@/lib/whatsapp';
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

    try {
      setIsSubmitting(true);
      // Salva no banco de dados com status 'solicitado'
      await createDbAppointment({
        customerName,
        customerPhone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        professionalId: selectedBarber?.id,
        professionalName: selectedBarber?.name || 'Qualquer barbeiro disponível',
        date: selectedDate,
        shift: selectedShift,
        price: selectedService.price,
        status: 'solicitado',
        notes: notes ? `[Barbearia] ${notes}` : '[Barbearia]',
        type: 'barbearia',
      });
    } catch (e) {
      console.warn('Erro ao registrar no banco, prosseguindo com WhatsApp:', e);
    } finally {
      setIsSubmitting(false);
    }

    const url = generateBookingWhatsAppUrl({
      type: 'barbearia',
      serviceName: selectedService.name,
      professionalName: selectedBarber?.name || 'Qualquer barbeiro disponível',
      date: selectedDate,
      shift: selectedShift,
      customerName,
      notes,
    });

    window.open(url, '_blank');

    toast({
      title: 'Redirecionando para o WhatsApp!',
      description: 'O barbeiro irá confirmar o melhor horário exato com você.',
      status: 'success',
      duration: 5000,
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
                      Seu WhatsApp / Telefone
                    </FormLabel>
                    <Input
                      placeholder="Ex: (11) 99999-9999"
                      borderRadius="lg"
                      size="sm"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
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
    </Box>
  );
}
