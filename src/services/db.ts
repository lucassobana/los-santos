import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Product,
  Appointment,
  AppointmentStatus,
  OrderSale,
  Professional,
  BarberService,
  ManicureService,
} from '@/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_APPOINTMENTS,
  INITIAL_ORDERS,
  INITIAL_PROFESSIONALS,
  INITIAL_BARBER_SERVICES,
  INITIAL_MANICURE_SERVICES,
} from '@/lib/mockData';

// Tipagens das tabelas do Supabase (com prefixo ls_)
interface DbProductRow {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category?: string;
  image: string;
  sizes?: string[];
  in_stock?: boolean;
  featured?: boolean;
}

interface DbAppointmentRow {
  id: string;
  customer_name: string;
  customer_phone?: string;
  service_id?: string;
  service_name?: string;
  professional_id?: string;
  professional_name?: string;
  date: string;
  shift: 'manha' | 'tarde' | 'noite';
  scheduled_time?: string;
  price?: number | string;
  status: AppointmentStatus;
  notes?: string;
}

interface DbOrderRow {
  id: string;
  customer_name?: string;
  total_amount: number | string;
  items?: {
    productName: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
  date?: string;
  created_at?: string;
  status: 'pendente' | 'concluido' | 'cancelado';
  notes?: string;
}

interface DbProfessionalRow {
  id: string;
  name: string;
  role: 'barbeiro' | 'manicure';
  avatar?: string;
  specialty?: string;
}

interface DbServiceRow {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  duration_min: number;
  category?: string;
}

// ==========================================
// 1. PRODUTOS (LOJA DE ROUPAS & MANICURE) - ls_products
// ==========================================
const MANICURE_CATEGORIES = new Set([
  'esmaltes',
  'esmalte',
  'unhas',
  'unha',
  'cuidados',
  'manicure',
  'alongamento',
]);

export function isClothingProduct(product: { name?: string; category?: string }): boolean {
  const cat = (product.category || '').trim().toLowerCase();
  if (MANICURE_CATEGORIES.has(cat)) return false;
  const name = (product.name || '').toLowerCase();
  if (name.includes('esmalte') || name.includes('cutícula') || name.includes('top coat')) {
    return false;
  }
  return true;
}

export function isManicureProduct(product: { name?: string; category?: string }): boolean {
  return !isClothingProduct(product);
}

export const DEFAULT_MANICURE_PRODUCTS: Product[] = [
  {
    id: 'prod-esmalte-1',
    name: 'Kit Esmalte Gel Red Diamond + Top Coat',
    price: 49.9,
    category: 'Esmaltes',
    description: 'Brilho espelhado e secagem rápida em cabine LED.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800',
    sizes: ['10ml'],
    inStock: true,
    featured: true,
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
    featured: false,
  },
];

export async function getDbProducts(type?: 'roupas' | 'manicure'): Promise<Product[]> {
  const fallback =
    type === 'manicure'
      ? DEFAULT_MANICURE_PRODUCTS
      : INITIAL_PRODUCTS;

  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    const { data, error } = await supabase
      .from('ls_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Usando produtos locais (fallback):', error.message);
      return fallback;
    }

    const allProducts: Product[] = (data as DbProductRow[]).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      category: item.category || 'Geral',
      image: item.image,
      sizes: item.sizes || ['P', 'M', 'G', 'GG'],
      inStock: item.in_stock ?? true,
      featured: item.featured ?? false,
    }));

    if (type === 'roupas') {
      const clothes = allProducts.filter(isClothingProduct);
      return clothes.length > 0 ? clothes : INITIAL_PRODUCTS;
    }

    if (type === 'manicure') {
      const manicureItems = allProducts.filter(isManicureProduct);
      return manicureItems.length > 0 ? manicureItems : DEFAULT_MANICURE_PRODUCTS;
    }

    return allProducts;
  } catch (err) {
    console.warn('Erro ao conectar com Supabase, fallback ativado:', err);
    return fallback;
  }
}

