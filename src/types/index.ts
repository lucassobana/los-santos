export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface BarberService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: string;
  type?: 'barbearia' | 'manicure';
}

export interface ManicureService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: string;
  type?: 'barbearia' | 'manicure';
}

export interface UnifiedService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: string;
  type: 'barbearia' | 'manicure';
}

export interface Professional {
  id: string;
  name: string;
  role: 'barbeiro' | 'manicure';
  avatar: string;
  specialty: string;
}

export type AppointmentStatus =
  | 'solicitado'
  | 'agendado'
  | 'confirmado'
  | 'concluido'
  | 'cancelado'
  | 'pendente'; // compatibilidade

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  professionalId?: string;
  professionalName: string;
  date: string;
  shift: 'manha' | 'tarde' | 'noite';
  scheduledTime?: string; // ex: "14:30"
  price: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface OrderSale {
  id: string;
  customerName: string;
  totalAmount: number;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
  date: string;
  status: 'concluido' | 'pendente' | 'cancelado';
  notes?: string;
}

export type AdminRole = 'admin_barbearia_loja' | 'admin_manicure' | 'superadmin';
