'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Spinner,
  Center,
  Button,
  Icon,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiUser,
  FiScissors,
  FiArrowLeft,
  FiAlertTriangle,
} from 'react-icons/fi';
import Link from 'next/link';
import { confirmAppointmentById, getDbAppointmentById } from '@/services/db';
import { Appointment } from '@/types';

function ConfirmarContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleConfirmation() {
      if (!id) {
        setError('Link de confirmação inválido ou ID ausente.');
        setLoading(false);
        return;
      }

      try {
        // Busca agendamento e confirma
        const res = await confirmAppointmentById(id);
        if (res.success) {
          setConfirmed(true);
          if (res.appointment) {
            setAppointment(res.appointment);
          } else {
            const fetched = await getDbAppointmentById(id);
            if (fetched) setAppointment(fetched);
          }
        } else {
          setError(res.error || 'Não foi possível confirmar o agendamento.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao confirmar';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    handleConfirmation();
  }, [id]);

  if (loading) {
    return (
      <Center minH="80vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.400" thickness="3px" />
          <Text color="gray.400" fontSize="sm">
            Confirmando seu agendamento...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error || !confirmed) {
    return (
      <Center minH="80vh" px={4}>
        <Container maxW="md">
          <Box
            bg="#161922"
            border="1px solid"
            borderColor="red.800"
            borderRadius="2xl"
            p={{ base: 6, sm: 8 }}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Center w={14} h={14} borderRadius="full" bg="red.900" color="red.300">
                <Icon as={FiAlertTriangle} boxSize={7} />
              </Center>
              <Heading size="md" color="white">
                Não foi possível confirmar
              </Heading>
              <Text fontSize="sm" color="gray.400">
                {error || 'Ocorreu um problema ao localizar o seu agendamento.'}
              </Text>
              <Link href="/">
                <Button variant="outline" colorScheme="yellow" size="sm" mt={2} leftIcon={<FiArrowLeft />}>
                  Voltar ao Início
                </Button>
              </Link>
            </VStack>
          </Box>
        </Container>
      </Center>
    );
  }

  return (
    <Center minH="85vh" py={12} px={4} bg="#0b0d13">
      <Container maxW="md">
        <Box
          bg="#161922"
          border="1px solid"
          borderColor="#232936"
          borderRadius="2xl"
          p={{ base: 6, sm: 8 }}
          boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
          position="relative"
          overflow="hidden"
          textAlign="center"
        >
          {/* Barra decorativa verde */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="5px"
            bg="linear-gradient(90deg, #38a169, #48bb78)"
          />

          <VStack spacing={6}>
            <Center
              w={16}
              h={16}
              borderRadius="full"
              bg="rgba(72, 187, 120, 0.15)"
              color="green.400"
              border="2px solid"
              borderColor="green.500"
            >
              <Icon as={FiCheckCircle} boxSize={9} />
            </Center>

            <VStack spacing={2}>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full" fontSize="xs">
                CONFIRMAÇÃO VIA WHATSAPP
              </Badge>
              <Heading as="h1" size="lg" color="white" fontWeight="800">
                Presença Confirmada!
              </Heading>
              <Text fontSize="sm" color="gray.400">
                Seu horário está garantido e já consta como <strong>Confirmado</strong> no sistema da nossa equipe.
              </Text>
            </VStack>

            {appointment && (
              <Box
                w="full"
                bg="#12151e"
                border="1px solid"
                borderColor="#232936"
                borderRadius="xl"
                p={4}
                textAlign="left"
              >
                <VStack spacing={3} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <HStack color="gray.400">
                      <FiUser />
                      <Text>Cliente:</Text>
                    </HStack>
                    <Text fontWeight="700" color="white">
                      {appointment.customerName}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack color="gray.400">
                      <FiScissors />
                      <Text>Serviço:</Text>
                    </HStack>
                    <Text fontWeight="700" color="brand.400">
                      {appointment.serviceName}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack color="gray.400">
                      <FiUser />
                      <Text>Profissional:</Text>
                    </HStack>
                    <Text fontWeight="600" color="white">
                      {appointment.professionalName}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack color="gray.400">
                      <FiCalendar />
                      <Text>Data:</Text>
                    </HStack>
                    <Text fontWeight="600" color="white">
                      {appointment.date}
                    </Text>
                  </HStack>

                  {appointment.scheduledTime && (
                    <HStack justify="space-between">
                      <HStack color="gray.400">
                        <FiClock />
                        <Text>Horário:</Text>
                      </HStack>
                      <Text fontWeight="700" color="green.400">
                        {appointment.scheduledTime}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            <VStack spacing={3} w="full">
              <Link href="/" style={{ width: '100%' }}>
                <Button
                  w="full"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  leftIcon={<FiArrowLeft />}
                  size="md"
                  borderRadius="lg"
                  fontWeight="700"
                >
                  Voltar para o Início
                </Button>
              </Link>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Center>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense
      fallback={
        <Center minH="80vh">
          <Spinner size="xl" color="brand.400" />
        </Center>
      }
    >
      <ConfirmarContent />
    </Suspense>
  );
}