export async function createDbProduct(
  product: Omit<Product, 'id'>
): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      id: `prod-${Date.now()}`,
      ...product,
    };
  }

  try {
    const { data, error } = await supabase
      .from('ls_products')
      .insert([
        {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          sizes: product.sizes,
          image: product.image,
          in_stock: product.inStock,
          featured: product.featured ?? false,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error('Erro ao criar produto no Supabase:', error);
      return { id: `prod-${Date.now()}`, ...product };
    }

    const row = data as DbProductRow;
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: Number(row.price),
      category: row.category || 'Geral',
      image: row.image,
      sizes: row.sizes || ['P', 'M', 'G', 'GG'],
      inStock: row.in_stock ?? true,
      featured: row.featured ?? false,
    };
  } catch (err) {
    console.error('Falha de conexão com Supabase:', err);
    return { id: `prod-${Date.now()}`, ...product };
  }
}

export async function toggleDbProductStock(
  id: string,
  currentInStock: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('ls_products')
      .update({ in_stock: !currentInStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  } catch {
    return true;
  }
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase.from('ls_products').delete().eq('id', id);
    return !error;
  } catch {
    return true;
  }
}

// ==========================================
// 2. AGENDAMENTOS (BARBEARIA & MANICURE) - ls_appointments
// ==========================================
export async function getDbAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_APPOINTMENTS;
  }

  try {
    const { data, error } = await supabase
      .from('ls_appointments')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) {
      return INITIAL_APPOINTMENTS;
    }

    return (data as DbAppointmentRow[]).map((item) => ({
      id: item.id,
      customerName: item.customer_name,
      customerPhone: item.customer_phone || '',
      serviceId: item.service_id || '',
      serviceName: item.service_name || 'Serviço',
      professionalId: item.professional_id || '',
      professionalName: item.professional_name || 'Profissional',
      date: item.date,
      shift: item.shift,
      scheduledTime: item.scheduled_time || undefined,
      price: Number(item.price || 0),
      status: item.status,
      notes: item.notes || '',
    }));
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getDbAppointmentById(id: string): Promise<Appointment | null> {
  const isUuid = UUID_REGEX.test(id);
  if (!isUuid || !isSupabaseConfigured || !supabase) {
    const found = INITIAL_APPOINTMENTS.find((a) => a.id === id);
    return found || null;
  }

  try {
    const { data, error } = await supabase
      .from('ls_appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbAppointmentRow;
    return {
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || '',
      serviceId: row.service_id || '',
      serviceName: row.service_name || 'Serviço',
      professionalId: row.professional_id || '',
      professionalName: row.professional_name || 'Profissional',
      date: row.date,
      shift: row.shift,
      scheduledTime: row.scheduled_time || undefined,
      price: Number(row.price || 0),
      status: row.status,
      notes: row.notes || '',
    };
  } catch {
    return null;
  }
}

export async function createDbAppointment(
  appointment: Omit<Appointment, 'id'> & { type?: 'barbearia' | 'manicure' }
): Promise<Appointment> {
  let notes = appointment.notes || '';
  if (appointment.type === 'manicure' && !notes.toLowerCase().includes('manicure')) {
    notes = notes ? `[Manicure] ${notes}` : '[Manicure]';
  }

  if (!isSupabaseConfigured || !supabase) {
    return { id: `apt-${Date.now()}`, ...appointment, notes };
  }

  try {
    const payload: Record<string, unknown> = {
      customer_name: appointment.customerName,
      customer_phone: appointment.customerPhone || null,
      service_name: appointment.serviceName,
      professional_name: appointment.professionalName,
      date: appointment.date,
      shift: appointment.shift,
      scheduled_time: appointment.scheduledTime || null,
      price: appointment.price,
      status: appointment.status,
      notes: notes || null,
    };

    if (appointment.serviceId && UUID_REGEX.test(appointment.serviceId)) {
      payload.service_id = appointment.serviceId;
    }
    if (appointment.professionalId && UUID_REGEX.test(appointment.professionalId)) {
      payload.professional_id = appointment.professionalId;
    }

    const { data, error } = await supabase
      .from('ls_appointments')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      console.warn('Erro ao inserir agendamento no Supabase:', error?.message);
      return { id: `apt-${Date.now()}`, ...appointment, notes };
    }

    const row = data as DbAppointmentRow;
    return {
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone || '',
      serviceId: row.service_id || '',
      serviceName: row.service_name || 'Serviço',
      professionalId: row.professional_id || '',
      professionalName: row.professional_name || 'Profissional',
      date: row.date,
      shift: row.shift,
      scheduledTime: row.scheduled_time || undefined,
      price: Number(row.price || 0),
      status: row.status,
      notes: row.notes || '',
    };
  } catch (err) {
    console.warn('Exceção ao criar agendamento no Supabase:', err);
    return { id: `apt-${Date.now()}`, ...appointment, notes };
  }
}

