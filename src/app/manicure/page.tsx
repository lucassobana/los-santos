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
import { FiClock, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { INITIAL_MANICURE_SERVICES, INITIAL_PROFESSIONALS } from '@/lib/mockData';
import { ManicureService, Professional } from '@/types';
import { generateBookingWhatsAppUrl, formatBookingMessage } from '@/lib/whatsapp';
import { createDbAppointment, getDbProfessionals, getDbServices } from '@/services/db';

export default function ManicurePublicPage() {
  const [manicurists, setManicurists] = useState<Professional[]>(
    INITIAL_PROFESSIONALS.filter((p) => p.role === 'manicure')
  );
  const [services, setServices] = useState<ManicureService[]>(INITIAL_MANICURE_SERVICES);

  const [selectedService, setSelectedService] = useState<ManicureService | null>(null);
  const [selectedManicurist, setSelectedManicurist] = useState<Professional | null>(null);
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
          getDbServices('manicure'),
        ]);
        const filtered = loadedProfs.filter((p) => p.role === 'manicure');
        setManicurists(filtered);
        setServices(loadedServs as ManicureService[]);
        if (loadedServs.length > 0) {
          setSelectedService(loadedServs[0] as ManicureService);
        }
      } catch (err) {
        console.warn('Erro ao carregar serviços de manicure:', err);
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
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: 'Informe seu WhatsApp / Telefone',
        description: 'Digite seu telefone com DDD (apenas números).',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (!selectedService) {
      toast({
        title: 'Selecione um procedimento',
        description: 'Escolha o serviço desejado para agendar.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    const bookingParams = {
      type: 'manicure' as const,
      serviceName: selectedService.name,
      professionalName: selectedManicurist?.name || 'Qualquer manicure disponível',
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

    // Abre o WhatsApp para a cliente enviar a mensagem
    window.open(url, '_blank');

    // Armazena os dados do agendamento aguardando a confirmação de envio da cliente
    setPendingBooking({
      customerName,
      customerPhone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      professionalId: selectedManicurist?.id,
      professionalName: selectedManicurist?.name || 'Qualquer manicure disponível',
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
      // Salva no banco de dados SOMENTE após a cliente confirmar que enviou a mensagem
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
        notes: pendingBooking.notes ? `[Manicure] ${pendingBooking.notes}` : '[Manicure]',
        type: 'manicure',
      });

      toast({
        title: 'Agendamento registrado!',
        description: 'Seu pedido foi incluído na agenda. Nossa equipe entrará em contato para confirmar o horário.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
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
        position: 'top-right',
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
      position: 'top-right',
    });
  };

  return (
    <Box pb={20}>
      {/* Hero Section */}
      <Box
        position="relative"
        py={{ base: 12, md: 16 }}
        bg="#0b0d13"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }}>
          <VStack spacing={4} align="center" textAlign="center" maxW="3xl" mx="auto">
            <Badge
              colorScheme="pink"
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="wider"
            >
              💅 STUDIO MANICURE & NAILS
            </Badge>

            <Heading
              as="h1"
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
              fontWeight="900"
              lineHeight="shorter"
              color="white"
            >
              Cuidado, Elegância e Estilo para suas Unhas
            </Heading>

            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.400" maxW="2xl">
              Escolha seu procedimento favorito, selecione o turno de sua preferência e receba a confirmação do horário diretamente no seu WhatsApp.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Conteúdo Principal do Agendamento */}
      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} mt={10}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Coluna 1 & 2: Seleção de Procedimentos e Profissionais */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack spacing={8} align="stretch">
              {/* Etapa 1: Procedimentos */}
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading as="h2" size="md" color="white" display="flex" alignItems="center" gap={2}>
                    <Text as="span" color="pink.400">1.</Text> Escolha o Procedimento
                  </Heading>
                  <Text fontSize="xs" color="gray.400">
                    {services.length} opções disponíveis
                  </Text>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  {services.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <Box
                        key={service.id}
                        p={4}
                        borderRadius="xl"
                        bg={cardBg}
                        border="2px solid"
                        borderColor={isSelected ? 'pink.400' : borderColor}
                        cursor="pointer"
                        transition="all 0.2s"
                        onClick={() => setSelectedService(service)}
                        _hover={{
                          borderColor: isSelected ? 'pink.400' : 'gray.600',
                          transform: 'translateY(-2px)',
                        }}
                        position="relative"
                      >
                        {isSelected && (
                          <Badge
                            position="absolute"
                            top={3}
                            right={3}
                            colorScheme="pink"
                            variant="solid"
                            borderRadius="full"
                            px={2}
                          >
                            <FiCheck />
                          </Badge>
                        )}
                        <Text fontWeight="700" color="white" fontSize="sm" mb={1} pr={8}>
                          {service.name}
                        </Text>
                        <Text fontSize="xs" color="gray.400" mb={3} noOfLines={2}>
                          {service.description}
                        </Text>
                        <Flex justify="space-between" align="center" mt="auto">
                          <Text fontWeight="800" color="pink.300" fontSize="md">
                            R$ {service.price.toFixed(2).replace('.', ',')}
                          </Text>
                          <HStack spacing={1} color="gray.400" fontSize="2xs">
                            <FiClock />
                            <Text>{service.durationMin} min</Text>
                          </HStack>
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Etapa 2: Profissional */}
              <Box>
                <Heading as="h2" size="md" color="white" mb={4} display="flex" alignItems="center" gap={2}>
                  <Text as="span" color="pink.400">2.</Text> Escolha a Manicure
                </Heading>

                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                  <Box
                    p={3}
                    borderRadius="xl"
                    bg={cardBg}
                    border="2px solid"
                    borderColor={selectedManicurist === null ? 'pink.400' : borderColor}
                    cursor="pointer"
                    textAlign="center"
                    transition="all 0.2s"
                    onClick={() => setSelectedManicurist(null)}
                    _hover={{ borderColor: selectedManicurist === null ? 'pink.400' : 'gray.600' }}
                  >
                    <Avatar size="sm" name="Qualquer" bg="pink.900" color="pink.200" mb={2} />
                    <Text fontWeight="600" fontSize="xs" color="white" noOfLines={1}>
                      Primeira Disponível
                    </Text>
                    <Text fontSize="2xs" color="gray.400">
                      Menor tempo de espera
                    </Text>
                  </Box>

                  {manicurists.map((manicurist) => {
                    const isSelected = selectedManicurist?.id === manicurist.id;
                    return (
                      <Box
                        key={manicurist.id}
                        p={3}
                        borderRadius="xl"
                        bg={cardBg}
                        border="2px solid"
                        borderColor={isSelected ? 'pink.400' : borderColor}
                        cursor="pointer"
                        textAlign="center"
                        transition="all 0.2s"
                        onClick={() => setSelectedManicurist(manicurist)}
                        _hover={{ borderColor: isSelected ? 'pink.400' : 'gray.600' }}
                      >
                        <Avatar size="sm" name={manicurist.name} src={manicurist.avatar} mb={2} />
                        <Text fontWeight="600" fontSize="xs" color="white" noOfLines={1}>
                          {manicurist.name}
                        </Text>
                        <Text fontSize="2xs" color="pink.400" noOfLines={1}>
                          {manicurist.specialty || 'Manicure & Nail Designer'}
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Etapa 3: Data e Turno */}
              <Box>
                <Heading as="h2" size="md" color="white" mb={4} display="flex" alignItems="center" gap={2}>
                  <Text as="span" color="pink.400">3.</Text> Data e Preferência de Horário
                </Heading>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                      Selecione a Data
                    </FormLabel>
                    <Input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      bg={cardBg}
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="sm"
                      color="white"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                      Turno Desejado
                    </FormLabel>
                    <HStack spacing={2}>
                      {[
                        { key: 'manha', label: 'Manhã (09h - 12h)' },
                        { key: 'tarde', label: 'Tarde (13h - 18h)' },
                        { key: 'noite', label: 'Noite (18h - 20h)' },
                      ].map((t) => {
                        const isSelected = selectedShift === t.key;
                        return (
                          <Button
                            key={t.key}
                            size="sm"
                            flex={1}
                            fontSize="xs"
                            variant={isSelected ? 'solid' : 'outline'}
                            colorScheme={isSelected ? 'pink' : 'gray'}
                            borderColor={borderColor}
                            onClick={() => setSelectedShift(t.key as 'manha' | 'tarde' | 'noite')}
                          >
                            {t.label.split(' ')[0]}
                          </Button>
                        );
                      })}
                    </HStack>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </VStack>
          </Box>

          {/* Coluna 3: Resumo do Agendamento e Dados do Cliente */}
          <Box>
            <Box
              position={{ lg: 'sticky' }}
              top={{ lg: 24 }}
              p={6}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              boxShadow="0 10px 30px rgba(0,0,0,0.5)"
            >
              <Heading as="h3" size="sm" color="white" mb={4}>
                Resumo da Solicitação
              </Heading>

              <VStack spacing={4} align="stretch" divider={<Box borderBottom="1px dashed" borderColor="#232936" />}>
                {selectedService && (
                  <Box>
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                      Procedimento Selecionado
                    </Text>
                    <Text fontWeight="700" color="white" fontSize="sm">
                      {selectedService.name}
                    </Text>
                    <Text fontWeight="800" color="pink.400" fontSize="md" mt={1}>
                      R$ {selectedService.price.toFixed(2).replace('.', ',')}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                    Profissional
                  </Text>
                  <Text fontWeight="600" color="white" fontSize="xs">
                    {selectedManicurist?.name || 'Primeira Disponível'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                    Data e Turno
                  </Text>
                  <Text fontWeight="600" fontSize="xs" color="white" mt={0.5}>
                    {selectedDate.split('-').reverse().join('/')} • Turno da {selectedShift}
                  </Text>
                </Box>

                <Box>
                  <FormControl isRequired mb={3}>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.300">
                      Seu Nome Completo
                    </FormLabel>
                    <Input
                      placeholder="Ex: Amanda Silva"
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
                      placeholder="Ex: Gostaria de fazer francesinha decorada..."
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
                _hover={{ bg: '#1ebc57' }}
                onClick={handleBooking}
              >
                Solicitar via WhatsApp
              </Button>

              <Text fontSize="2xs" color="gray.400" textAlign="center" mt={3}>
                Após solicitar, a equipe agendará o horário e enviará o link de confirmação para você.
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* Modal de confirmação: Só entra na agenda após a cliente confirmar que enviou no WhatsApp */}
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
                      <Text color="gray.400">Manicure:</Text>
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
                  O horário só aparecerá na agenda da manicure após você confirmar que apertou o botão <strong>Enviar</strong> no WhatsApp.
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
