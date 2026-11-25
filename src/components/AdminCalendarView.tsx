'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Heading,
  Button,
  Badge,
  IconButton,
  Select,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Avatar,
  Divider,
  Tag,
  Tooltip,
  Center,
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiUser,
  FiScissors,
  FiHeart,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiPlus,
  FiList,
  FiGrid,
  FiPhone,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Appointment, AppointmentStatus, Professional } from '@/types';

interface AdminCalendarViewProps {
  appointments: Appointment[];
  professionals: Professional[];
  module: 'barbearia' | 'manicure';
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onOpenScheduleModal?: (apt: Appointment) => void;
  onSendWhatsApp?: (apt: Appointment) => void;
  onOpenNewAppointmentModal?: (selectedDate?: string) => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Normaliza datas YYYY-MM-DD e DD/MM/YYYY para comparação segura
function normalizeDate(d?: string): string {
  if (!d) return '';
  const trimmed = d.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts[2] && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return trimmed;
}

export default function AdminCalendarView({
  appointments,
  professionals,
  module,
  onStatusChange,
  onOpenScheduleModal,
  onSendWhatsApp,
  onOpenNewAppointmentModal,
}: AdminCalendarViewProps) {
  const isManicure = module === 'manicure';
  const themeAccent = isManicure ? '#ed64a6' : '#d9a647';
  const themeBgBadge = isManicure ? 'pink.900' : 'yellow.900';
  const themeTextBadge = isManicure ? 'pink.200' : 'yellow.200';
  const roleLabel = isManicure ? 'Manicure' : 'Barbeiro';

  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [selectedProfessional, setSelectedProfessional] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'mes' | 'horarios'>('mes');

  const toast = useToast();
  const cardBg = '#161922';
  const borderColor = '#232936';

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navega para o mês anterior
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navega para o próximo mês
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Volta para o dia de hoje
  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Agendamentos filtrados por profissional (se selecionado)
  // Regra: Na agenda NÃO mostre os 'solicitado' nem 'cancelado' (apenas agendados, confirmados, concluidos)
  const filteredAppointments = useMemo(() => {
    const validAppointments = appointments.filter(
      (a) =>
        a.status !== 'solicitado' &&
        a.status !== 'pendente' &&
        a.status !== 'cancelado'
    );

    if (selectedProfessional === 'todos') {
      return validAppointments;
    }
    return validAppointments.filter(
      (a) =>
        a.professionalName?.toLowerCase() === selectedProfessional.toLowerCase() ||
        a.professionalId === selectedProfessional
    );
  }, [appointments, selectedProfessional]);

  // Mapa de agendamentos indexados pela data normalizada (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    filteredAppointments.forEach((apt) => {
      const norm = normalizeDate(apt.date);
      if (!norm) return;
      const list = map.get(norm) || [];
      list.push(apt);
      map.set(norm, list);
    });

    // Ordena os agendamentos de cada dia por horário
    map.forEach((list) => {
      list.sort((a, b) => {
        const timeA = a.scheduledTime || (a.shift === 'manha' ? '09:00' : a.shift === 'tarde' ? '14:00' : '19:00');
        const timeB = b.scheduledTime || (b.shift === 'manha' ? '09:00' : b.shift === 'tarde' ? '14:00' : '19:00');
        return timeA.localeCompare(timeB);
      });
    });

    return map;
  }, [filteredAppointments]);

  // Dias a exibir no grid do mês
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = today.toISOString().split('T')[0];

    // Dias do mês anterior para completar a primeira semana
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Dias do próximo mês para completar a grade em 35 ou 42 células
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, today]);

  // Agendamentos do dia selecionado
  const selectedDayAppointments = useMemo(() => {
    return appointmentsByDate.get(selectedDateStr) || [];
  }, [appointmentsByDate, selectedDateStr]);

  // Formatação legível da data selecionada (ex: "Quarta-feira, 25 de Novembro")
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    if (!y || !m || !d) return selectedDateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDateStr]);

  // Cores de status dos cards
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', color: 'green', bg: 'green.900', text: 'green.200' };
      case 'agendado':
        return { label: 'Agendado', color: 'purple', bg: 'purple.900', text: 'purple.200' };
      case 'solicitado':
        return { label: 'Solicitado', color: 'yellow', bg: 'yellow.900', text: 'yellow.200' };
      case 'concluido':
        return { label: 'Concluído', color: 'blue', bg: 'blue.900', text: 'blue.200' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'red', bg: 'red.900', text: 'red.200' };
      default:
        return { label: status, color: 'gray', bg: 'gray.800', text: 'gray.300' };
    }
  };

  // Agrupamento dos agendamentos do dia selecionado por profissional
  const appointmentsByProfessional = useMemo(() => {
    const targetProfs =
      selectedProfessional === 'todos'
        ? professionals
        : professionals.filter(
            (p) =>
              p.name.toLowerCase() === selectedProfessional.toLowerCase() ||
              p.id === selectedProfessional
          );

    const groups: {
      professional: Professional;
      appointments: Appointment[];
    }[] = targetProfs.map((prof) => ({
      professional: prof,
      appointments: selectedDayAppointments.filter(
        (a) =>
          a.professionalName?.toLowerCase() === prof.name.toLowerCase() ||
          a.professionalId === prof.id
      ),
    }));

    // Captura também agendamentos sem profissional ou com nomes não mapeados
    const otherAppointments = selectedDayAppointments.filter(
      (a) =>
        !targetProfs.some(
          (prof) =>
            a.professionalName?.toLowerCase() === prof.name.toLowerCase() ||
            a.professionalId === prof.id
        )
    );

    if (otherAppointments.length > 0) {
      groups.push({
        professional: {
          id: 'outros',
          name: isManicure ? 'Sem Manicure / Outros' : 'Sem Barbeiro / Outros',
          role: isManicure ? 'manicure' : 'barbeiro',
          avatar: '',
          specialty: 'Atendimento Geral',
        },
        appointments: otherAppointments,
      });
    }

    return groups;
  }, [professionals, selectedProfessional, selectedDayAppointments, isManicure]);

  // Card individual de agendamento reutilizável
  const renderAppointmentCard = (apt: Appointment) => {
    const statusStyle = getStatusBadge(apt.status);
    const displayTime = apt.scheduledTime || `Turno ${apt.shift.toUpperCase()}`;

    return (
      <Box
        key={apt.id}
        bg="#0b0d13"
        p={3.5}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        transition="all 0.15s ease"
        _hover={{ borderColor: themeAccent }}
      >
        <Flex justify="space-between" align="flex-start" gap={2} mb={2}>
          <HStack spacing={2}>
            {/* Horário em Destaque */}
            <Tag
              size="md"
              bg={themeAccent}
              color="black"
              fontWeight="800"
              borderRadius="lg"
              px={2}
            >
              <FiClock style={{ marginRight: '4px' }} />
              {displayTime}
            </Tag>

            <Badge
              bg={statusStyle.bg}
              color={statusStyle.text}
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {statusStyle.label}
            </Badge>
          </HStack>

          {/* Preço */}
          <Text fontSize="xs" fontWeight="800" color="white">
            R$ {Number(apt.price).toFixed(2).replace('.', ',')}
          </Text>
        </Flex>

        {/* Informações do Cliente e Serviço */}
        <VStack align="stretch" spacing={1} mb={3} fontSize="xs">
          <HStack justify="space-between">
            <Text color="gray.400">Cliente:</Text>
            <Text fontWeight="700" color="white">
              {apt.customerName}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text color="gray.400">Serviço:</Text>
            <Text fontWeight="600" color={themeAccent}>
              {apt.serviceName}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text color="gray.400">{roleLabel}:</Text>
            <Text fontWeight="500" color="gray.300">
              {apt.professionalName}
            </Text>
          </HStack>

          {apt.notes && (
            <Text fontSize="3xs" color="gray.400" fontStyle="italic" mt={1}>
              Obs: {apt.notes}
            </Text>
          )}
        </VStack>

        {/* Ações Rápidas: WhatsApp, Definir Horário, Mudar Status */}
        <Flex
          justify="space-between"
          align="center"
          gap={2}
          pt={2}
          borderTop="1px solid"
          borderColor="rgba(255, 255, 255, 0.05)"
        >
          <HStack spacing={1}>
            {/* Botão de WhatsApp */}
            {apt.customerPhone && onSendWhatsApp && (
              <Tooltip label="Enviar mensagem ou link de confirmação no WhatsApp" fontSize="2xs" hasArrow>
                <IconButton
                  aria-label="WhatsApp"
                  icon={<FaWhatsapp size={14} />}
                  size="xs"
                  colorScheme="whatsapp"
                  variant="solid"
                  borderRadius="lg"
                  onClick={() => onSendWhatsApp(apt)}
                />
              </Tooltip>
            )}

            {/* Botão para definir/alterar horário exato */}
            {onOpenScheduleModal && (
              <Tooltip label="Definir ou alterar horário exato" fontSize="2xs" hasArrow>
                <IconButton
                  aria-label="Definir Horário"
                  icon={<FiClock size={13} />}
                  size="xs"
                  variant="outline"
                  borderColor={borderColor}
                  color="gray.300"
                  borderRadius="lg"
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  onClick={() => onOpenScheduleModal(apt)}
                />
              </Tooltip>
            )}
          </HStack>

          {/* Menu de Alterar Status */}
          <Menu size="sm">
            <MenuButton
              as={Button}
              size="xs"
              variant="outline"
              borderColor={borderColor}
              color="gray.300"
              borderRadius="lg"
              fontSize="2xs"
            >
              Mudar Status
            </MenuButton>
            <MenuList bg="#161922" borderColor={borderColor} color="white" fontSize="xs">
              <MenuItem
                bg="#161922"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => onStatusChange(apt.id, 'confirmado')}
              >
                🟢 Confirmado
              </MenuItem>
              <MenuItem
                bg="#161922"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => onStatusChange(apt.id, 'concluido')}
              >
                🔵 Concluído (Atendido)
              </MenuItem>
              <MenuItem
                bg="#161922"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => onStatusChange(apt.id, 'agendado')}
              >
                🟣 Agendado
              </MenuItem>
              <MenuItem
                bg="#161922"
                _hover={{ bg: 'red.900', color: 'red.200' }}
                onClick={() => onStatusChange(apt.id, 'cancelado')}
              >
                🔴 Cancelar Atendimento
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    );
  };

  // Grade de Horários Timeline (08:00 até 20:00)
  const timelineHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  ];

  return (
    <Box>
      {/* Topo de Controles: Título, Navegação de Mês, Filtros e Alternador de Visão */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap={4}
        mb={6}
        p={{ base: 4, sm: 5 }}
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
      >
        {/* Mês, Ano e Navegação */}
        <HStack spacing={3} flexWrap="wrap">
          <IconButton
            aria-label="Mês anterior"
            icon={<FiChevronLeft />}
            size="sm"
            variant="outline"
            borderColor={borderColor}
            color="gray.300"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            onClick={handlePrevMonth}
          />

          <Box minW="180px">
            <Heading size="md" color="white" fontWeight="800">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Heading>
            <Text fontSize="2xs" color="gray.400">
              {filteredAppointments.length} atendimento(s) agendado(s)/confirmado(s)
            </Text>
          </Box>

          <IconButton
            aria-label="Próximo mês"
            icon={<FiChevronRight />}
            size="sm"
            variant="outline"
            borderColor={borderColor}
            color="gray.300"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            onClick={handleNextMonth}
          />

          <Button
            size="xs"
            variant="ghost"
            color={themeAccent}
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={handleGoToday}
            fontWeight="700"
          >
            Hoje
          </Button>
        </HStack>

        {/* Filtros e Modos de Visualização */}
        <HStack spacing={3} flexWrap="wrap" w={{ base: '100%', md: 'auto' }}>
          {/* Filtro por Profissional */}
          <Select
            size="sm"
            w={{ base: '100%', sm: '190px' }}
            bg="#0b0d13"
            borderColor={borderColor}
            color="gray.200"
            borderRadius="xl"
            fontSize="xs"
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
          >
            <option value="todos">Todos os {roleLabel}s</option>
            {professionals.map((prof) => (
              <option key={prof.id} value={prof.name}>
                {prof.name}
              </option>
            ))}
          </Select>

          {/* Alternador Mensal / Horários do Dia */}
          <HStack bg="#0b0d13" p={1} borderRadius="xl" border="1px solid" borderColor={borderColor}>
            <Button
              size="xs"
              borderRadius="lg"
              variant={viewMode === 'mes' ? 'solid' : 'ghost'}
              bg={viewMode === 'mes' ? themeAccent : 'transparent'}
              color={viewMode === 'mes' ? 'black' : 'gray.400'}
              fontWeight="700"
              leftIcon={<FiGrid />}
              onClick={() => setViewMode('mes')}
            >
              Mês
            </Button>
            <Button
              size="xs"
              borderRadius="lg"
              variant={viewMode === 'horarios' ? 'solid' : 'ghost'}
              bg={viewMode === 'horarios' ? themeAccent : 'transparent'}
              color={viewMode === 'horarios' ? 'black' : 'gray.400'}
              fontWeight="700"
              leftIcon={<FiClock />}
              onClick={() => setViewMode('horarios')}
            >
              Grade Diária
            </Button>
          </HStack>

          {/* Botão Novo Agendamento */}
          {onOpenNewAppointmentModal && (
            <Button
              size="sm"
              bg={themeAccent}
              color="black"
              fontWeight="700"
              borderRadius="xl"
              _hover={{ opacity: 0.9 }}
              leftIcon={<FiPlus />}
              onClick={() => onOpenNewAppointmentModal(selectedDateStr)}
            >
              Novo
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Conteúdo Principal: Modo Mês OU Modo Grade Diária */}
      {viewMode === 'mes' ? (
        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} alignContent="start">
          {/* ========================================================= */}
          {/* COLUNA 1 & 2: CALENDÁRIO MENSAL */}
          {/* ========================================================= */}
          <Box
            gridColumn={{ xl: 'span 2' }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            p={{ base: 3, sm: 5 }}
            overflow="hidden"
          >
            {/* Cabeçalho dos Dias da Semana */}
            <SimpleGrid columns={7} mb={2} textAlign="center">
              {WEEK_DAYS.map((wd, idx) => (
                <Text
                  key={wd}
                  fontSize="2xs"
                  fontWeight="800"
                  textTransform="uppercase"
                  color={idx === 0 || idx === 6 ? 'gray.500' : 'gray.400'}
                  py={1}
                >
                  {wd}
                </Text>
              ))}
            </SimpleGrid>

            {/* Grid dos Dias do Mês */}
            <SimpleGrid columns={7} spacing={{ base: 1, sm: 2 }}>
              {calendarDays.map((item, idx) => {
                const dayApts = appointmentsByDate.get(item.dateStr) || [];
                const isSelected = item.dateStr === selectedDateStr;
                const hasApts = dayApts.length > 0;

                return (
                  <Box
                    key={`${item.dateStr}-${idx}`}
                    minH={{ base: '48px', sm: '88px', md: '100px' }}
                    p={{ base: 1, sm: 2 }}
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    position="relative"
                    bg={
                      isSelected
                        ? isManicure
                          ? 'rgba(237, 100, 166, 0.12)'
                          : 'rgba(217, 166, 71, 0.12)'
                        : item.isCurrentMonth
                        ? '#0b0d13'
                        : '#08090d'
                    }
                    border="1px solid"
                    borderColor={
                      isSelected
                        ? themeAccent
                        : item.isToday
                        ? isManicure
                          ? 'pink.500'
                          : 'yellow.500'
                        : borderColor
                    }
                    opacity={item.isCurrentMonth ? 1 : 0.4}
                    _hover={{
                      borderColor: themeAccent,
                      transform: 'translateY(-1px)',
                    }}
                    onClick={() => setSelectedDateStr(item.dateStr)}
                  >
                    {/* Topo da Célula: Número do dia e contador */}
                    <Flex justify="space-between" align="center" mb={{ base: 0, sm: 1 }}>
                      <Text
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        fontWeight={isSelected || item.isToday ? '800' : '600'}
                        color={
                          isSelected
                            ? themeAccent
                            : item.isToday
                            ? isManicure
                              ? 'pink.300'
                              : 'yellow.300'
                            : 'white'
                        }
                      >
                        {item.dayNumber}
                      </Text>

                      {hasApts && (
                        <Badge
                          borderRadius="full"
                          px={{ base: 1, sm: 1.5 }}
                          py={0.2}
                          fontSize="3xs"
                          bg={themeBgBadge}
                          color={themeTextBadge}
                          fontWeight="800"
                        >
                          {dayApts.length}
                        </Badge>
                      )}
                    </Flex>

                    {/* Indicador compacto no mobile (pontinhos para não estourar a célula estreita) */}
                    {hasApts && (
                      <HStack spacing={0.5} justify="center" mt={0.5} display={{ base: 'flex', sm: 'none' }} flexWrap="wrap">
                        {dayApts.slice(0, 3).map((apt) => (
                          <Box
                            key={apt.id}
                            w="4px"
                            h="4px"
                            borderRadius="full"
                            bg={themeAccent}
                          />
                        ))}
                        {dayApts.length > 3 && (
                          <Text fontSize="3xs" color="gray.400" lineHeight="1">
                            +
                          </Text>
                        )}
                      </HStack>
                    )}

                    {/* Prévia dos Horários Marcados no Tablet/Desktop */}
                    <VStack spacing={1} align="stretch" overflow="hidden" display={{ base: 'none', sm: 'flex' }}>
                      {dayApts.slice(0, 2).map((apt) => {
                        const time = apt.scheduledTime || (apt.shift === 'manha' ? 'Manhã' : apt.shift === 'tarde' ? 'Tarde' : 'Noite');
                        const statusStyle = getStatusBadge(apt.status);

                        return (
                          <Tooltip
                            key={apt.id}
                            label={`${time} • ${apt.customerName} (${apt.serviceName})`}
                            fontSize="xs"
                            hasArrow
                            placement="top"
                          >
                            <Box
                              fontSize="3xs"
                              px={1}
                              py={0.5}
                              borderRadius="md"
                              bg={statusStyle.bg}
                              color={statusStyle.text}
                              fontWeight="700"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {time} {apt.customerName.split(' ')[0]}
                            </Box>
                          </Tooltip>
                        );
                      })}

                      {dayApts.length > 2 && (
                        <Text fontSize="3xs" color="gray.400" textAlign="center" fontWeight="700">
                          +{dayApts.length - 2} mais
                        </Text>
                      )}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* ========================================================= */}
          {/* COLUNA 3: PAINEL DETALHADO DO DIA SELECIONADO */}
          {/* ========================================================= */}
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            p={{ base: 4, sm: 5 }}
            display="flex"
            flexDirection="column"
          >
            {/* Cabeçalho do Dia */}
            <Flex justify="space-between" align="flex-start" mb={4} pb={3} borderBottom="1px solid" borderColor={borderColor}>
              <Box>
                <Badge colorScheme={isManicure ? 'pink' : 'yellow'} mb={1} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                  HORÁRIOS DO DIA
                </Badge>
                <Heading size="sm" color="white" textTransform="capitalize">
                  {selectedDateFormatted}
                </Heading>
              </Box>

              <Badge
                borderRadius="full"
                px={2.5}
                py={1}
                fontSize="xs"
                bg={themeBgBadge}
                color={themeTextBadge}
                fontWeight="800"
              >
                {selectedDayAppointments.length} agendado(s)
              </Badge>
            </Flex>

            {/* Lista dos Horários do Dia */}
            {selectedDayAppointments.length === 0 ? (
              <Center py={12} flexDirection="column" gap={3}>
                <Box p={4} borderRadius="full" bg="#0b0d13" color="gray.500" border="1px dashed" borderColor={borderColor}>
                  <FiCalendar size={32} />
                </Box>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Nenhum atendimento marcado para este dia.
                </Text>
                {onOpenNewAppointmentModal && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme={isManicure ? 'pink' : 'yellow'}
                    leftIcon={<FiPlus />}
                    onClick={() => onOpenNewAppointmentModal(selectedDateStr)}
                  >
                    Agendar Horário
                  </Button>
                )}
              </Center>
            ) : (
              <VStack spacing={4} align="stretch" flex={1} overflowY="auto" maxH="560px" pr={1}>
                {selectedProfessional === 'todos' ? (
                  // Exibe a agenda separada por profissional
                  appointmentsByProfessional.map((group) => (
                    <Box
                      key={group.professional.id}
                      bg="#08090d"
                      p={3}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        mb={2.5}
                        pb={2}
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.100"
                      >
                        <HStack spacing={2}>
                          <Avatar size="xs" name={group.professional.name} src={group.professional.avatar} />
                          <Text fontWeight="700" fontSize="xs" color="white">
                            {group.professional.name}
                          </Text>
                        </HStack>
                        <Badge
                          fontSize="3xs"
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          colorScheme={group.appointments.length > 0 ? (isManicure ? 'pink' : 'yellow') : 'gray'}
                        >
                          {group.appointments.length} horário(s)
                        </Badge>
                      </Flex>

                      {group.appointments.length === 0 ? (
                        <Text fontSize="2xs" color="gray.500" fontStyle="italic" py={1} px={1}>
                          Nenhum horário marcado neste dia.
                        </Text>
                      ) : (
                        <VStack spacing={2.5} align="stretch">
                          {group.appointments.map(renderAppointmentCard)}
                        </VStack>
                      )}
                    </Box>
                  ))
                ) : (
                  // Exibe os agendamentos do profissional filtrado
                  selectedDayAppointments.map(renderAppointmentCard)
                )}
              </VStack>
            )}
          </Box>
        </SimpleGrid>
      ) : (
        /* ========================================================= */
        /* MODO GRADE DIÁRIA (TIMELINE DE HORÁRIOS DAS 08h ÀS 20h)   */
        /* ========================================================= */
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          p={{ base: 4, sm: 6 }}
        >
          {/* Topo do dia selecionado na Grade */}
          <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
            <Box>
              <Badge colorScheme={isManicure ? 'pink' : 'yellow'} mb={1} fontSize="2xs" px={2} py={0.5} borderRadius="md">
                GRADE DE HORÁRIOS DO DIA
              </Badge>
              <Heading size="md" color="white" textTransform="capitalize">
                {selectedDateFormatted}
              </Heading>
              {selectedProfessional === 'todos' && (
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                  Visualizando horários separados de todos os {roleLabel}s lado a lado
                </Text>
              )}
            </Box>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor={borderColor}
                color="gray.300"
                leftIcon={<FiChevronLeft />}
                onClick={() => {
                  const [y, m, d] = selectedDateStr.split('-').map(Number);
                  const prev = new Date(y, m - 1, d - 1);
                  setSelectedDateStr(prev.toISOString().split('T')[0]);
                }}
              >
                Dia Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor={borderColor}
                color="gray.300"
                rightIcon={<FiChevronRight />}
                onClick={() => {
                  const [y, m, d] = selectedDateStr.split('-').map(Number);
                  const next = new Date(y, m - 1, d + 1);
                  setSelectedDateStr(next.toISOString().split('T')[0]);
                }}
              >
                Próximo Dia
              </Button>
            </HStack>
          </Flex>

          {/* Seletor 'todos': Grade multi-colunas separada por barbeiro/manicure */}
          {selectedProfessional === 'todos' ? (
            <SimpleGrid
              columns={{
                base: 1,
                md: Math.min(appointmentsByProfessional.length, 2),
                xl: Math.min(appointmentsByProfessional.length, 3),
              }}
              spacing={5}
              alignItems="start"
            >
              {appointmentsByProfessional.map((group) => {
                return (
                  <Box
                    key={group.professional.id}
                    bg="#08090d"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    p={4}
                  >
                    {/* Topo da Coluna do Profissional */}
                    <Flex justify="space-between" align="center" mb={4} pb={2} borderBottom="1px solid" borderColor={borderColor}>
                      <HStack spacing={2.5}>
                        <Avatar size="sm" name={group.professional.name} src={group.professional.avatar} />
                        <Box>
                          <Text fontWeight="800" fontSize="sm" color="white">
                            {group.professional.name}
                          </Text>
                          <Text fontSize="3xs" color="gray.400">
                            {group.professional.specialty || roleLabel}
                          </Text>
                        </Box>
                      </HStack>
                      <Badge
                        fontSize="2xs"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        colorScheme={group.appointments.length > 0 ? (isManicure ? 'pink' : 'yellow') : 'gray'}
                      >
                        {group.appointments.length} cliente(s)
                      </Badge>
                    </Flex>

                    {/* Timeline de Horários deste Profissional */}
                    <VStack spacing={2} align="stretch">
                      {timelineHours.map((hour) => {
                        const hourApts = group.appointments.filter((a) => {
                          if (!a.scheduledTime) return false;
                          return a.scheduledTime.startsWith(hour.slice(0, 2));
                        });
                        const isOccupied = hourApts.length > 0;

                        return (
                          <Box
                            key={hour}
                            p={2.5}
                            borderRadius="xl"
                            bg="#0b0d13"
                            border="1px solid"
                            borderColor={isOccupied ? themeAccent : borderColor}
                          >
                            <Flex justify="space-between" align="center" mb={isOccupied ? 1.5 : 0}>
                              <Tag
                                size="sm"
                                bg={isOccupied ? themeAccent : '#161922'}
                                color={isOccupied ? 'black' : 'gray.400'}
                                fontWeight="800"
                                borderRadius="md"
                              >
                                {hour}
                              </Tag>
                              {!isOccupied && (
                                <Text fontSize="3xs" color="gray.500">
                                  Disponível
                                </Text>
                              )}
                            </Flex>

                            {isOccupied && (
                              <VStack spacing={1.5} align="stretch" mt={1}>
                                {hourApts.map((apt) => {
                                  const statusStyle = getStatusBadge(apt.status);
                                  return (
                                    <Box
                                      key={apt.id}
                                      p={2}
                                      borderRadius="lg"
                                      bg="#161922"
                                      border="1px solid"
                                      borderColor="whiteAlpha.100"
                                    >
                                      <Flex justify="space-between" align="center" mb={1}>
                                        <Text fontWeight="700" fontSize="xs" color="white" noOfLines={1}>
                                          {apt.customerName}
                                        </Text>
                                        <Badge bg={statusStyle.bg} color={statusStyle.text} fontSize="3xs" px={1.5} borderRadius="full">
                                          {statusStyle.label}
                                        </Badge>
                                      </Flex>
                                      <HStack justify="space-between" fontSize="2xs">
                                        <Text color={themeAccent} fontWeight="600">{apt.serviceName}</Text>
                                        <HStack spacing={1}>
                                          {apt.customerPhone && onSendWhatsApp && (
                                            <IconButton
                                              aria-label="WhatsApp"
                                              icon={<FaWhatsapp size={10} />}
                                              size="2xs"
                                              colorScheme="whatsapp"
                                              onClick={() => onSendWhatsApp(apt)}
                                            />
                                          )}
                                          {onOpenScheduleModal && (
                                            <IconButton
                                              aria-label="Horário"
                                              icon={<FiClock size={10} />}
                                              size="2xs"
                                              variant="ghost"
                                              color="gray.400"
                                              onClick={() => onOpenScheduleModal(apt)}
                                            />
                                          )}
                                        </HStack>
                                      </HStack>
                                    </Box>
                                  );
                                })}
                              </VStack>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            /* Visualização de um único profissional selecionado */
            <VStack spacing={3} align="stretch">
              {timelineHours.map((hour) => {
                const hourApts = selectedDayAppointments.filter((a) => {
                  if (!a.scheduledTime) return false;
                  return a.scheduledTime.startsWith(hour.slice(0, 2));
                });
                const isOccupied = hourApts.length > 0;

                return (
                  <Flex
                    key={hour}
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'stretch', md: 'center' }}
                    p={3}
                    bg="#0b0d13"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={isOccupied ? themeAccent : borderColor}
                    gap={3}
                  >
                    <HStack w={{ base: '100%', md: '110px' }} justify={{ base: 'space-between', md: 'flex-start' }}>
                      <Tag
                        size="lg"
                        bg={isOccupied ? themeAccent : '#161922'}
                        color={isOccupied ? 'black' : 'gray.400'}
                        fontWeight="800"
                        borderRadius="lg"
                      >
                        {hour}
                      </Tag>
                      <Text fontSize="2xs" color="gray.500" display={{ base: 'block', md: 'none' }}>
                        {isOccupied ? `${hourApts.length} cliente(s)` : 'Livre'}
                      </Text>
                    </HStack>

                    <Box flex={1}>
                      {isOccupied ? (
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={2}>
                          {hourApts.map((apt) => {
                            const statusStyle = getStatusBadge(apt.status);
                            return (
                              <Box
                                key={apt.id}
                                p={2.5}
                                borderRadius="lg"
                                bg="#161922"
                                border="1px solid"
                                borderColor={borderColor}
                              >
                                <Flex justify="space-between" align="center" mb={1}>
                                  <Text fontWeight="700" fontSize="xs" color="white" noOfLines={1}>
                                    {apt.customerName}
                                  </Text>
                                  <Badge bg={statusStyle.bg} color={statusStyle.text} fontSize="3xs" px={1.5} borderRadius="full">
                                    {statusStyle.label}
                                  </Badge>
                                </Flex>
                                <HStack justify="space-between" fontSize="2xs">
                                  <Text color={themeAccent}>{apt.serviceName}</Text>
                                  <Text color="gray.400">{apt.professionalName}</Text>
                                </HStack>
                              </Box>
                            );
                          })}
                        </SimpleGrid>
                      ) : (
                        <Flex align="center" justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Horário livre
                          </Text>
                          {onOpenNewAppointmentModal && (
                            <Button
                              size="2xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: themeAccent, bg: 'whiteAlpha.100' }}
                              leftIcon={<FiPlus />}
                              onClick={() => onOpenNewAppointmentModal(selectedDateStr)}
                            >
                              Marcar neste horário
                            </Button>
                          )}
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
}