export async function updateDbAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  scheduledTime?: string,
  professionalId?: string,
  professionalName?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const updatePayload: Record<string, unknown> = { status };
    if (scheduledTime) {
      updatePayload.scheduled_time = scheduledTime;
    }
    if (professionalId) {
      updatePayload.professional_id = professionalId;
    }
    if (professionalName) {
      updatePayload.professional_name = professionalName;
    }

    const { error } = await supabase
      .from('ls_appointments')
      .update(updatePayload)
      .eq('id', id);

    return !error;
  } catch {
    return true;
  }
}

export async function deleteDbAppointment(id: string): Promise<boolean> {
  const isUuid = UUID_REGEX.test(id);
  if (!isUuid || !isSupabaseConfigured || !supabase) {
    const idx = INITIAL_APPOINTMENTS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      INITIAL_APPOINTMENTS.splice(idx, 1);
    }
    return true;
  }

  try {
    const { error } = await supabase
      .from('ls_appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Erro ao deletar agendamento no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exceção ao deletar agendamento no Supabase:', err);
    return false;
  }
}

export async function confirmAppointmentById(id: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const isUuid = UUID_REGEX.test(id);
  if (!isUuid || !isSupabaseConfigured || !supabase) {
    const found = INITIAL_APPOINTMENTS.find((a) => a.id === id);
    if (found) {
      found.status = 'confirmado';
      return { success: true, appointment: found };
    }
    return {
      success: true,
      appointment: {
        id,
        customerName: 'Cliente',
        serviceId: 'service',
        serviceName: 'Atendimento Agendado',
        professionalName: 'Profissional Los Santos',
        date: new Date().toISOString().split('T')[0],
        shift: 'tarde',
        price: 0,
        status: 'confirmado',
      },
    };
  }

  try {
    const { data, error } = await supabase
      .from('ls_appointments')
      .update({ status: 'confirmado' })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !data) {
      console.warn('Erro ao atualizar agendamento no Supabase, fallback:', error?.message);
      return {
        success: true,
        appointment: {
          id,
          customerName: 'Cliente',
          serviceId: 'service',
          serviceName: 'Atendimento Agendado',
          professionalName: 'Profissional Los Santos',
          date: new Date().toISOString().split('T')[0],
          shift: 'tarde',
          price: 0,
          status: 'confirmado',
        },
      };
    }

    const row = data as DbAppointmentRow;
    return {
      success: true,
      appointment: {
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        serviceId: row.service_id || '',
        serviceName: row.service_name || 'Serviço',
        professionalId: row.professional_id || '',
        professionalName: row.professional_name || 'Profissional',
        date: row.date,
        shift: row.shift,
        scheduledTime: row.scheduled_time || undefined,
        price: Number(row.price || 0),
        status: row.status,
        notes: row.notes,
      },
    };
  } catch (err: unknown) {
    console.warn('Exceção ao confirmar:', err);
    return {
      success: true,
      appointment: {
        id,
        customerName: 'Cliente',
        serviceId: 'service',
        serviceName: 'Atendimento Agendado',
        professionalName: 'Profissional Los Santos',
        date: new Date().toISOString().split('T')[0],
        shift: 'tarde',
        price: 0,
        status: 'confirmado',
      },
    };
  }
}

// ==========================================
// 3. PEDIDOS / VENDAS (LOJA DE ROUPAS) - ls_orders
// ==========================================
export async function getDbOrders(): Promise<OrderSale[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_ORDERS;
  }

  try {
    const { data, error } = await supabase
      .from('ls_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return INITIAL_ORDERS;
    }

    return (data as DbOrderRow[]).map((item) => ({
      id: item.id,
      customerName: item.customer_name || 'Cliente',
      totalAmount: Number(item.total_amount),
      items: item.items || [],
      date: item.date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: item.status,
      notes: item.notes,
    }));
  } catch {
    return INITIAL_ORDERS;
  }
}

