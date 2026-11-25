'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Button,
  Badge,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Image,
  useToast,
  Flex,
  Switch,
  Card,
  CardBody,
  Avatar,
} from '@chakra-ui/react';
import AdminHeader, { AdminTab } from '@/components/AdminHeader';
import AdminCalendarView from '@/components/AdminCalendarView';
import Pagination from '@/components/Pagination';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import ImageUpload from '@/components/ImageUpload';
import {
  FiScissors,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiTrendingUp,
  FiUsers,
  FiLayers,
  FiClock,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { generateConfirmationRequestWhatsAppUrl } from '@/lib/whatsapp';
import {
  INITIAL_PRODUCTS,
  INITIAL_APPOINTMENTS,
  INITIAL_ORDERS,
  INITIAL_BARBER_SERVICES,
} from '@/lib/mockData';
import { Product, Appointment, OrderSale, Professional, BarberService, ManicureService, AppointmentStatus } from '@/types';
import {
  getDbProducts,
  createDbProduct,
  toggleDbProductStock,
  deleteDbProduct,
  getDbAppointments,
  createDbAppointment,
  updateDbAppointmentStatus,
  deleteDbAppointment,
  getDbOrders,
  createDbOrder,
  updateDbOrderStatus,
  getDbProfessionals,
  createDbProfessional,
  deleteDbProfessional,
  getDbServices,
  createDbService,
  deleteDbService,
  isManicureAppointment,
  isManicureOrder,
} from '@/services/db';

export default function AdminPage() {
  // Controle das 3 Abas Principais do Painel (Agenda, Faturamento, Cadastros)
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [cadastrosSubTab, setCadastrosSubTab] = useState<'servicos' | 'roupas' | 'barbeiros'>('servicos');

  // Estados dos Dados
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [orders, setOrders] = useState<OrderSale[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<(BarberService | ManicureService)[]>(INITIAL_BARBER_SERVICES);

  // Carrega dados do Supabase
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [prods, apts, ords, profs, servs] = await Promise.all([
          getDbProducts('roupas'),
          getDbAppointments(),
          getDbOrders(),
          getDbProfessionals('barbeiro'),
          getDbServices('barbearia'),
        ]);

        const barberApts = apts.filter((apt) => !isManicureAppointment(apt));
        const barberOrders = ords.filter((ord) => !isManicureOrder(ord));
        const barberProfs = profs.filter((p) => p.role === 'barbeiro');

        setProducts(prods);
        setAppointments(barberApts);
        setOrders(barberOrders);
        setProfessionals(barberProfs);
        if (barberProfs.length > 0) {
          setNewAptBarber((prev) => prev || barberProfs[0].name);
        }
        setServices(servs);
      } catch (err) {
        console.warn('Erro ao carregar dados do admin:', err);
      }
    }
    loadAdminData();
  }, []);

  // Estados dos Filtros
  const [filterPeriod, setFilterPeriod] = useState<'semanal' | 'mensal' | 'anual' | 'geral'>('mensal');
  const [filterBarber, setFilterBarber] = useState<string>('todos');
  const [filterSource, setFilterSource] = useState<'todos' | 'barbearia' | 'roupas'>('todos');
  const [filterAptStatus, setFilterAptStatus] = useState<string>('todos');

  // Modais de Criação
  const {
    isOpen: isProductModalOpen,
    onOpen: openProductModal,
    onClose: closeProductModal,
  } = useDisclosure();

  const {
    isOpen: isSaleModalOpen,
    onOpen: openSaleModal,
    onClose: closeSaleModal,
  } = useDisclosure();

  const {
    isOpen: isAppointmentModalOpen,
    onOpen: openAppointmentModal,
    onClose: closeAppointmentModal,
  } = useDisclosure();

  const {
    isOpen: isProfessionalModalOpen,
    onOpen: openProfessionalModal,
    onClose: closeProfessionalModal,
  } = useDisclosure();

  const {
    isOpen: isServiceModalOpen,
    onOpen: openServiceModal,
    onClose: closeServiceModal,
  } = useDisclosure();

  // Modal para definir horário exato ao agendar
  const {
    isOpen: isScheduleModalOpen,
    onOpen: openScheduleModal,
    onClose: closeScheduleModal,
  } = useDisclosure();
  const [activeSchedulingApt, setActiveSchedulingApt] = useState<Appointment | null>(null);
  const [scheduledTimeInput, setScheduledTimeInput] = useState<string>('14:00');
  const [scheduledProfessionalName, setScheduledProfessionalName] = useState<string>('');

  // Estados para formulário de nova roupa
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Camisetas');
  const [newProductPrice, setNewProductPrice] = useState('149.90');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
  );
  const [newProductSizes, setNewProductSizes] = useState('P, M, G, GG');

  // Estados para formulário de novo profissional
  const [newProfName, setNewProfName] = useState('');
  const [newProfRole, setNewProfRole] = useState<'barbeiro' | 'manicure'>('barbeiro');
  const [newProfSpecialty, setNewProfSpecialty] = useState('');
  const [newProfAvatar, setNewProfAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  );

  // Estados para formulário de novo serviço
  const [newServName, setNewServName] = useState('');
  const [newServType, setNewServType] = useState<'barbearia' | 'manicure'>('barbearia');
  const [newServPrice, setNewServPrice] = useState('50.00');
  const [newServDuration, setNewServDuration] = useState('45');
  const [newServCategory, setNewServCategory] = useState('Cabelo');
  const [newServDescription, setNewServDescription] = useState('');

  // Estados para formulário de nova venda de roupas
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleProductItem, setSaleProductItem] = useState('');
  const [saleAmount, setSaleAmount] = useState('139.90');

  // Estados para novo agendamento manual de barbearia
  const [newAptCustomer, setNewAptCustomer] = useState('');
  const [newAptBarber, setNewAptBarber] = useState('');
  const [newAptService, setNewAptService] = useState(INITIAL_BARBER_SERVICES[0]?.name || '');
  const [newAptPrice, setNewAptPrice] = useState('50.00');
  const [newAptDate, setNewAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAptShift, setNewAptShift] = useState<'manha' | 'tarde' | 'noite'>('tarde');

  const toast = useToast();
  const cardBg = '#161922';
  const borderColor = '#232936';

  // Barbeiros cadastrados
  const barbers = useMemo(
    () => professionals.filter((p) => p.role === 'barbeiro'),
    [professionals]
  );

  // Serviços de Barbearia
  const barberServices = useMemo(
    () => services.filter((s) => s.type === 'barbearia'),
    [services]
  );

  // Função auxiliar para verificar datas
  const isDateInPeriod = (dateStr: string, period: 'semanal' | 'mensal' | 'anual' | 'geral') => {
    if (period === 'geral') return true;

    const itemDate = new Date(dateStr);
    const now = new Date();

    if (period === 'semanal') {
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (period === 'mensal') {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth()
      );
    }

    if (period === 'anual') {
      return itemDate.getFullYear() === now.getFullYear();
    }

    return true;
  };

  // Cálculo das Métricas Financeiras filtradas
  const metrics = useMemo(() => {
    const filteredAppointments = appointments.filter((apt) => {
      // Regra de faturamento: alterado SOMENTE se o status tiver sido concluído
      if (apt.status !== 'concluido') return false;
      const matchesPeriod = isDateInPeriod(apt.date, filterPeriod);
      const matchesBarber =
        filterBarber === 'todos' || apt.professionalName === filterBarber;
      return matchesPeriod && matchesBarber;
    });

    const filteredOrders = orders.filter((ord) => {
      if (ord.status === 'cancelado') return false;
      return isDateInPeriod(ord.date, filterPeriod);
    });

    const barberTotal = filteredAppointments.reduce((sum, apt) => sum + apt.price, 0);
    const clothingTotal =
      filterBarber === 'todos'
        ? filteredOrders.reduce((sum, ord) => sum + ord.totalAmount, 0)
        : 0;

    let total = 0;
    if (filterSource === 'todos') {
      total = barberTotal + clothingTotal;
    } else if (filterSource === 'barbearia') {
      total = barberTotal;
    } else if (filterSource === 'roupas') {
      total = clothingTotal;
    }

    return {
      total,
      barberTotal,
      clothingTotal,
      appointmentsCount: filteredAppointments.length,
      ordersCount: filteredOrders.length,
    };
  }, [appointments, orders, filterPeriod, filterBarber, filterSource]);

  // Prioridade de status para exibição no Dashboard:
  // 1. Solicitado (prioridade máxima) -> 2. Agendado -> 3. Confirmado -> 4. Concluído -> 5. Cancelado
  const STATUS_PRIORITY: Record<string, number> = {
    solicitado: 1,
    pendente: 1,
    agendado: 2,
    confirmado: 3,
    concluido: 4,
    cancelado: 5,
  };

  // Lista de Agendamentos filtrada e ordenada por prioridade de status
  const displayedAppointments = useMemo(() => {
    const filtered = appointments.filter((apt) => {
      const matchesPeriod = isDateInPeriod(apt.date, filterPeriod);
      const matchesBarber =
        filterBarber === 'todos' || apt.professionalName === filterBarber;
      const matchesStatus =
        filterAptStatus === 'todos' || apt.status === filterAptStatus;
      return matchesPeriod && matchesBarber && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const pA = STATUS_PRIORITY[a.status] ?? 99;
      const pB = STATUS_PRIORITY[b.status] ?? 99;
      if (pA !== pB) return pA - pB;
      // Dentro da mesma prioridade, ordena por data mais recente
      return b.date.localeCompare(a.date);
    });
  }, [appointments, filterPeriod, filterBarber, filterAptStatus]);

  // Paginação de clientes no Dashboard (Padrão: 20 clientes por página)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPeriod, filterBarber, filterAptStatus, itemsPerPage]);

  const totalPages = Math.ceil(displayedAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedAppointments.slice(start, start + itemsPerPage);
  }, [displayedAppointments, currentPage, itemsPerPage]);

  // Ações de Agendamento
  const updateAppointmentStatus = async (
    id: string,
    newStatus: AppointmentStatus,
    scheduledTime?: string,
    professionalId?: string,
    professionalName?: string
  ) => {
    await updateDbAppointmentStatus(id, newStatus, scheduledTime, professionalId, professionalName);
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status: newStatus,
              ...(scheduledTime ? { scheduledTime } : {}),
              ...(professionalId ? { professionalId } : {}),
              ...(professionalName ? { professionalName } : {}),
            }
          : apt
      )
    );
    toast({
      title: 'Status atualizado',
      description: `Agendamento marcado como ${newStatus}.`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este agendamento cancelado?')) {
      return;
    }
    await deleteDbAppointment(id);
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    toast({
      title: 'Agendamento excluído',
      description: 'O registro cancelado foi excluído com sucesso.',
      status: 'info',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleDeleteAllCancelled = async () => {
    const cancelledList = appointments.filter((a) => a.status === 'cancelado');
    if (cancelledList.length === 0) return;
    if (
      !window.confirm(
        `Tem certeza que deseja excluir permanentemente todos os ${cancelledList.length} agendamentos cancelados?`
      )
    ) {
      return;
    }
    for (const apt of cancelledList) {
      await deleteDbAppointment(apt.id);
    }
    setAppointments((prev) => prev.filter((a) => a.status !== 'cancelado'));
    toast({
      title: 'Agendamentos cancelados excluídos',
      description: `${cancelledList.length} registros foram excluídos com sucesso.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleSendWhatsAppConfirmation = (apt: Appointment) => {
    if (!apt.customerPhone) {
      toast({
        title: 'Telefone não informado',
        description: 'O cliente não informou o telefone no agendamento.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    const url = generateConfirmationRequestWhatsAppUrl({
      customerPhone: apt.customerPhone,
      customerName: apt.customerName,
      serviceName: apt.serviceName,
      professionalName: apt.professionalName,
      date: apt.date,
      time: apt.scheduledTime,
      appointmentId: apt.id,
    });

    window.open(url, '_blank');
  };

  const handleOpenScheduleModal = (apt: Appointment) => {
    setActiveSchedulingApt(apt);
    setScheduledTimeInput(apt.scheduledTime || '14:00');
    // Pre-seleciona o barbeiro existente ou o primeiro disponível se o cliente não escolheu nenhum
    const foundBarber = barbers.find(
      (b) =>
        b.name.toLowerCase() === apt.professionalName?.toLowerCase() ||
        b.id === apt.professionalId
    );
    setScheduledProfessionalName(foundBarber ? foundBarber.name : barbers[0]?.name || '');
    openScheduleModal();
  };

  const handleConfirmSchedule = async (sendWhatsApp: boolean = false) => {
    if (!activeSchedulingApt) return;

    if (!scheduledProfessionalName) {
      toast({
        title: 'Selecione o profissional',
        description: 'É obrigatório selecionar qual barbeiro fará o atendimento.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const profObj = barbers.find((b) => b.name === scheduledProfessionalName);

    await updateAppointmentStatus(
      activeSchedulingApt.id,
      'agendado',
      scheduledTimeInput,
      profObj?.id,
      scheduledProfessionalName
    );

    if (sendWhatsApp) {
      handleSendWhatsAppConfirmation({
        ...activeSchedulingApt,
        scheduledTime: scheduledTimeInput,
        professionalName: scheduledProfessionalName,
        professionalId: profObj?.id,
      });
    }

    closeScheduleModal();
  };

  // Toggle de estoque de produto
  const handleToggleStock = async (id: string, currentStock: boolean) => {
    await toggleDbProductStock(id, !currentStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !currentStock } : p))
    );
    toast({
      title: 'Estoque atualizado',
      status: 'info',
      duration: 1500,
    });
  };

  // Excluir produto
  const handleDeleteProduct = async (id: string) => {
    await deleteDbProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: 'Produto excluído',
      status: 'info',
      duration: 2000,
    });
  };

  // Criar nova peça de roupa
  const handleCreateProduct = async () => {
    if (!newProductName.trim() || !newProductPrice) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome e preço são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const sizesArray = newProductSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = await createDbProduct({
      name: newProductName,
      price: parseFloat(newProductPrice.replace(',', '.')) || 0,
      category: newProductCategory,
      description: newProductDescription,
      image: newProductImage,
      sizes: sizesArray,
      inStock: true,
    });

    if (created) {
      setProducts((prev) => [created, ...prev]);
      closeProductModal();
      setNewProductName('');
      setNewProductDescription('');

      toast({
        title: 'Peça adicionada!',
        description: `${created.name} já está disponível no catálogo de roupas.`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  // Criar nova venda avulsa
  const handleCreateSale = async () => {
    if (!saleCustomer.trim() || !saleAmount) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome do cliente e valor total são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbOrder({
      customerName: saleCustomer,
      items: [
        {
          productId: 'custom-sale',
          productName: saleProductItem || 'Peça da Loja',
          quantity: 1,
          price: parseFloat(saleAmount.replace(',', '.')) || 0,
        },
      ],
      totalAmount: parseFloat(saleAmount.replace(',', '.')) || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'concluido',
    });

    setOrders((prev) => [created, ...prev]);
    closeSaleModal();
    setSaleCustomer('');
    setSaleProductItem('');

    toast({
      title: 'Venda registrada!',
      description: `R$ ${created.totalAmount.toFixed(2)} contabilizados com sucesso.`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleUpdateOrderStatus = async (
    id: string,
    status: 'pendente' | 'concluido' | 'cancelado'
  ) => {
    await updateDbOrderStatus(id, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    toast({
      title: 'Status atualizado',
      description: `Pedido marcado como ${status}.`,
      status: 'info',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  // Criar agendamento manual
  const handleCreateAppointment = async () => {
    if (!newAptCustomer.trim()) {
      toast({
        title: 'Informe o cliente',
        status: 'warning',
      });
      return;
    }

    const serviceObj = barberServices.find((s) => s.name === newAptService);

    const created = await createDbAppointment({
      customerName: newAptCustomer,
      professionalName: newAptBarber,
      serviceId: serviceObj?.id || 'barber-service',
      serviceName: newAptService,
      date: newAptDate,
      shift: newAptShift,
      price: parseFloat(newAptPrice.replace(',', '.')) || 50,
      status: 'confirmado',
      type: 'barbearia',
      notes: '[Barbearia]',
    });

    setAppointments((prev) => [created, ...prev]);
    closeAppointmentModal();
    setNewAptCustomer('');

    toast({
      title: 'Agendamento criado!',
      description: `${created.serviceName} com ${created.professionalName} no dia ${created.date}.`,
      status: 'success',
      duration: 3000,
    });
  };

  // Cadastro de novo profissional
  const handleCreateProfessional = async () => {
    if (!newProfName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do profissional.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbProfessional({
      name: newProfName,
      role: newProfRole,
      avatar: newProfAvatar,
      specialty: newProfSpecialty,
    });

    setProfessionals((prev) => [...prev, created]);
    closeProfessionalModal();
    setNewProfName('');
    setNewProfSpecialty('');

    toast({
      title: 'Profissional adicionado!',
      description: `${created.name} (${created.role}) cadastrado com sucesso.`,
      status: 'success',
      duration: 3000,
    });
  };

  // Excluir profissional
  const handleDeleteProfessional = async (id: string) => {
    await deleteDbProfessional(id);
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: 'Profissional removido',
      status: 'info',
      duration: 2000,
    });
  };

  // Cadastro de novo serviço
  const handleCreateService = async () => {
    if (!newServName.trim() || !newServPrice) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome e valor do serviço são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbService({
      name: newServName,
      type: newServType,
      price: parseFloat(newServPrice.replace(',', '.')) || 0,
      durationMin: parseInt(newServDuration) || 30,
      category: newServCategory,
      description: newServDescription,
    });

    setServices((prev) => [...prev, created]);
    closeServiceModal();
    setNewServName('');
    setNewServDescription('');

    toast({
      title: 'Serviço cadastrado!',
      description: `${created.name} (${created.type}) adicionado ao catálogo.`,
      status: 'success',
      duration: 3000,
    });
  };

  // Excluir serviço
  const handleDeleteService = async (id: string) => {
    await deleteDbService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: 'Serviço removido',
      status: 'info',
      duration: 2000,
    });
  };

  const shiftBadges: Record<string, string> = {
    manha: 'orange',
    tarde: 'blue',
    noite: 'purple',
  };
  const statusColors: Record<string, string> = {
    solicitado: 'yellow',
    agendado: 'purple',
    confirmado: 'blue',
    concluido: 'green',
    pendente: 'yellow',
    cancelado: 'red',
  };

  return (
    <AdminAuthGuard module="barbearia">
      <Box pb={{ base: 16, md: 24 }} bg="#0b0d13" minH="100vh">
      {/* HEADER DEDICADO DO ADMIN (Agenda, Faturamento, Cadastros) */}
      <AdminHeader
        currentModule="barbearia_loja"
        activeTab={adminTab}
        onTabChange={setAdminTab}
        agendaCount={displayedAppointments.length}
        cadastrosCount={products.length + barberServices.length + barbers.length}
      />

      {/* Conteúdo Principal por Aba */}
      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} mt={{ base: 6, md: 8 }}>
        {/* ============================================================== */}
        {/* ABA 1: DASHBOARD GERAL DA BARBEARIA */}
        {/* ============================================================== */}
        {adminTab === 'dashboard' && (
          <Box>
            {/* Topo da Aba de Dashboard */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              gap={4}
              mb={6}
            >
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    DASHBOARD BARBEARIA
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Controle Geral de Atendimentos
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Dashboard dos Barbeiros
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Acompanhe e confirme os clientes marcados na barbearia.
                </Text>
              </Box>

              <Button
                size="sm"
                bg="brand.500"
                color="black"
                _hover={{ bg: 'brand.400' }}
                borderRadius="xl"
                leftIcon={<FiPlus />}
                onClick={openAppointmentModal}
                fontWeight="700"
                fontSize="xs"
              >
                Novo Agendamento
              </Button>
            </Flex>

            {/* Filtros da Agenda */}
            <Box
              p={{ base: 3, sm: 4 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              mb={6}
            >
              <Flex direction={{ base: 'column', sm: 'row' }} gap={3} align={{ base: 'stretch', sm: 'center' }}>
                <Box flex={1}>
                  <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                    Filtrar por Barbeiro
                  </Text>
                  <Select
                    size="sm"
                    borderRadius="xl"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={filterBarber}
                    onChange={(e) => setFilterBarber(e.target.value)}
                    fontSize="xs"
                  >
                    <option value="todos">Todos os Barbeiros</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box flex={1}>
                  <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                    Status do Agendamento
                  </Text>
                  <Select
                    size="sm"
                    borderRadius="xl"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={filterAptStatus}
                    onChange={(e) => setFilterAptStatus(e.target.value)}
                    fontSize="xs"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="solicitado">1. Solicitados</option>
                    <option value="agendado">2. Agendados</option>
                    <option value="confirmado">3. Confirmados (WhatsApp)</option>
                    <option value="concluido">4. Concluídos</option>
                    <option value="cancelado">Cancelados</option>
                  </Select>
                </Box>

                <Box flex={1}>
                  <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                    Período
                  </Text>
                  <Select
                    size="sm"
                    borderRadius="xl"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value as 'semanal' | 'mensal' | 'anual' | 'geral')}
                    fontSize="xs"
                  >
                    <option value="semanal">Últimos 7 dias</option>
                    <option value="mensal">Este Mês</option>
                    <option value="anual">Este Ano</option>
                    <option value="geral">Todos os Registros</option>
                  </Select>
                </Box>
              </Flex>
            </Box>

            {/* Lista de Agendamentos */}
            <Box
              p={{ base: 4, sm: 6 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
            >
              {displayedAppointments.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <FiCalendar size={36} color="#4a5568" style={{ margin: '0 auto 12px' }} />
                  <Text color="gray.400" fontSize="sm">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </Text>
                </Box>
              ) : (
                <>
                  {appointments.some((a) => a.status === 'cancelado') && (
                    <Flex justify="flex-end" mb={3}>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<FiTrash2 />}
                        onClick={handleDeleteAllCancelled}
                      >
                        Excluir todos cancelados ({appointments.filter((a) => a.status === 'cancelado').length})
                      </Button>
                    </Flex>
                  )}
                  {/* VISÃO MOBILE: CARDS */}
                  <VStack spacing={3} display={{ base: 'flex', md: 'none' }} align="stretch">
                    {paginatedAppointments.map((apt) => (
                      <Box
                        key={apt.id}
                        p={4}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <HStack spacing={2}>
                            <Avatar size="xs" name={apt.professionalName} bg="brand.500" color="black" />
                            <Text fontWeight="700" fontSize="sm" color="white">
                              {apt.customerName}
                            </Text>
                          </HStack>
                          <Badge colorScheme={statusColors[apt.status] || 'gray'} borderRadius="full" px={2} fontSize="2xs">
                            {apt.status}
                          </Badge>
                        </Flex>

                        <Text fontSize="xs" color="gray.300" mb={1}>
                          <Text as="span" fontWeight="700" color="brand.400">
                            {apt.serviceName}
                          </Text>{' '}
                          • com {apt.professionalName}
                        </Text>

                        <Flex justify="space-between" align="center" fontSize="2xs" color="gray.400" mb={3}>
                          <Text>
                            {apt.date.split('-').reverse().join('/')} • Turno:{' '}
                            <Badge colorScheme={shiftBadges[apt.shift]} fontSize="2xs">
                              {apt.shift}
                            </Badge>
                          </Text>
                          <Text fontWeight="800" color="brand.400" fontSize="xs">
                            R$ {apt.price.toFixed(2).replace('.', ',')}
                          </Text>
                        </Flex>

                        <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100" flexWrap="wrap">
                          {(apt.status === 'solicitado' || apt.status === 'pendente') && (
                            <Button
                              size="xs"
                              colorScheme="purple"
                              variant="solid"
                              flex={1}
                              leftIcon={<FiCalendar />}
                              onClick={() => handleOpenScheduleModal(apt)}
                            >
                              Agendar
                            </Button>
                          )}
                          {apt.status === 'agendado' && (
                            <>
                              <Button
                                size="xs"
                                bg="#25D366"
                                color="white"
                                _hover={{ bg: '#1ebc57' }}
                                flex={1}
                                leftIcon={<FaWhatsapp />}
                                onClick={() => handleSendWhatsAppConfirmation(apt)}
                              >
                                Enviar WhatsApp
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                flex={1}
                                leftIcon={<FiCheckCircle />}
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmado')}
                              >
                                Confirmar
                              </Button>
                            </>
                          )}
                          {apt.status === 'confirmado' && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              variant="solid"
                              flex={1}
                              leftIcon={<FiCheckCircle />}
                              onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                            >
                              Concluir Atendimento
                            </Button>
                          )}
                          {apt.status === 'cancelado' && (
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<FiTrash2 />}
                              onClick={() => handleDeleteAppointment(apt.id)}
                            >
                              Excluir
                            </Button>
                          )}
                          {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              leftIcon={<FiXCircle />}
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelado')}
                            >
                              Cancelar
                            </Button>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>

                  {/* VISÃO DESKTOP: TABELA */}
                  <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Data</Th>
                          <Th>Cliente</Th>
                          <Th>Barbeiro</Th>
                          <Th>Serviço</Th>
                          <Th>Turno</Th>
                          <Th isNumeric>Valor</Th>
                          <Th>Status</Th>
                          <Th textAlign="center">Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paginatedAppointments.map((apt) => (
                          <Tr key={apt.id} _hover={{ bg: 'whiteAlpha.50' }}>
                            <Td fontWeight="600">{apt.date.split('-').reverse().join('/')}</Td>
                            <Td fontWeight="600" color="white">
                              {apt.customerName}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Avatar size="xs" name={apt.professionalName} bg="brand.500" color="black" />
                                <Text>{apt.professionalName}</Text>
                              </HStack>
                            </Td>
                            <Td color="brand.400" fontWeight="600">
                              {apt.serviceName}
                            </Td>
                            <Td>
                              <Badge colorScheme={shiftBadges[apt.shift]} borderRadius="md" px={2}>
                                {apt.shift}
                              </Badge>
                            </Td>
                            <Td isNumeric fontWeight="700">
                              R$ {apt.price.toFixed(2).replace('.', ',')}
                            </Td>
                            <Td>
                              <Badge colorScheme={statusColors[apt.status] || 'gray'} borderRadius="full" px={2}>
                                {apt.status}
                              </Badge>
                            </Td>
                            <Td textAlign="center">
                              <HStack spacing={1} justify="center">
                                {(apt.status === 'solicitado' || apt.status === 'pendente') && (
                                  <Button
                                    size="xs"
                                    colorScheme="purple"
                                    variant="solid"
                                    leftIcon={<FiCalendar />}
                                    title="Definir Horário e Agendar"
                                    onClick={() => handleOpenScheduleModal(apt)}
                                  >
                                    Agendar
                                  </Button>
                                )}
                                {apt.status === 'agendado' && (
                                  <>
                                    <IconButton
                                      aria-label="Enviar WhatsApp de confirmação"
                                      icon={<FaWhatsapp size={14} />}
                                      size="xs"
                                      bg="#25D366"
                                      color="white"
                                      _hover={{ bg: '#1ebc57' }}
                                      title="Enviar Link de Confirmação no WhatsApp"
                                      onClick={() => handleSendWhatsAppConfirmation(apt)}
                                    />
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      variant="outline"
                                      leftIcon={<FiCheckCircle />}
                                      title="Marcar como Confirmado"
                                      onClick={() => updateAppointmentStatus(apt.id, 'confirmado')}
                                    >
                                      Confirmar
                                    </Button>
                                  </>
                                )}
                                {apt.status === 'confirmado' && (
                                  <Button
                                    size="xs"
                                    colorScheme="green"
                                    variant="solid"
                                    leftIcon={<FiCheckCircle />}
                                    title="Concluir Atendimento e somar no Faturamento"
                                    onClick={() => updateAppointmentStatus(apt.id, 'concluido')}
                                  >
                                    Concluir
                                  </Button>
                                )}
                                {apt.status === 'cancelado' && (
                                  <IconButton
                                    aria-label="Excluir agendamento cancelado"
                                    icon={<FiTrash2 />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    title="Excluir agendamento cancelado"
                                    onClick={() => handleDeleteAppointment(apt.id)}
                                  />
                                )}
                                {apt.status !== 'cancelado' && apt.status !== 'concluido' && (
                                  <IconButton
                                    aria-label="Cancelar agendamento"
                                    icon={<FiXCircle />}
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    title="Cancelar Agendamento"
                                    onClick={() => updateAppointmentStatus(apt.id, 'cancelado')}
                                  />
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* CONTROLE DE PAGINAÇÃO INTERATIVO */}
                  <Pagination
                    currentPage={currentPage}
                    totalItems={displayedAppointments.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newVal) => {
                      setItemsPerPage(newVal);
                      setCurrentPage(1);
                    }}
                    colorScheme="yellow"
                    accentColor="#d9a647"
                    itemLabel="clientes"
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* ABA 2: AGENDA DA BARBEARIA (CALENDÁRIO COM HORÁRIOS) */}
        {/* ============================================================== */}
        {adminTab === 'agenda' && (
          <Box>
            <AdminCalendarView
              appointments={appointments}
              professionals={barbers}
              module="barbearia"
              onStatusChange={updateAppointmentStatus}
              onOpenScheduleModal={handleOpenScheduleModal}
              onSendWhatsApp={handleSendWhatsAppConfirmation}
              onOpenNewAppointmentModal={(selectedDate) => {
                if (selectedDate) setNewAptDate(selectedDate);
                openAppointmentModal();
              }}
            />
          </Box>
        )}

        {/* ============================================================== */}
        {/* ABA 3: FATURAMENTO & HISTÓRICO DE VENDAS */}
        {/* ============================================================== */}
        {adminTab === 'faturamento' && (
          <Box>
            {/* Topo do Faturamento */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              gap={4}
              mb={6}
            >
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    FINANCEIRO
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Relatório Integrado de Caixa
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Métricas de Faturamento
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Receitas combinadas de cortes na barbearia e vendas na loja de roupas.
                </Text>
              </Box>

              <Button
                size="sm"
                bg="brand.500"
                color="black"
                _hover={{ bg: 'brand.400' }}
                borderRadius="xl"
                leftIcon={<FiShoppingBag />}
                onClick={openSaleModal}
                fontWeight="700"
                fontSize="xs"
              >
                Registrar Venda Avulsa
              </Button>
            </Flex>

            {/* Filtros Financeiros */}
            <Box
              p={{ base: 4, sm: 5 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              mb={{ base: 6, md: 8 }}
            >
              <Flex
                direction={{ base: 'column', lg: 'row' }}
                gap={4}
                justify="space-between"
                align={{ base: 'stretch', lg: 'center' }}
              >
                <HStack spacing={3}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="brand.500"
                    color="black"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiFilter size={18} />
                  </Box>
                  <Box>
                    <Text fontWeight="700" fontSize="sm">
                      Filtros de Relatório
                    </Text>
                    <Text fontSize="2xs" color="gray.400">
                      Separe por barbeiro, tipo de receita ou período
                    </Text>
                  </Box>
                </HStack>

                <Flex direction={{ base: 'column', sm: 'row' }} gap={3} flexWrap="wrap">
                  {/* Filtro por Barbeiro */}
                  <Box minW={{ base: '100%', sm: '170px' }}>
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                      Barbeiro
                    </Text>
                    <Select
                      size="sm"
                      borderRadius="xl"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={filterBarber}
                      onChange={(e) => setFilterBarber(e.target.value)}
                      fontSize="xs"
                    >
                      <option value="todos">Todos os Barbeiros</option>
                      {barbers.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {/* Filtro por Origem (Roupas vs Barbearia) */}
                  <Box minW={{ base: '100%', sm: '180px' }}>
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                      Tipo de Receita
                    </Text>
                    <Select
                      size="sm"
                      borderRadius="xl"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value as 'todos' | 'barbearia' | 'roupas')}
                      fontSize="xs"
                    >
                      <option value="todos">Todos (Roupas + Barbearia)</option>
                      <option value="barbearia">Apenas Barbearia</option>
                      <option value="roupas">Apenas Loja de Roupas</option>
                    </Select>
                  </Box>

                  {/* Filtro de Período (Semanal, Mensal, Anual, Geral) */}
                  <Box minW={{ base: '100%', sm: '200px' }}>
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                      Período
                    </Text>
                    <HStack spacing={1} w="100%">
                      {(['semanal', 'mensal', 'anual', 'geral'] as const).map((period) => (
                        <Button
                          key={period}
                          size="sm"
                          flex={1}
                          borderRadius="lg"
                          variant={filterPeriod === period ? 'solid' : 'ghost'}
                          colorScheme="yellow"
                          bg={filterPeriod === period ? 'brand.500' : 'transparent'}
                          color={filterPeriod === period ? 'black' : 'gray.400'}
                          onClick={() => setFilterPeriod(period)}
                          textTransform="capitalize"
                          fontSize="2xs"
                          px={2}
                        >
                          {period}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                </Flex>
              </Flex>
            </Box>

            {/* Cards de Métricas Financeiras */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, sm: 4, md: 6 }} mb={{ base: 6, md: 10 }}>
              {/* Total Geral */}
              <Card bg={cardBg} border="1px solid" borderColor="brand.500" borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Total Arrecadado ({filterPeriod})
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="brand.500" color="black">
                      <FiDollarSign size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="brand.400" fontWeight="900">
                    R$ {metrics.total.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Faturamento consolidado no período
                  </Text>
                </CardBody>
              </Card>

              {/* Barbearia */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Receita Barbearia
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="blue.500" color="white">
                      <FiScissors size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="blue.400" fontWeight="900">
                    R$ {metrics.barberTotal.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    {metrics.appointmentsCount} atendimentos realizados
                  </Text>
                </CardBody>
              </Card>

              {/* Loja de Roupas */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Receita Loja de Roupas
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="purple.500" color="white">
                      <FiShoppingBag size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="purple.400" fontWeight="900">
                    R$ {metrics.clothingTotal.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    {metrics.ordersCount} vendas finalizadas
                  </Text>
                </CardBody>
              </Card>

              {/* Ticket Médio / Balanço */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Ticket Médio
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="green.500" color="black">
                      <FiTrendingUp size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="green.400" fontWeight="900">
                    R${' '}
                    {metrics.appointmentsCount + metrics.ordersCount > 0
                      ? (metrics.total / (metrics.appointmentsCount + metrics.ordersCount)).toFixed(2).replace('.', ',')
                      : '0,00'}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Média por cliente / transação
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Desempenho por Barbeiro */}
            <Box
              p={{ base: 4, sm: 6 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              mb={8}
            >
              <Heading as="h3" size="sm" mb={4} color="white">
                Desempenho por Barbeiro
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                {barbers.map((b) => {
                  const profApts = appointments.filter(
                    (a) => a.professionalName === b.name && isDateInPeriod(a.date, filterPeriod) && a.status !== 'cancelado'
                  );
                  const profRevenue = profApts.reduce((sum, a) => sum + a.price, 0);

                  return (
                    <Box
                      key={b.id}
                      p={4}
                      borderRadius="xl"
                      bg="#0b0d13"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <HStack spacing={3} mb={3}>
                        <Avatar size="sm" name={b.name} src={b.avatar} bg="brand.500" color="black" />
                        <Box>
                          <Text fontWeight="700" fontSize="sm" color="white">
                            {b.name}
                          </Text>
                          <Text fontSize="2xs" color="gray.400">
                            {b.specialty || 'Barbeiro'}
                          </Text>
                        </Box>
                      </HStack>

                      <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                        <Text fontSize="xs" color="gray.400">
                          {profApts.length} atendimentos
                        </Text>
                        <Text fontWeight="900" color="brand.400" fontSize="sm">
                          R$ {profRevenue.toFixed(2).replace('.', ',')}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Histórico de Vendas & Compras */}
            <Box
              p={{ base: 4, sm: 6 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading as="h3" size="sm" mb={4} color="white">
                Histórico de Vendas da Loja de Roupas
              </Heading>

              {orders.length === 0 ? (
                <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                  Nenhuma venda de roupa registrada até o momento.
                </Text>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <VStack spacing={3} display={{ base: 'flex', md: 'none' }} align="stretch">
                    {orders.map((ord) => (
                      <Box
                        key={ord.id}
                        p={4}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontWeight="700" fontSize="sm" color="white">
                            {ord.customerName}
                          </Text>
                          <Badge
                            colorScheme={
                              ord.status === 'concluido'
                                ? 'green'
                                : ord.status === 'pendente'
                                ? 'yellow'
                                : 'red'
                            }
                            borderRadius="full"
                            px={2}
                            fontSize="2xs"
                          >
                            {ord.status}
                          </Badge>
                        </Flex>

                        <VStack align="start" spacing={0.5} mb={2}>
                          {ord.items.map((it, idx) => (
                            <Text key={idx} fontSize="xs" color="gray.300">
                              {it.quantity}x {it.productName} {it.size ? `(Tam: ${it.size})` : ''}
                            </Text>
                          ))}
                        </VStack>

                        <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                          <Text fontSize="2xs" color="gray.400">
                            {ord.date.split('-').reverse().join('/')}
                          </Text>
                          <Text fontWeight="800" color="brand.400" fontSize="sm">
                            R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                          </Text>
                        </Flex>

                        {ord.status === 'pendente' && (
                          <HStack spacing={2} pt={2} mt={2} borderTop="1px dashed" borderColor="whiteAlpha.100">
                            <Button
                              size="xs"
                              colorScheme="green"
                              flex={1}
                              onClick={() => handleUpdateOrderStatus(ord.id, 'concluido')}
                            >
                              Concluir Venda
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'cancelado')}
                            >
                              Cancelar
                            </Button>
                          </HStack>
                        )}
                      </Box>
                    ))}
                  </VStack>

                  {/* Desktop Table */}
                  <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Data</Th>
                          <Th>Cliente</Th>
                          <Th>Itens Comprados</Th>
                          <Th isNumeric>Valor Total</Th>
                          <Th>Status</Th>
                          <Th textAlign="center">Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {orders.map((ord) => (
                          <Tr key={ord.id} _hover={{ bg: 'whiteAlpha.50' }}>
                            <Td fontWeight="600">{ord.date.split('-').reverse().join('/')}</Td>
                            <Td fontWeight="600">{ord.customerName}</Td>
                            <Td>
                              <VStack align="start" spacing={0.5}>
                                {ord.items.map((it, idx) => (
                                  <Text key={idx} fontSize="xs" color="gray.300">
                                    {it.quantity}x {it.productName} {it.size ? `(Tam: ${it.size})` : ''}
                                  </Text>
                                ))}
                              </VStack>
                            </Td>
                            <Td isNumeric fontWeight="700" color="brand.400">
                              R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  ord.status === 'concluido'
                                    ? 'green'
                                    : ord.status === 'pendente'
                                    ? 'yellow'
                                    : 'red'
                                }
                                borderRadius="full"
                                px={2}
                              >
                                {ord.status}
                              </Badge>
                            </Td>
                            <Td textAlign="center">
                              {ord.status === 'pendente' ? (
                                <HStack spacing={1} justify="center">
                                  <Button
                                    size="xs"
                                    colorScheme="green"
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'concluido')}
                                  >
                                    Concluir
                                  </Button>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'cancelado')}
                                  >
                                    Cancelar
                                  </Button>
                                </HStack>
                              ) : (
                                <Text fontSize="xs" color="gray.500">
                                  Finalizado
                                </Text>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* ABA 3: CADASTROS (SERVIÇOS, ROUPAS, BARBEIROS) */}
        {/* ============================================================== */}
        {adminTab === 'cadastros' && (
          <Box>
            {/* Topo dos Cadastros */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              gap={4}
              mb={6}
            >
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge colorScheme="yellow" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    GESTÃO & CADASTROS
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Criação de Serviços, Peças de Roupa e Equipe
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Cadastrar & Gerenciar
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Adicione novos serviços ao catálogo, peças à loja streetwear ou barbeiros à equipe.
                </Text>
              </Box>

              {/* Botão de Adição Contextual */}
              {cadastrosSubTab === 'servicos' && (
                <Button
                  size="sm"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openServiceModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Novo Serviço
                </Button>
              )}
              {cadastrosSubTab === 'roupas' && (
                <Button
                  size="sm"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openProductModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Cadastrar Nova Peça
                </Button>
              )}
              {cadastrosSubTab === 'barbeiros' && (
                <Button
                  size="sm"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openProfessionalModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Novo Barbeiro
                </Button>
              )}
            </Flex>

            {/* Sub-navegação de Cadastros */}
            <HStack
              spacing={2}
              mb={6}
              pb={2}
              overflowX="auto"
              css={{
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}
            >
              <Button
                size="sm"
                borderRadius="xl"
                variant={cadastrosSubTab === 'servicos' ? 'solid' : 'outline'}
                colorScheme="yellow"
                bg={cadastrosSubTab === 'servicos' ? 'brand.500' : 'transparent'}
                color={cadastrosSubTab === 'servicos' ? 'black' : 'gray.300'}
                onClick={() => setCadastrosSubTab('servicos')}
                leftIcon={<FiLayers />}
                fontSize="xs"
                fontWeight="700"
              >
                Serviços ({barberServices.length})
              </Button>

              <Button
                size="sm"
                borderRadius="xl"
                variant={cadastrosSubTab === 'roupas' ? 'solid' : 'outline'}
                colorScheme="yellow"
                bg={cadastrosSubTab === 'roupas' ? 'brand.500' : 'transparent'}
                color={cadastrosSubTab === 'roupas' ? 'black' : 'gray.300'}
                onClick={() => setCadastrosSubTab('roupas')}
                leftIcon={<FiShoppingBag />}
                fontSize="xs"
                fontWeight="700"
              >
                Roupas & Loja ({products.length})
              </Button>

              <Button
                size="sm"
                borderRadius="xl"
                variant={cadastrosSubTab === 'barbeiros' ? 'solid' : 'outline'}
                colorScheme="yellow"
                bg={cadastrosSubTab === 'barbeiros' ? 'brand.500' : 'transparent'}
                color={cadastrosSubTab === 'barbeiros' ? 'black' : 'gray.300'}
                onClick={() => setCadastrosSubTab('barbeiros')}
                leftIcon={<FiUsers />}
                fontSize="xs"
                fontWeight="700"
              >
                Barbeiros ({barbers.length})
              </Button>
            </HStack>

            {/* SUB-ABA 1: SERVIÇOS DA BARBEARIA */}
            {cadastrosSubTab === 'servicos' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Catálogo de Serviços da Barbearia
                </Heading>

                {barberServices.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhum serviço cadastrado ainda. Clique em &quot;Novo Serviço&quot; para começar.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {barberServices.map((serv) => (
                      <Box
                        key={serv.id}
                        p={4}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Flex justify="space-between" align="flex-start" mb={2}>
                            <Badge colorScheme="yellow" px={2} borderRadius="md" fontSize="2xs">
                              {serv.category || 'Barbearia'}
                            </Badge>
                            <IconButton
                              aria-label="Excluir serviço"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteService(serv.id)}
                            />
                          </Flex>
                          <Text fontWeight="800" fontSize="md" color="white" mb={1}>
                            {serv.name}
                          </Text>
                          {serv.description && (
                            <Text fontSize="xs" color="gray.400" mb={3} noOfLines={2}>
                              {serv.description}
                            </Text>
                          )}
                        </Box>

                        <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                          <HStack spacing={1} color="gray.400" fontSize="xs">
                            <FiClock size={12} />
                            <Text>{serv.durationMin} min</Text>
                          </HStack>
                          <Text fontWeight="900" color="brand.400" fontSize="md">
                            R$ {serv.price.toFixed(2).replace('.', ',')}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* SUB-ABA 2: ROUPAS DA LOJA */}
            {cadastrosSubTab === 'roupas' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Catálogo de Roupas & Streetwear
                </Heading>

                {products.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhuma peça de roupa cadastrada ainda. Clique em &quot;Cadastrar Nova Peça&quot;.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                    {products.map((prod) => (
                      <Box
                        key={prod.id}
                        p={3}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Box position="relative" borderRadius="lg" overflow="hidden" mb={3} h="180px">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                            <Badge
                              position="absolute"
                              top={2}
                              right={2}
                              colorScheme={prod.inStock ? 'green' : 'red'}
                              borderRadius="full"
                              px={2}
                              fontSize="2xs"
                            >
                              {prod.inStock ? 'Em Estoque' : 'Esgotado'}
                            </Badge>
                          </Box>

                          <Text fontWeight="800" fontSize="sm" color="white" mb={1} noOfLines={1}>
                            {prod.name}
                          </Text>
                          <Text fontSize="2xs" color="gray.400" mb={2}>
                            {prod.category} • Tam: {prod.sizes.join(', ')}
                          </Text>
                        </Box>

                        <Box pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="900" color="brand.400" fontSize="sm">
                              R$ {prod.price.toFixed(2).replace('.', ',')}
                            </Text>
                            <IconButton
                              aria-label="Excluir peça"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteProduct(prod.id)}
                            />
                          </Flex>

                          <Flex justify="space-between" align="center">
                            <Text fontSize="2xs" color="gray.400">
                              Disponível na Loja:
                            </Text>
                            <Switch
                              size="sm"
                              colorScheme="yellow"
                              isChecked={prod.inStock}
                              onChange={() => handleToggleStock(prod.id, prod.inStock)}
                            />
                          </Flex>
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* SUB-ABA 3: EQUIPE DE BARBEIROS */}
            {cadastrosSubTab === 'barbeiros' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Equipe de Barbeiros Cadastrados
                </Heading>

                {barbers.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhum barbeiro cadastrado. Clique em &quot;Novo Barbeiro&quot; para adicionar.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                    {barbers.map((barber) => (
                      <Box
                        key={barber.id}
                        p={4}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="flex-start" mb={3}>
                          <HStack spacing={3}>
                            <Avatar size="md" name={barber.name} src={barber.avatar} />
                            <Box>
                              <Text fontWeight="800" fontSize="sm" color="white">
                                {barber.name}
                              </Text>
                              <Badge colorScheme="yellow" borderRadius="md" px={2} fontSize="2xs">
                                Barbeiro
                              </Badge>
                            </Box>
                          </HStack>
                          <IconButton
                            aria-label="Remover barbeiro"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteProfessional(barber.id)}
                          />
                        </Flex>

                        {barber.specialty && (
                          <Text fontSize="xs" color="gray.400">
                            <Text as="span" fontWeight="700" color="gray.300">
                              Especialidade:{' '}
                            </Text>
                            {barber.specialty}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* ============================================================== */}
      {/* MODAL 1: CADASTRAR NOVA ROUPA */}
      {/* ============================================================== */}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal} size={{ base: 'full', sm: 'lg' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Cadastrar Nova Peça de Roupa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Produto</FormLabel>
                <Input
                  placeholder="Ex: Camiseta Streetwear Acid Wash"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Preço (R$)</FormLabel>
                  <Input
                    placeholder="139.90"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs">Categoria</FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                  >
                    <option value="Camisetas">Camisetas</option>
                    <option value="Moletons">Moletons</option>
                    <option value="Calças">Calças</option>
                    <option value="Camisas">Camisas</option>
                    <option value="Casacos">Casacos</option>
                    <option value="Acessórios">Acessórios</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs">Tamanhos Disponíveis (separados por vírgula)</FormLabel>
                <Input
                  placeholder="P, M, G, GG"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProductSizes}
                  onChange={(e) => setNewProductSizes(e.target.value)}
                />
              </FormControl>

              <ImageUpload
                label="Foto da Peça de Roupa (Upload)"
                value={newProductImage}
                onChange={setNewProductImage}
                folder="roupas"
                accentColor="brand.500"
                helperText="Faça upload da foto da peça de roupa. A imagem será otimizada automaticamente."
              />

              <FormControl>
                <FormLabel fontSize="xs">Descrição Detalhada</FormLabel>
                <Textarea
                  placeholder="Detalhes sobre o tecido, corte, caimento..."
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeProductModal}>
              Cancelar
            </Button>
            <Button bg="brand.500" color="black" _hover={{ bg: 'brand.400' }} onClick={handleCreateProduct}>
              Salvar Peça
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: REGISTRAR NOVA VENDA DE ROUPAS */}
      {/* ============================================================== */}
      <Modal isOpen={isSaleModalOpen} onClose={closeSaleModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Registrar Venda de Roupas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Cliente</FormLabel>
                <Input
                  placeholder="Ex: Marcelo Fagundes"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Peça(s) Vendida(s)</FormLabel>
                <Input
                  placeholder="Ex: Moletom Off-White (G)"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={saleProductItem}
                  onChange={(e) => setSaleProductItem(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Valor Total da Venda (R$)</FormLabel>
                <Input
                  placeholder="289.00"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeSaleModal}>
              Cancelar
            </Button>
            <Button bg="brand.500" color="black" _hover={{ bg: 'brand.400' }} onClick={handleCreateSale}>
              Confirmar Venda
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: NOVO AGENDAMENTO MANUAL DE BARBEARIA */}
      {/* ============================================================== */}
      <Modal isOpen={isAppointmentModalOpen} onClose={closeAppointmentModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Novo Agendamento na Barbearia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Cliente</FormLabel>
                <Input
                  placeholder="Ex: Gabriel Rezende"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptCustomer}
                  onChange={(e) => setNewAptCustomer(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Barbeiro que fará o serviço</FormLabel>
                <Select
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptBarber}
                  onChange={(e) => setNewAptBarber(e.target.value)}
                  placeholder={barbers.length === 0 ? 'Nenhum barbeiro cadastrado' : 'Selecione o barbeiro'}
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Serviço que vai ser feito</FormLabel>
                <Select
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptService}
                  onChange={(e) => {
                    setNewAptService(e.target.value);
                    const found = barberServices.find((s) => s.name === e.target.value);
                    if (found) setNewAptPrice(found.price.toFixed(2));
                  }}
                >
                  {barberServices.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (R$ {s.price.toFixed(2)})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Data</FormLabel>
                  <Input
                    type="date"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newAptDate}
                    onChange={(e) => setNewAptDate(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs">Turno</FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newAptShift}
                    onChange={(e) => setNewAptShift(e.target.value as 'manha' | 'tarde' | 'noite')}
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Valor (R$)</FormLabel>
                <Input
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptPrice}
                  onChange={(e) => setNewAptPrice(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeAppointmentModal}>
              Cancelar
            </Button>
            <Button bg="brand.500" color="black" _hover={{ bg: 'brand.400' }} onClick={handleCreateAppointment}>
              Criar Agendamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 4: CADASTRAR NOVO PROFISSIONAL */}
      {/* ============================================================== */}
      <Modal isOpen={isProfessionalModalOpen} onClose={closeProfessionalModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Cadastrar Novo Profissional</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome Completo</FormLabel>
                <Input
                  placeholder="Ex: Rafael Silva"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Área de Atuação</FormLabel>
                <Select
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProfRole}
                  onChange={(e) => setNewProfRole(e.target.value as 'barbeiro' | 'manicure')}
                >
                  <option value="barbeiro">Barbeiro</option>
                  <option value="manicure">Manicure / Nail Designer</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Especialidade / Técnicas</FormLabel>
                <Input
                  placeholder="Ex: Fade navalhado, Visagismo, Barba terapia"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProfSpecialty}
                  onChange={(e) => setNewProfSpecialty(e.target.value)}
                />
              </FormControl>

              <ImageUpload
                label="Foto de Perfil do Barbeiro (Upload)"
                value={newProfAvatar}
                onChange={setNewProfAvatar}
                folder="barbeiros"
                accentColor="brand.500"
                helperText="Selecione uma foto de rosto do barbeiro."
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeProfessionalModal}>
              Cancelar
            </Button>
            <Button bg="brand.500" color="black" _hover={{ bg: 'brand.400' }} onClick={handleCreateProfessional}>
              Adicionar Profissional
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 5: CADASTRAR NOVO SERVIÇO */}
      {/* ============================================================== */}
      <Modal isOpen={isServiceModalOpen} onClose={closeServiceModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Cadastrar Novo Serviço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Serviço</FormLabel>
                <Input
                  placeholder="Ex: Corte Degradê + Barba Terapia"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newServName}
                  onChange={(e) => setNewServName(e.target.value)}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Tipo do Estabelecimento</FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServType}
                    onChange={(e) => {
                      const type = e.target.value as 'barbearia' | 'manicure';
                      setNewServType(type);
                      setNewServCategory(type === 'barbearia' ? 'Cabelo' : 'Mãos');
                    }}
                  >
                    <option value="barbearia">Barbearia</option>
                    <option value="manicure">Manicure</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs">Categoria</FormLabel>
                  <Input
                    placeholder={newServType === 'barbearia' ? 'Ex: Cabelo, Barba, Combo' : 'Ex: Mãos, Pés, Alongamento'}
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServCategory}
                    onChange={(e) => setNewServCategory(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Preço (R$)</FormLabel>
                  <Input
                    placeholder="50.00"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServPrice}
                    onChange={(e) => setNewServPrice(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs">Duração Estimada (min)</FormLabel>
                  <Input
                    type="number"
                    placeholder="45"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServDuration}
                    onChange={(e) => setNewServDuration(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="xs">Descrição do Serviço</FormLabel>
                <Textarea
                  placeholder="Explique o que inclui o serviço..."
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newServDescription}
                  onChange={(e) => setNewServDescription(e.target.value)}
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeServiceModal}>
              Cancelar
            </Button>
            <Button bg="brand.500" color="black" _hover={{ bg: 'brand.400' }} onClick={handleCreateService}>
              Salvar Serviço
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL DEFINIR HORÁRIO E ENVIAR WHATSAPP (OPÇÃO 1) */}
      <Modal isOpen={isScheduleModalOpen} onClose={closeScheduleModal} isCentered size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor} color="white" borderRadius={{ base: 'none', sm: '2xl' }}>
          <ModalHeader fontSize="md" fontWeight="800">
            Definir Horário e Agendar
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeSchedulingApt && (
              <VStack spacing={4} align="stretch">
                <Box bg="#0b0d13" p={3} borderRadius="xl" border="1px solid" borderColor={borderColor} fontSize="xs">
                  <Text color="gray.400">Cliente: <strong style={{ color: '#fff' }}>{activeSchedulingApt.customerName}</strong></Text>
                  <Text color="gray.400">Serviço: <strong style={{ color: '#d9a647' }}>{activeSchedulingApt.serviceName}</strong></Text>
                  <Text color="gray.400">Barbeiro: <strong style={{ color: '#fff' }}>{activeSchedulingApt.professionalName}</strong></Text>
                  <Text color="gray.400">Data sugerida: <strong style={{ color: '#fff' }}>{activeSchedulingApt.date.split('-').reverse().join('/')}</strong> (Turno: {activeSchedulingApt.shift})</Text>
                  {activeSchedulingApt.customerPhone && (
                    <Text color="gray.400">WhatsApp: <strong style={{ color: '#25D366' }}>{activeSchedulingApt.customerPhone}</strong></Text>
                  )}
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Barbeiro Responsável
                  </FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={scheduledProfessionalName}
                    onChange={(e) => setScheduledProfessionalName(e.target.value)}
                    size="md"
                    borderRadius="lg"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                  {(!activeSchedulingApt.professionalName ||
                    activeSchedulingApt.professionalName.toLowerCase().includes('qualquer')) && (
                    <Text fontSize="2xs" color="yellow.400" mt={1}>
                      ⚠️ O cliente não escolheu nenhum profissional específico. Selecione acima quem fará o atendimento.
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Horário Marcado do Atendimento
                  </FormLabel>
                  <Input
                    type="time"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={scheduledTimeInput}
                    onChange={(e) => setScheduledTimeInput(e.target.value)}
                    size="md"
                    borderRadius="lg"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap={2} flexWrap="wrap">
            <Button variant="ghost" size="sm" onClick={closeScheduleModal}>
              Cancelar
            </Button>
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={() => handleConfirmSchedule(false)}
            >
              Apenas Agendar
            </Button>
            <Button
              size="sm"
              bg="#25D366"
              color="white"
              _hover={{ bg: '#1ebc57' }}
              leftIcon={<FaWhatsapp />}
              onClick={() => handleConfirmSchedule(true)}
            >
              Agendar e Enviar WhatsApp
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
    </AdminAuthGuard>
  );
}
