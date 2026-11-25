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
  Avatar,
  useToast,
  Flex,
  Card,
  CardBody,
  Switch,
  Image,
} from '@chakra-ui/react';
import AdminHeader, { AdminTab } from '@/components/AdminHeader';
import AdminCalendarView from '@/components/AdminCalendarView';
import Pagination from '@/components/Pagination';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import ImageUpload from '@/components/ImageUpload';
import {
  FiHeart,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiTrendingUp,
  FiUsers,
  FiLayers,
  FiClock,
  FiShoppingBag,
  FiCalendar,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { generateConfirmationRequestWhatsAppUrl } from '@/lib/whatsapp';
import {
  INITIAL_PROFESSIONALS,
  INITIAL_MANICURE_SERVICES,
} from '@/lib/mockData';
import { Appointment, Professional, ManicureService, Product, OrderSale, AppointmentStatus } from '@/types';
import {
  getDbAppointments,
  createDbAppointment,
  updateDbAppointmentStatus,
  deleteDbAppointment,
  getDbProfessionals,
  createDbProfessional,
  deleteDbProfessional,
  getDbServices,
  createDbService,
  deleteDbService,
  getDbProducts,
  createDbProduct,
  toggleDbProductStock,
  deleteDbProduct,
  getDbOrders,
  createDbOrder,
  isManicureAppointment,
  isManicureOrder,
} from '@/services/db';

export default function AdminManicurePage() {
  // Controle das 4 Abas Principais do Painel (Dashboard, Agenda, Faturamento, Cadastros)
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [cadastrosSubTab, setCadastrosSubTab] = useState<'procedimentos' | 'produtos' | 'manicures'>('procedimentos');

  // Estados dos Dados de Manicure
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<ManicureService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderSale[]>([]);

  // Carrega dados do Supabase
  useEffect(() => {
    async function loadManicureData() {
      try {
        const [apts, profs, servs, prods, ords] = await Promise.all([
          getDbAppointments(),
          getDbProfessionals('manicure'),
          getDbServices('manicure'),
          getDbProducts('manicure'),
          getDbOrders(),
        ]);

        const manicureProfs = profs.filter((p) => p.role === 'manicure');
        const manicureServicesList = servs as ManicureService[];

        // Filtra agendamentos de manicure de forma robusta e precisa
        const manicureApts = apts.filter((apt) =>
          isManicureAppointment(apt, manicureProfs, manicureServicesList)
        );

        // Filtra pedidos de manicure (esmaltes, tratamentos, vendas avulsas de manicure)
        const manicureOrders = ords.filter(isManicureOrder);

        // Filtra produtos relacionados a unhas/esmaltes
        const manicureProducts = prods.filter((p) =>
          ['Esmaltes', 'Unhas', 'Cuidados', 'Manicure', 'Acessórios'].includes(p.category)
        );

        setAppointments(manicureApts);
        setProfessionals(
          manicureProfs.length > 0
            ? manicureProfs
            : INITIAL_PROFESSIONALS.filter((p) => p.role === 'manicure')
        );
        setServices(
          manicureServicesList.length > 0 ? manicureServicesList : INITIAL_MANICURE_SERVICES
        );
        setProducts(
          manicureProducts.length > 0
            ? manicureProducts
            : [
                {
                  id: 'prod-esmalte-1',
                  name: 'Kit Esmalte Gel Red Diamond + Top Coat',
                  price: 49.9,
                  category: 'Esmaltes',
                  description: 'Brilho espelhado e secagem rápida em cabine LED.',
                  image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800',
                  sizes: ['10ml'],
                  inStock: true,
                },
                {
                  id: 'prod-esmalte-2',
                  name: 'Óleo Nutritivo de Cutículas com Vitaminas',
                  price: 29.9,
                  category: 'Cuidados',
                  description: 'Hidratação profunda para cutículas perfeitas e unhas resistentes.',
                  image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800',
                  sizes: ['15ml'],
                  inStock: true,
                },
              ]
        );
        setOrders(manicureOrders);
      } catch (err) {
        console.warn('Erro ao carregar dados da manicure:', err);
      }
    }
    loadManicureData();
  }, []);

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState<'semanal' | 'mensal' | 'anual' | 'geral'>('mensal');
  const [filterManicurist, setFilterManicurist] = useState<string>('todos');
  const [filterAptStatus, setFilterAptStatus] = useState<string>('todos');
  const [filterSource, setFilterSource] = useState<'todos' | 'procedimentos' | 'produtos'>('todos');

  // Modais de Criação
  const {
    isOpen: isAptModalOpen,
    onOpen: openAptModal,
    onClose: closeAptModal,
  } = useDisclosure();

  const {
    isOpen: isManicureModalOpen,
    onOpen: openManicureModal,
    onClose: closeManicureModal,
  } = useDisclosure();

  const {
    isOpen: isServiceModalOpen,
    onOpen: openServiceModal,
    onClose: closeServiceModal,
  } = useDisclosure();

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

  // Modal para definir horário exato ao agendar
  const {
    isOpen: isScheduleModalOpen,
    onOpen: openScheduleModal,
    onClose: closeScheduleModal,
  } = useDisclosure();
  const [activeSchedulingApt, setActiveSchedulingApt] = useState<Appointment | null>(null);
  const [scheduledTimeInput, setScheduledTimeInput] = useState<string>('14:00');
  const [scheduledProfessionalName, setScheduledProfessionalName] = useState<string>('');

  // Estados dos Formulários
  const [newAptCustomer, setNewAptCustomer] = useState('');
  const [newAptManicurist, setNewAptManicurist] = useState('');
  const [newAptService, setNewAptService] = useState('');
  const [newAptPrice, setNewAptPrice] = useState('70.00');
  const [newAptDate, setNewAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAptShift, setNewAptShift] = useState<'manha' | 'tarde' | 'noite'>('tarde');

  const [newProfName, setNewProfName] = useState('');
  const [newProfSpecialty, setNewProfSpecialty] = useState('');
  const [newProfAvatar, setNewProfAvatar] = useState(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
  );

  const [newServName, setNewServName] = useState('');
  const [newServPrice, setNewServPrice] = useState('60.00');
  const [newServDuration, setNewServDuration] = useState('60');
  const [newServCategory, setNewServCategory] = useState('Mãos');
  const [newServDescription, setNewServDescription] = useState('');

  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Esmaltes');
  const [newProductPrice, setNewProductPrice] = useState('45.00');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImage, setNewProductImage] = useState(
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800'
  );

  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleProductItem, setSaleProductItem] = useState('');
  const [saleAmount, setSaleAmount] = useState('49.90');

  const toast = useToast();
  const cardBg = '#161922';
  const borderColor = '#232936';

  // Auxiliar de período
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
      return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
    }
    if (period === 'anual') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Métricas de Manicure & Vendas
  const metrics = useMemo(() => {
    const filteredApts = appointments.filter((apt) => {
      // Regra de faturamento: alterado SOMENTE se o status tiver sido concluído
      if (apt.status !== 'concluido') return false;
      const matchesPeriod = isDateInPeriod(apt.date, filterPeriod);
      const matchesProf = filterManicurist === 'todos' || apt.professionalName === filterManicurist;
      return matchesPeriod && matchesProf;
    });

    const filteredOrders = orders.filter((ord) => {
      if (ord.status === 'cancelado') return false;
      return isDateInPeriod(ord.date, filterPeriod);
    });

    const proceduresRevenue = filteredApts.reduce((sum, apt) => sum + apt.price, 0);
    const productsRevenue = filterManicurist === 'todos' ? filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0) : 0;

    let totalRevenue = 0;
    if (filterSource === 'todos') {
      totalRevenue = proceduresRevenue + productsRevenue;
    } else if (filterSource === 'procedimentos') {
      totalRevenue = proceduresRevenue;
    } else if (filterSource === 'produtos') {
      totalRevenue = productsRevenue;
    }

    const count = filteredApts.length;
    const totalTransactions = count + (filterSource !== 'procedimentos' ? filteredOrders.length : 0);
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      proceduresRevenue,
      productsRevenue,
      count,
      averageTicket,
      ordersCount: filteredOrders.length,
    };
  }, [appointments, orders, filterPeriod, filterManicurist, filterSource]);

  // Prioridade de status para exibição no Dashboard da Manicure:
  // 1. Solicitado (prioridade máxima) -> 2. Agendado -> 3. Confirmado -> 4. Concluído -> 5. Cancelado
  const STATUS_PRIORITY: Record<string, number> = {
    solicitado: 1,
    pendente: 1,
    agendado: 2,
    confirmado: 3,
    concluido: 4,
    cancelado: 5,
  };

  // Agendamentos filtrados e ordenados por prioridade de status
  const displayedAppointments = useMemo(() => {
    const filtered = appointments.filter((apt) => {
      const matchesPeriod = isDateInPeriod(apt.date, filterPeriod);
      const matchesProf = filterManicurist === 'todos' || apt.professionalName === filterManicurist;
      const matchesStatus = filterAptStatus === 'todos' || apt.status === filterAptStatus;
      return matchesPeriod && matchesProf && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const pA = STATUS_PRIORITY[a.status] ?? 99;
      const pB = STATUS_PRIORITY[b.status] ?? 99;
      if (pA !== pB) return pA - pB;
      return b.date.localeCompare(a.date);
    });
  }, [appointments, filterPeriod, filterManicurist, filterAptStatus]);

  // Paginação de clientes no Dashboard da Manicure (Padrão: 20 clientes por página)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPeriod, filterManicurist, filterAptStatus, itemsPerPage]);

  const totalPages = Math.ceil(displayedAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedAppointments.slice(start, start + itemsPerPage);
  }, [displayedAppointments, currentPage, itemsPerPage]);

  // Ações de Agendamento
  const updateStatus = async (
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
      description: `Procedimento marcado como ${newStatus}.`,
      status: 'info',
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
      description: 'O procedimento cancelado foi excluído com sucesso.',
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
      description: `${cancelledList.length} procedimentos foram excluídos com sucesso.`,
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
        description: 'A cliente não cadastrou telefone para envio do WhatsApp.',
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
    // Pre-seleciona a manicure existente ou a primeira disponível se a cliente não escolheu nenhuma
    const foundManicurist = professionals.find(
      (m) =>
        m.name.toLowerCase() === apt.professionalName?.toLowerCase() ||
        m.id === apt.professionalId
    );
    setScheduledProfessionalName(foundManicurist ? foundManicurist.name : professionals[0]?.name || '');
    openScheduleModal();
  };

  const handleConfirmSchedule = async (sendWhatsApp: boolean = false) => {
    if (!activeSchedulingApt) return;

    if (!scheduledProfessionalName) {
      toast({
        title: 'Selecione a profissional',
        description: 'É obrigatório selecionar qual manicure fará o procedimento.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const profObj = professionals.find((m) => m.name === scheduledProfessionalName);

    await updateStatus(
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

  const handleCreateAppointment = async () => {
    if (!newAptCustomer.trim()) {
      toast({
        title: 'Informe a cliente',
        description: 'Nome da cliente é obrigatório.',
        status: 'warning',
      });
      return;
    }

    const manicuristName = newAptManicurist || professionals[0]?.name || 'Manicure do Studio';
    const serviceName = newAptService || services[0]?.name || 'Manicure Tradicional';
    const foundService = services.find((s) => s.name === serviceName);

    const created = await createDbAppointment({
      customerName: newAptCustomer,
      professionalName: manicuristName,
      serviceId: foundService?.id || 'manicure-service',
      serviceName: serviceName,
      price: parseFloat(newAptPrice.replace(',', '.')) || 0,
      date: newAptDate,
      shift: newAptShift,
      status: 'confirmado',
      type: 'manicure',
      notes: '[Manicure]',
    });

    setAppointments((prev) => [created, ...prev]);
    closeAptModal();
    setNewAptCustomer('');

    toast({
      title: 'Agendamento criado!',
      description: `${created.serviceName} com ${created.professionalName} no dia ${created.date}.`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleCreateManicure = async () => {
    if (!newProfName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome da profissional.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbProfessional({
      name: newProfName,
      role: 'manicure',
      avatar: newProfAvatar,
      specialty: newProfSpecialty,
    });

    setProfessionals((prev) => [...prev, created]);
    closeManicureModal();
    setNewProfName('');
    setNewProfSpecialty('');

    toast({
      title: 'Manicure adicionada!',
      description: `${created.name} cadastrada na equipe com sucesso.`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleDeleteManicure = async (id: string) => {
    await deleteDbProfessional(id);
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: 'Manicure removida',
      status: 'info',
      duration: 2000,
    });
  };

  const handleCreateService = async () => {
    if (!newServName.trim() || !newServPrice) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome e valor do procedimento são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbService({
      name: newServName,
      type: 'manicure',
      price: parseFloat(newServPrice.replace(',', '.')) || 0,
      durationMin: parseInt(newServDuration) || 45,
      category: newServCategory,
      description: newServDescription,
    });

    setServices((prev) => [...prev, created as ManicureService]);
    closeServiceModal();
    setNewServName('');
    setNewServDescription('');

    toast({
      title: 'Procedimento cadastrado!',
      description: `${created.name} adicionado ao catálogo da manicure.`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleDeleteService = async (id: string) => {
    await deleteDbService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: 'Procedimento removido',
      status: 'info',
      duration: 2000,
    });
  };

  // Produtos de Manicure (Esmaltes, Cuidados)
  const handleCreateProduct = async () => {
    if (!newProductName.trim() || !newProductPrice) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome e valor do produto são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbProduct({
      name: newProductName,
      price: parseFloat(newProductPrice.replace(',', '.')) || 0,
      category: newProductCategory,
      description: newProductDescription,
      image: newProductImage,
      sizes: ['Único'],
      inStock: true,
    });

    if (created) {
      setProducts((prev) => [created, ...prev]);
      closeProductModal();
      setNewProductName('');
      setNewProductDescription('');

      toast({
        title: 'Produto adicionado!',
        description: `${created.name} cadastrado com sucesso.`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  const handleToggleProductStock = async (id: string, currentStock: boolean) => {
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

  const handleDeleteProduct = async (id: string) => {
    await deleteDbProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: 'Produto removido',
      status: 'info',
      duration: 2000,
    });
  };

  // Venda Avulsa
  const handleCreateSale = async () => {
    if (!saleCustomer.trim() || !saleAmount) {
      toast({
        title: 'Preencha os campos',
        description: 'Nome da cliente e valor são obrigatórios.',
        status: 'warning',
      });
      return;
    }

    const created = await createDbOrder({
      customerName: saleCustomer,
      items: [
        {
          productId: 'custom-manicure-sale',
          productName: saleProductItem || 'Esmalte / Produto Manicure',
          quantity: 1,
          price: parseFloat(saleAmount.replace(',', '.')) || 0,
        },
      ],
      totalAmount: parseFloat(saleAmount.replace(',', '.')) || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'concluido',
      notes: '[Manicure]',
    });

    setOrders((prev) => [created, ...prev]);
    closeSaleModal();
    setSaleCustomer('');
    setSaleProductItem('');

    toast({
      title: 'Venda registrada!',
      description: `R$ ${created.totalAmount.toFixed(2)} contabilizados na manicure.`,
      status: 'success',
      duration: 3000,
    });
  };

  const shiftBadges: Record<string, string> = {
    manha: 'orange',
    tarde: 'pink',
    noite: 'purple',
  };
  const statusColors: Record<string, string> = {
    solicitado: 'yellow',
    agendado: 'purple',
    confirmado: 'pink',
    concluido: 'green',
    pendente: 'yellow',
    cancelado: 'red',
  };

  return (
    <AdminAuthGuard module="manicure">
      <Box pb={{ base: 16, md: 24 }} bg="#0b0d13" minH="100vh">
      {/* HEADER DEDICADO DO ADMIN (Agenda, Faturamento, Cadastros) */}
      <AdminHeader
        currentModule="manicure"
        activeTab={adminTab}
        onTabChange={setAdminTab}
        agendaCount={displayedAppointments.length}
        cadastrosCount={services.length + products.length + professionals.length}
      />

      {/* Conteúdo Principal por Aba */}
      <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} mt={{ base: 6, md: 8 }}>
        {/* ============================================================== */}
        {/* ABA 1: DASHBOARD DE MANICURE */}
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
                  <Badge colorScheme="pink" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    DASHBOARD MANICURE
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Controle Geral do Nail Studio
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Dashboard das Manicures
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Controle os procedimentos de unhas, alongamentos em gel e manutenção.
                </Text>
              </Box>

              <Button
                size="sm"
                bg="pink.500"
                color="white"
                _hover={{ bg: 'pink.600' }}
                borderRadius="xl"
                leftIcon={<FiPlus />}
                onClick={openAptModal}
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
                    Filtrar por Manicure
                  </Text>
                  <Select
                    size="sm"
                    borderRadius="xl"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={filterManicurist}
                    onChange={(e) => setFilterManicurist(e.target.value)}
                    fontSize="xs"
                  >
                    <option value="todos">Todas as Manicures</option>
                    {professionals.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box flex={1}>
                  <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                    Status
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
                  <FiHeart size={36} color="#ed64a6" style={{ margin: '0 auto 12px' }} />
                  <Text color="gray.400" fontSize="sm">
                    Nenhum agendamento de manicure encontrado para os filtros selecionados.
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
                            <Avatar size="xs" name={apt.professionalName} bg="pink.500" color="white" />
                            <Text fontWeight="700" fontSize="sm" color="white">
                              {apt.customerName}
                            </Text>
                          </HStack>
                          <Badge colorScheme={statusColors[apt.status] || 'pink'} borderRadius="full" px={2} fontSize="2xs">
                            {apt.status}
                          </Badge>
                        </Flex>

                        <Text fontSize="xs" color="gray.300" mb={1}>
                          <Text as="span" fontWeight="700" color="pink.400">
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
                          <Text fontWeight="800" color="pink.400" fontSize="xs">
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
                                colorScheme="pink"
                                variant="outline"
                                flex={1}
                                leftIcon={<FiCheckCircle />}
                                onClick={() => updateStatus(apt.id, 'confirmado')}
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
                              onClick={() => updateStatus(apt.id, 'concluido')}
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
                              onClick={() => updateStatus(apt.id, 'cancelado')}
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
                          <Th>Manicure</Th>
                          <Th>Procedimento</Th>
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
                                <Avatar size="xs" name={apt.professionalName} bg="pink.500" color="white" />
                                <Text>{apt.professionalName}</Text>
                              </HStack>
                            </Td>
                            <Td color="pink.400" fontWeight="600">
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
                              <Badge colorScheme={statusColors[apt.status] || 'pink'} borderRadius="full" px={2}>
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
                                      colorScheme="pink"
                                      variant="outline"
                                      leftIcon={<FiCheckCircle />}
                                      title="Marcar como Confirmado"
                                      onClick={() => updateStatus(apt.id, 'confirmado')}
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
                                    onClick={() => updateStatus(apt.id, 'concluido')}
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
                                    title="Cancelar Procedimento"
                                    onClick={() => updateStatus(apt.id, 'cancelado')}
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
                    colorScheme="pink"
                    accentColor="#ed64a6"
                    itemLabel="clientes"
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* ABA 2: AGENDA DA MANICURE (CALENDÁRIO COM HORÁRIOS) */}
        {/* ============================================================== */}
        {adminTab === 'agenda' && (
          <Box>
            <AdminCalendarView
              appointments={appointments}
              professionals={professionals}
              module="manicure"
              onStatusChange={updateStatus}
              onOpenScheduleModal={handleOpenScheduleModal}
              onSendWhatsApp={handleSendWhatsAppConfirmation}
              onOpenNewAppointmentModal={(selectedDate) => {
                if (selectedDate) setNewAptDate(selectedDate);
                openAptModal();
              }}
            />
          </Box>
        )}

        {/* ============================================================== */}
        {/* ABA 3: FATURAMENTO DA MANICURE */}
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
                  <Badge colorScheme="pink" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    FINANCEIRO MANICURE
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Receitas de Unhas, Alongamentos e Esmaltes
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Faturamento do Studio
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Métricas de atendimentos de manicure e vendas de produtos de cuidados.
                </Text>
              </Box>

              <Button
                size="sm"
                bg="pink.500"
                color="white"
                _hover={{ bg: 'pink.600' }}
                borderRadius="xl"
                leftIcon={<FiShoppingBag />}
                onClick={openSaleModal}
                fontWeight="700"
                fontSize="xs"
              >
                Registrar Venda Avulsa
              </Button>
            </Flex>

            {/* Filtros de Período e Manicure */}
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
                    bg="pink.500"
                    color="white"
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
                      Consolidação por manicure, tipo de receita e período
                    </Text>
                  </Box>
                </HStack>

                <Flex direction={{ base: 'column', sm: 'row' }} gap={3} flexWrap="wrap">
                  {/* Filtro por Manicure */}
                  <Box minW={{ base: '100%', sm: '170px' }}>
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" mb={1} textTransform="uppercase">
                      Manicure
                    </Text>
                    <Select
                      size="sm"
                      borderRadius="xl"
                      bg="#0b0d13"
                      borderColor={borderColor}
                      value={filterManicurist}
                      onChange={(e) => setFilterManicurist(e.target.value)}
                      fontSize="xs"
                    >
                      <option value="todos">Todas as Manicures</option>
                      {professionals.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {/* Filtro por Origem */}
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
                      onChange={(e) => setFilterSource(e.target.value as 'todos' | 'procedimentos' | 'produtos')}
                      fontSize="xs"
                    >
                      <option value="todos">Todos (Procedimentos + Produtos)</option>
                      <option value="procedimentos">Apenas Procedimentos</option>
                      <option value="produtos">Apenas Produtos / Esmaltes</option>
                    </Select>
                  </Box>

                  {/* Filtro de Período */}
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
                          colorScheme="pink"
                          bg={filterPeriod === period ? 'pink.500' : 'transparent'}
                          color={filterPeriod === period ? 'white' : 'gray.400'}
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

            {/* Cards de Métricas */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, sm: 4, md: 6 }} mb={{ base: 6, md: 10 }}>
              {/* Total Arrecadado */}
              <Card bg={cardBg} border="1px solid" borderColor="pink.500" borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Total ({filterPeriod})
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="pink.500" color="white">
                      <FiDollarSign size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="pink.400" fontWeight="900">
                    R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Faturamento consolidado
                  </Text>
                </CardBody>
              </Card>

              {/* Procedimentos */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Procedimentos
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="purple.500" color="white">
                      <FiHeart size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="purple.400" fontWeight="900">
                    R$ {metrics.proceduresRevenue.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    {metrics.count} procedimentos realizados
                  </Text>
                </CardBody>
              </Card>

              {/* Produtos / Esmaltes */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                <CardBody p={{ base: 4, sm: 5 }}>
                  <HStack justify="space-between">
                    <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase">
                      Vendas Produtos
                    </Text>
                    <Box p={1.5} borderRadius="lg" bg="orange.500" color="white">
                      <FiShoppingBag size={14} />
                    </Box>
                  </HStack>
                  <Heading size={{ base: 'lg', md: 'xl' }} mt={2} color="orange.400" fontWeight="900">
                    R$ {metrics.productsRevenue.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    {metrics.ordersCount} vendas de produtos
                  </Text>
                </CardBody>
              </Card>

              {/* Ticket Médio */}
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
                    R$ {metrics.averageTicket.toFixed(2).replace('.', ',')}
                  </Heading>
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Média por cliente / pedido
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Desempenho por Manicure */}
            <Box
              p={{ base: 4, sm: 6 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              mb={8}
            >
              <Heading as="h3" size="sm" mb={4} color="white">
                Desempenho por Manicure
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                {professionals.map((m) => {
                  const profApts = appointments.filter(
                    (a) => a.professionalName === m.name && isDateInPeriod(a.date, filterPeriod) && a.status !== 'cancelado'
                  );
                  const profRevenue = profApts.reduce((sum, a) => sum + a.price, 0);

                  return (
                    <Box
                      key={m.id}
                      p={4}
                      borderRadius="xl"
                      bg="#0b0d13"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <HStack spacing={3} mb={3}>
                        <Avatar size="sm" name={m.name} src={m.avatar} bg="pink.500" color="white" />
                        <Box>
                          <Text fontWeight="700" fontSize="sm" color="white">
                            {m.name}
                          </Text>
                          <Text fontSize="2xs" color="gray.400">
                            {m.specialty || 'Nail Designer'}
                          </Text>
                        </Box>
                      </HStack>

                      <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                        <Text fontSize="xs" color="gray.400">
                          {profApts.length} atendimentos
                        </Text>
                        <Text fontWeight="900" color="pink.400" fontSize="sm">
                          R$ {profRevenue.toFixed(2).replace('.', ',')}
                        </Text>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Histórico de Vendas de Produtos / Esmaltes */}
            <Box
              p={{ base: 4, sm: 6 }}
              borderRadius="2xl"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading as="h3" size="sm" mb={4} color="white">
                Histórico de Vendas de Esmaltes & Cuidados
              </Heading>

              {orders.length === 0 ? (
                <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                  Nenhuma venda avulsa registrada até o momento.
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
                          <Badge colorScheme="green" borderRadius="full" px={2} fontSize="2xs">
                            {ord.status}
                          </Badge>
                        </Flex>

                        <VStack align="start" spacing={0.5} mb={2}>
                          {ord.items.map((it, idx) => (
                            <Text key={idx} fontSize="xs" color="gray.300">
                              {it.quantity}x {it.productName}
                            </Text>
                          ))}
                        </VStack>

                        <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                          <Text fontSize="2xs" color="gray.400">
                            {ord.date.split('-').reverse().join('/')}
                          </Text>
                          <Text fontWeight="800" color="pink.400" fontSize="sm">
                            R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                          </Text>
                        </Flex>
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
                          <Th>Produtos Comprados</Th>
                          <Th isNumeric>Valor Total</Th>
                          <Th>Status</Th>
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
                                    {it.quantity}x {it.productName}
                                  </Text>
                                ))}
                              </VStack>
                            </Td>
                            <Td isNumeric fontWeight="700" color="pink.400">
                              R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                            </Td>
                            <Td>
                              <Badge colorScheme="green" borderRadius="full" px={2}>
                                {ord.status}
                              </Badge>
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
        {/* ABA 3: CADASTROS (PROCEDIMENTOS, PRODUTOS/ESMALTES, MANICURES) */}
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
                  <Badge colorScheme="pink" px={2} py={0.5} borderRadius="md" fontSize="2xs" fontWeight="800">
                    GESTÃO & PROCEDIMENTOS
                  </Badge>
                  <Text fontSize="2xs" color="gray.400">
                    Catálogo de Unhas, Esmaltes & Equipe de Manicures
                  </Text>
                </HStack>
                <Heading as="h2" size={{ base: 'md', sm: 'lg' }} color="white">
                  Cadastrar & Gerenciar Manicure
                </Heading>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Adicione novos procedimentos (alongamento, esmaltação, spa), esmaltes/produtos ou manicures à equipe.
                </Text>
              </Box>

              {/* Botão de Adição Contextual */}
              {cadastrosSubTab === 'procedimentos' && (
                <Button
                  size="sm"
                  bg="pink.500"
                  color="white"
                  _hover={{ bg: 'pink.600' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openServiceModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Novo Procedimento
                </Button>
              )}
              {cadastrosSubTab === 'produtos' && (
                <Button
                  size="sm"
                  bg="pink.500"
                  color="white"
                  _hover={{ bg: 'pink.600' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openProductModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Cadastrar Esmalte / Produto
                </Button>
              )}
              {cadastrosSubTab === 'manicures' && (
                <Button
                  size="sm"
                  bg="pink.500"
                  color="white"
                  _hover={{ bg: 'pink.600' }}
                  borderRadius="xl"
                  leftIcon={<FiPlus />}
                  onClick={openManicureModal}
                  fontWeight="700"
                  fontSize="xs"
                >
                  Nova Manicure
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
                variant={cadastrosSubTab === 'procedimentos' ? 'solid' : 'outline'}
                colorScheme="pink"
                bg={cadastrosSubTab === 'procedimentos' ? 'pink.500' : 'transparent'}
                color={cadastrosSubTab === 'procedimentos' ? 'white' : 'gray.300'}
                onClick={() => setCadastrosSubTab('procedimentos')}
                leftIcon={<FiLayers />}
                fontSize="xs"
                fontWeight="700"
              >
                Procedimentos de Unhas ({services.length})
              </Button>

              <Button
                size="sm"
                borderRadius="xl"
                variant={cadastrosSubTab === 'produtos' ? 'solid' : 'outline'}
                colorScheme="pink"
                bg={cadastrosSubTab === 'produtos' ? 'pink.500' : 'transparent'}
                color={cadastrosSubTab === 'produtos' ? 'white' : 'gray.300'}
                onClick={() => setCadastrosSubTab('produtos')}
                leftIcon={<FiShoppingBag />}
                fontSize="xs"
                fontWeight="700"
              >
                Esmaltes & Cuidados ({products.length})
              </Button>

              <Button
                size="sm"
                borderRadius="xl"
                variant={cadastrosSubTab === 'manicures' ? 'solid' : 'outline'}
                colorScheme="pink"
                bg={cadastrosSubTab === 'manicures' ? 'pink.500' : 'transparent'}
                color={cadastrosSubTab === 'manicures' ? 'white' : 'gray.300'}
                onClick={() => setCadastrosSubTab('manicures')}
                leftIcon={<FiUsers />}
                fontSize="xs"
                fontWeight="700"
              >
                Equipe de Manicures ({professionals.length})
              </Button>
            </HStack>

            {/* SUB-ABA 1: PROCEDIMENTOS */}
            {cadastrosSubTab === 'procedimentos' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Catálogo de Procedimentos de Manicure
                </Heading>

                {services.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhum procedimento cadastrado. Clique em &quot;Novo Procedimento&quot; para começar.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {services.map((serv) => (
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
                            <Badge colorScheme="pink" px={2} borderRadius="md" fontSize="2xs">
                              {serv.category || 'Unhas'}
                            </Badge>
                            <IconButton
                              aria-label="Excluir procedimento"
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
                          <Text fontWeight="900" color="pink.400" fontSize="md">
                            R$ {serv.price.toFixed(2).replace('.', ',')}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* SUB-ABA 2: PRODUTOS / ESMALTES */}
            {cadastrosSubTab === 'produtos' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Catálogo de Esmaltes, Tratamentos e Acessórios
                </Heading>

                {products.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhum produto/esmalte cadastrado. Clique em &quot;Cadastrar Esmalte / Produto&quot;.
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
                            {prod.category}
                          </Text>
                        </Box>

                        <Box pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="900" color="pink.400" fontSize="sm">
                              R$ {prod.price.toFixed(2).replace('.', ',')}
                            </Text>
                            <IconButton
                              aria-label="Excluir produto"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteProduct(prod.id)}
                            />
                          </Flex>

                          <Flex justify="space-between" align="center">
                            <Text fontSize="2xs" color="gray.400">
                              Disponível no Studio:
                            </Text>
                            <Switch
                              size="sm"
                              colorScheme="pink"
                              isChecked={prod.inStock}
                              onChange={() => handleToggleProductStock(prod.id, prod.inStock)}
                            />
                          </Flex>
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* SUB-ABA 3: EQUIPE DE MANICURES */}
            {cadastrosSubTab === 'manicures' && (
              <Box
                p={{ base: 4, sm: 6 }}
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading as="h3" size="sm" mb={4} color="white">
                  Equipe de Manicures & Nail Designers
                </Heading>

                {professionals.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={8} textAlign="center">
                    Nenhuma manicure cadastrada. Clique em &quot;Nova Manicure&quot; para adicionar.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                    {professionals.map((m) => (
                      <Box
                        key={m.id}
                        p={4}
                        borderRadius="xl"
                        bg="#0b0d13"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <Flex justify="space-between" align="flex-start" mb={3}>
                          <HStack spacing={3}>
                            <Avatar size="md" name={m.name} src={m.avatar} bg="pink.500" color="white" />
                            <Box>
                              <Text fontWeight="800" fontSize="sm" color="white">
                                {m.name}
                              </Text>
                              <Badge colorScheme="pink" borderRadius="md" px={2} fontSize="2xs">
                                Manicure
                              </Badge>
                            </Box>
                          </HStack>
                          <IconButton
                            aria-label="Remover manicure"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteManicure(m.id)}
                          />
                        </Flex>

                        {m.specialty && (
                          <Text fontSize="xs" color="gray.400">
                            <Text as="span" fontWeight="700" color="gray.300">
                              Especialidade:{' '}
                            </Text>
                            {m.specialty}
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
      {/* MODAL 1: NOVO AGENDAMENTO DE MANICURE */}
      {/* ============================================================== */}
      <Modal isOpen={isAptModalOpen} onClose={closeAptModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Novo Agendamento na Manicure</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome da Cliente</FormLabel>
                <Input
                  placeholder="Ex: Beatriz Lima"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptCustomer}
                  onChange={(e) => setNewAptCustomer(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Manicure Responsável</FormLabel>
                <Select
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptManicurist}
                  onChange={(e) => setNewAptManicurist(e.target.value)}
                >
                  {professionals.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Procedimento</FormLabel>
                <Select
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newAptService}
                  onChange={(e) => {
                    setNewAptService(e.target.value);
                    const found = services.find((s) => s.name === e.target.value);
                    if (found) setNewAptPrice(found.price.toFixed(2));
                  }}
                >
                  {services.map((s) => (
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
            <Button variant="ghost" onClick={closeAptModal}>
              Cancelar
            </Button>
            <Button bg="pink.500" color="white" _hover={{ bg: 'pink.600' }} onClick={handleCreateAppointment}>
              Criar Agendamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: REGISTRAR VENDA DE ESMALTE / PRODUTO */}
      {/* ============================================================== */}
      <Modal isOpen={isSaleModalOpen} onClose={closeSaleModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Registrar Venda de Esmalte / Produto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome da Cliente</FormLabel>
                <Input
                  placeholder="Ex: Carla Mendonça"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Produto(s) / Esmalte(s) Vendido(s)</FormLabel>
                <Input
                  placeholder="Ex: Esmalte Gel Red Diamond + Óleo Nutritivo"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={saleProductItem}
                  onChange={(e) => setSaleProductItem(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Valor Total da Venda (R$)</FormLabel>
                <Input
                  placeholder="49.90"
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
            <Button bg="pink.500" color="white" _hover={{ bg: 'pink.600' }} onClick={handleCreateSale}>
              Confirmar Venda
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: CADASTRAR NOVA MANICURE */}
      {/* ============================================================== */}
      <Modal isOpen={isManicureModalOpen} onClose={closeManicureModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Cadastrar Nova Manicure</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome Completo</FormLabel>
                <Input
                  placeholder="Ex: Fernanda Rocha"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Especialidades / Técnicas</FormLabel>
                <Input
                  placeholder="Ex: Fibra de Vidro, Esmaltação em Gel, Nail Art"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newProfSpecialty}
                  onChange={(e) => setNewProfSpecialty(e.target.value)}
                />
              </FormControl>

              <ImageUpload
                label="Foto de Perfil da Manicure (Upload)"
                value={newProfAvatar}
                onChange={setNewProfAvatar}
                folder="manicures"
                accentColor="pink.400"
                helperText="Selecione uma foto de rosto da manicure."
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeManicureModal}>
              Cancelar
            </Button>
            <Button bg="pink.500" color="white" _hover={{ bg: 'pink.600' }} onClick={handleCreateManicure}>
              Adicionar Manicure
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 4: CADASTRAR NOVO PROCEDIMENTO */}
      {/* ============================================================== */}
      <Modal isOpen={isServiceModalOpen} onClose={closeServiceModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Novo Procedimento de Manicure</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Procedimento</FormLabel>
                <Input
                  placeholder="Ex: Alongamento em Gel com Tip"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newServName}
                  onChange={(e) => setNewServName(e.target.value)}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Categoria</FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServCategory}
                    onChange={(e) => setNewServCategory(e.target.value)}
                  >
                    <option value="Mãos">Mãos</option>
                    <option value="Pés">Pés</option>
                    <option value="Alongamento">Alongamento</option>
                    <option value="Esmaltação">Esmaltação</option>
                    <option value="Spa">Spa & Cuidados</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs">Valor (R$)</FormLabel>
                  <Input
                    placeholder="80.00"
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={newServPrice}
                    onChange={(e) => setNewServPrice(e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Duração Estimada (min)</FormLabel>
                <Input
                  type="number"
                  placeholder="60"
                  bg="#0b0d13"
                  borderColor={borderColor}
                  value={newServDuration}
                  onChange={(e) => setNewServDuration(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Descrição do Procedimento</FormLabel>
                <Textarea
                  placeholder="Explique o que inclui o procedimento, técnicas e materiais..."
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
            <Button bg="pink.500" color="white" _hover={{ bg: 'pink.600' }} onClick={handleCreateService}>
              Salvar Procedimento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 5: CADASTRAR NOVO PRODUTO / ESMALTE */}
      {/* ============================================================== */}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal} size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="#161922" border="1px solid" borderColor={borderColor}>
          <ModalHeader fontSize={{ base: 'md', sm: 'lg' }}>Cadastrar Novo Esmalte ou Produto</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Nome do Produto</FormLabel>
                <Input
                  placeholder="Ex: Esmalte Gel Diamond Shine"
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
                    placeholder="39.90"
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
                    <option value="Esmaltes">Esmaltes</option>
                    <option value="Cuidados">Cuidados & Hidratação</option>
                    <option value="Alongamento">Materiais Alongamento</option>
                    <option value="Acessórios">Acessórios de Unha</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <ImageUpload
                label="Foto do Produto / Esmalte (Upload)"
                value={newProductImage}
                onChange={setNewProductImage}
                folder="esmaltes"
                accentColor="pink.400"
                helperText="Faça upload da foto do esmalte ou produto de cuidados."
              />

              <FormControl>
                <FormLabel fontSize="xs">Descrição</FormLabel>
                <Textarea
                  placeholder="Benefícios, acabamento, fórmula..."
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
            <Button bg="pink.500" color="white" _hover={{ bg: 'pink.600' }} onClick={handleCreateProduct}>
              Salvar Produto
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
                  <Text color="gray.400">Procedimento: <strong style={{ color: '#ed64a6' }}>{activeSchedulingApt.serviceName}</strong></Text>
                  <Text color="gray.400">Manicure: <strong style={{ color: '#fff' }}>{activeSchedulingApt.professionalName}</strong></Text>
                  <Text color="gray.400">Data sugerida: <strong style={{ color: '#fff' }}>{activeSchedulingApt.date.split('-').reverse().join('/')}</strong> (Turno: {activeSchedulingApt.shift})</Text>
                  {activeSchedulingApt.customerPhone && (
                    <Text color="gray.400">WhatsApp: <strong style={{ color: '#25D366' }}>{activeSchedulingApt.customerPhone}</strong></Text>
                  )}
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Manicure Responsável
                  </FormLabel>
                  <Select
                    bg="#0b0d13"
                    borderColor={borderColor}
                    value={scheduledProfessionalName}
                    onChange={(e) => setScheduledProfessionalName(e.target.value)}
                    size="md"
                    borderRadius="lg"
                  >
                    {professionals.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                  {(!activeSchedulingApt.professionalName ||
                    activeSchedulingApt.professionalName.toLowerCase().includes('qualquer')) && (
                    <Text fontSize="2xs" color="yellow.400" mt={1}>
                      ⚠️ A cliente não escolheu nenhuma profissional específica. Selecione acima quem fará o procedimento.
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                    Horário Marcado do Procedimento
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