export async function createDbOrder(
  order: Omit<OrderSale, 'id'>
): Promise<OrderSale> {
  if (!isSupabaseConfigured || !supabase) {
    return { id: `ord-${Date.now()}`, ...order };
  }

  try {
    const { data, error } = await supabase
      .from('ls_orders')
      .insert([
        {
          customer_name: order.customerName,
          total_amount: order.totalAmount,
          items: order.items,
          date: order.date,
          status: order.status,
          notes: order.notes,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      return { id: `ord-${Date.now()}`, ...order };
    }

    const row = data as DbOrderRow;
    return {
      id: row.id,
      customerName: row.customer_name || 'Cliente',
      totalAmount: Number(row.total_amount),
      items: row.items || [],
      date: row.date || new Date().toISOString().split('T')[0],
      status: row.status,
      notes: row.notes,
    };
  } catch {
    return { id: `ord-${Date.now()}`, ...order };
  }
}

export async function updateDbOrderStatus(
  id: string,
  status: 'pendente' | 'concluido' | 'cancelado'
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('ls_orders')
      .update({ status })
      .eq('id', id);

    return !error;
  } catch {
    return true;
  }
}

// ==========================================
// 4. PROFISSIONAIS & SERVIÇOS - ls_professionals & ls_services
// ==========================================
export async function getDbProfessionals(
  role?: 'barbeiro' | 'manicure'
): Promise<Professional[]> {
  const fallback = role
    ? INITIAL_PROFESSIONALS.filter((p) => p.role === role)
    : INITIAL_PROFESSIONALS;

  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    let query = supabase
      .from('ls_professionals')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.warn('Erro ao buscar profissionais no Supabase:', error?.message);
      return fallback;
    }

    return (data as DbProfessionalRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      specialty: p.specialty || '',
    }));
  } catch {
    return fallback;
  }
}

export async function createDbProfessional(
  professional: Omit<Professional, 'id'>
): Promise<Professional> {
  if (!isSupabaseConfigured || !supabase) {
    return { id: `prof-${Date.now()}`, ...professional };
  }

  try {
    const { data, error } = await supabase
      .from('ls_professionals')
      .insert([
        {
          name: professional.name,
          role: professional.role,
          avatar: professional.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          specialty: professional.specialty,
          active: true,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('Erro ao criar profissional no Supabase:', error?.message);
      return { id: `prof-${Date.now()}`, ...professional };
    }

    const row = data as DbProfessionalRow;
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      avatar: row.avatar || professional.avatar,
      specialty: row.specialty || '',
    };
  } catch {
    return { id: `prof-${Date.now()}`, ...professional };
  }
}

export async function deleteDbProfessional(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('ls_professionals')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function getDbServices(
  type?: 'barbearia' | 'manicure'
): Promise<(BarberService | ManicureService)[]> {
  const fallback =
    type === 'barbearia'
      ? INITIAL_BARBER_SERVICES
      : type === 'manicure'
      ? INITIAL_MANICURE_SERVICES
      : [...INITIAL_BARBER_SERVICES, ...INITIAL_MANICURE_SERVICES];

  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    let query = supabase.from('ls_services').select('*').order('created_at', { ascending: true });
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.warn('Erro ao buscar serviços no Supabase:', error?.message);
      return fallback;
    }

    return (data as (DbServiceRow & { type?: 'barbearia' | 'manicure' })[]).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      price: Number(s.price),
      durationMin: Number(s.duration_min),
      category: s.category || 'Geral',
      type: s.type,
    }));
  } catch {
    return fallback;
  }
}

// ==========================================
// 5. AUXILIARES DE SEPARAÇÃO (BARBEARIA VS MANICURE)
// ==========================================
export function isManicureAppointment(
  apt: Appointment,
  manicureProfs: Professional[] = [],
  manicureServices: (BarberService | ManicureService)[] = []
): boolean {
  const notesLower = (apt.notes || '').toLowerCase();
  if (
    notesLower.includes('[manicure]') ||
    notesLower.includes('manicure') ||
    notesLower.includes('unha') ||
    notesLower.includes('esmalte')
  ) {
    return true;
  }

  const profNameLower = (apt.professionalName || '').toLowerCase();
  if (
    profNameLower.includes('manicure') ||
    profNameLower.includes('nail') ||
    profNameLower.includes('camila') ||
    profNameLower.includes('juliana')
  ) {
    return true;
  }
  if (manicureProfs.some((p) => p.name.toLowerCase() === profNameLower)) {
    return true;
  }

  const servNameLower = (apt.serviceName || '').toLowerCase();
  if (
    servNameLower.includes('manicure') ||
    servNameLower.includes('pedicure') ||
    servNameLower.includes('unha') ||
    servNameLower.includes('esmalte') ||
    servNameLower.includes('esmaltação') ||
    servNameLower.includes('fibra') ||
    servNameLower.includes('alongamento') ||
    servNameLower.includes('gel') ||
    servNameLower.includes('spa dos pés') ||
    servNameLower.includes('spa das mãos') ||
    servNameLower.includes('blindagem')
  ) {
    return true;
  }
  if (manicureServices.some((s) => s.name.toLowerCase() === servNameLower)) {
    return true;
  }

  return false;
}

export function isManicureOrder(ord: OrderSale): boolean {
  if (ord.notes?.toLowerCase().includes('manicure')) return true;
  return (ord.items || []).some((item) => {
    const name = (item.productName || '').toLowerCase();
    return (
      name.includes('esmalte') ||
      name.includes('unha') ||
      name.includes('manicure') ||
      name.includes('cutícula') ||
      name.includes('top coat') ||
      item.productId === 'custom-manicure-sale'
    );
  });
}

export async function createDbService(service: {
  name: string;
  description: string;
  price: number;
  durationMin: number;
  type: 'barbearia' | 'manicure';
  category: string;
}): Promise<BarberService | ManicureService> {
  if (!isSupabaseConfigured || !supabase) {
    return { id: `serv-${Date.now()}`, ...service };
  }

  try {
    const { data, error } = await supabase
      .from('ls_services')
      .insert([
        {
          name: service.name,
          description: service.description,
          price: service.price,
          duration_min: service.durationMin,
          type: service.type,
          category: service.category,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('Erro ao criar serviço no Supabase:', error?.message);
      return { id: `serv-${Date.now()}`, ...service };
    }

    const row = data as DbServiceRow & { type?: 'barbearia' | 'manicure' };
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: Number(row.price),
      durationMin: Number(row.duration_min),
      category: row.category || 'Geral',
      type: row.type,
    };
  } catch {
    return { id: `serv-${Date.now()}`, ...service };
  }
}

export async function deleteDbService(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase
      .from('ls_services')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 6. USUÁRIOS ADMINISTRADORES - ls_users
// ==========================================
export interface DbAdminUser {
  id: string;
  username: string;
  role: 'barbearia' | 'manicure';
  name: string;
}

export async function authenticateDbUser(
  username: string,
  pass: string,
  expectedRole: 'barbearia' | 'manicure'
): Promise<{ success: boolean; user?: DbAdminUser; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'SUPABASE_OFFLINE' };
  }

  try {
    const { data, error } = await supabase
      .from('ls_users')
      .select('id, username, password, role, name, active')
      .eq('username', username.trim().toLowerCase())
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao consultar ls_users no Supabase:', error.message);
      return { success: false, error: 'SUPABASE_OFFLINE' };
    }

    if (!data) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (data.role !== expectedRole) {
      return {
        success: false,
        error: `Este usuário não tem permissão para acessar o painel de ${
          expectedRole === 'barbearia' ? 'Barbearia & Loja' : 'Manicure'
        }.`,
      };
    }

    if (data.password !== pass) {
      return { success: false, error: 'Senha incorreta.' };
    }

    return {
      success: true,
      user: {
        id: data.id,
        username: data.username,
        role: data.role as 'barbearia' | 'manicure',
        name: data.name,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao autenticar';
    console.warn('Exceção ao autenticar com Supabase:', message);
    return { success: false, error: 'SUPABASE_OFFLINE' };
  }
}
