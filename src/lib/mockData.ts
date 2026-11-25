import { Product, BarberService, ManicureService, Professional, Appointment, OrderSale } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Camiseta Streetwear Oversized Black',
    description: 'Camiseta corte oversized em algodão premium 260g, toque peletizado e gola canelada 3cm.',
    price: 139.9,
    category: 'Camisetas',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Moletom Canguru Heavyweight Off-White',
    description: 'Moletom 3 cabos com felpa interna pesada, capuz duplo estruturado e bolso frontal canguru.',
    price: 289.0,
    category: 'Moletons',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    sizes: ['M', 'G', 'GG'],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'Calça Cargo Utilitária Black Ops',
    description: 'Calça sarja encorpada com 6 bolsos funcionais, regulagem na barra e cintura com cordão embutido.',
    price: 249.9,
    category: 'Calças',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    sizes: ['38', '40', '42', '44'],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'Camisa Linho Manga Curta Terracota',
    description: 'Camisa resort fit em blend de linho e viscose, caimento leve e botões em madeira natural.',
    price: 189.0,
    category: 'Camisas',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    sizes: ['P', 'M', 'G'],
    inStock: true,
    featured: false,
  },
  {
    id: 'prod-5',
    name: 'Boné Dad Hat Los Santos Bordado',
    description: 'Boné aba curva em sarja 100% algodão com fecho em fivela de metal ouro velho.',
    price: 99.0,
    category: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    sizes: ['Único'],
    inStock: true,
    featured: false,
  },
  {
    id: 'prod-6',
    name: 'Jaqueta Puffer Minimalist Midnight',
    description: 'Jaqueta corta-vento acolchoada, isolamento térmico leve, zíper selado e gola alta.',
    price: 369.0,
    category: 'Casacos',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
    sizes: ['M', 'G', 'GG'],
    inStock: true,
    featured: true,
  },
];

export const INITIAL_BARBER_SERVICES: BarberService[] = [
  {
    id: 'bs-1',
    name: 'Corte Tradicional / Fade Degradê',
    description: 'Corte moderno com tesoura e máquina, finalização com pomada premium.',
    price: 50.0,
    durationMin: 45,
    category: 'Cabelo',
  },
  {
    id: 'bs-2',
    name: 'Barba Completa com Toalha Quente',
    description: 'Alinhamento, raspagem com navalha, toalha quente aromática e óleo hidratante.',
    price: 45.0,
    durationMin: 35,
    category: 'Barba',
  },
  {
    id: 'bs-3',
    name: 'Combo Cabelo + Barba',
    description: 'Experiência completa com corte personalizado e terapia de barba.',
    price: 85.0,
    durationMin: 70,
    category: 'Combos',
  },
  {
    id: 'bs-4',
    name: 'Pigmentação de Barba ou Cabelo',
    description: 'Preenchimento de falhas com técnica natural e definição marcante.',
    price: 40.0,
    durationMin: 30,
    category: 'Tratamentos',
  },
];

export const INITIAL_MANICURE_SERVICES: ManicureService[] = [
  {
    id: 'ms-1',
    name: 'Manicure Tradicional',
    description: 'Cutilagem russa/tradicional, esfoliação, hidratação e esmaltação comum.',
    price: 40.0,
    durationMin: 45,
    category: 'Mãos',
  },
  {
    id: 'ms-2',
    name: 'Pedicure Completa com Spa dos Pés',
    description: 'Higienização profunda, esfoliação suave, lixamento e hidratação intensiva.',
    price: 50.0,
    durationMin: 50,
    category: 'Pés',
  },
  {
    id: 'ms-3',
    name: 'Alongamento em Fibra de Vidro',
    description: 'Alongamento com estrutura ultra fina, naturalidade e alta durabilidade.',
    price: 180.0,
    durationMin: 120,
    category: 'Alongamento',
  },
  {
    id: 'ms-4',
    name: 'Esmaltação em Gel',
    description: 'Secagem em cabine LED/UV com brilho espelhado e duração de até 20 dias.',
    price: 70.0,
    durationMin: 60,
    category: 'Esmaltação',
  },
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Lucas Barbeiro',
    role: 'barbeiro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    specialty: 'Fade, Barba Terapia e Freestyle',
  },
  {
    id: 'prof-2',
    name: 'Mateus Barbeiro',
    role: 'barbeiro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    specialty: 'Cortes clássicos na tesoura e Visagismo',
  },
  {
    id: 'prof-3',
    name: 'Camila Nail Designer',
    role: 'manicure',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    specialty: 'Fibra de Vidro, Nail Art e Gel',
  },
  {
    id: 'prof-4',
    name: 'Juliana Manicure',
    role: 'manicure',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    specialty: 'Cutilagem Perfeita e Spa dos Pés',
  },
];

// Gera datas relativas para hoje, ontem e dias anteriores
const now = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    customerName: 'Guilherme Santos',
    customerPhone: '11991234567',
    serviceId: 'bs-3',
    serviceName: 'Combo Cabelo + Barba',
    professionalId: 'prof-1',
    professionalName: 'Lucas Barbeiro',
    date: formatDate(0), // Hoje
    shift: 'tarde',
    price: 85.0,
    status: 'solicitado',
    notes: 'Cliente prefere degradê navalhado',
  },
  {
    id: 'apt-2',
    customerName: 'Rodrigo Mendonça',
    customerPhone: '11998765432',
    serviceId: 'bs-1',
    serviceName: 'Corte Tradicional / Fade Degradê',
    professionalId: 'prof-2',
    professionalName: 'Mateus Barbeiro',
    date: formatDate(0), // Hoje
    shift: 'manha',
    price: 50.0,
    status: 'concluido',
  },
  {
    id: 'apt-3',
    customerName: 'Felipe Alcantara',
    customerPhone: '11987654321',
    serviceId: 'bs-2',
    serviceName: 'Barba Completa com Toalha Quente',
    professionalId: 'prof-1',
    professionalName: 'Lucas Barbeiro',
    date: formatDate(1), // Ontem
    shift: 'noite',
    price: 45.0,
    status: 'concluido',
  },
  {
    id: 'apt-4',
    customerName: 'Vinicius Prado',
    customerPhone: '11977778888',
    serviceId: 'bs-3',
    serviceName: 'Combo Cabelo + Barba',
    professionalId: 'prof-2',
    professionalName: 'Mateus Barbeiro',
    date: formatDate(3),
    shift: 'tarde',
    price: 85.0,
    status: 'concluido',
  },
  {
    id: 'apt-5',
    customerName: 'Renan Ribeiro',
    customerPhone: '11966665555',
    serviceId: 'bs-1',
    serviceName: 'Corte Tradicional / Fade Degradê',
    professionalId: 'prof-1',
    professionalName: 'Lucas Barbeiro',
    date: formatDate(5),
    shift: 'manha',
    price: 50.0,
    status: 'concluido',
  },
  {
    id: 'apt-6',
    customerName: 'Thiago Oliveira',
    customerPhone: '11955554444',
    serviceId: 'bs-4',
    serviceName: 'Pigmentação de Barba ou Cabelo',
    professionalId: 'prof-2',
    professionalName: 'Mateus Barbeiro',
    date: formatDate(12),
    shift: 'noite',
    price: 40.0,
    status: 'concluido',
  },
];

export const INITIAL_ORDERS: OrderSale[] = [
  {
    id: 'ord-1',
    customerName: 'Eduardo Silveira',
    totalAmount: 289.0,
    items: [
      {
        productName: 'Moletom Canguru Heavyweight Off-White',
        quantity: 1,
        price: 289.0,
        size: 'G',
      },
    ],
    date: formatDate(0), // Hoje
    status: 'concluido',
    notes: 'Entregue na recepção da barbearia',
  },
  {
    id: 'ord-2',
    customerName: 'Gabriel Martins',
    totalAmount: 389.8,
    items: [
      {
        productName: 'Camiseta Streetwear Oversized Black',
        quantity: 1,
        price: 139.9,
        size: 'M',
      },
      {
        productName: 'Calça Cargo Utilitária Black Ops',
        quantity: 1,
        price: 249.9,
        size: '42',
      },
    ],
    date: formatDate(2),
    status: 'concluido',
  },
  {
    id: 'ord-3',
    customerName: 'Bruno Henrique',
    totalAmount: 99.0,
    items: [
      {
        productName: 'Boné Dad Hat Los Santos Bordado',
        quantity: 1,
        price: 99.0,
        size: 'Único',
      },
    ],
    date: formatDate(4),
    status: 'concluido',
  },
  {
    id: 'ord-4',
    customerName: 'Marcos Vinicius',
    totalAmount: 369.0,
    items: [
      {
        productName: 'Jaqueta Puffer Minimalist Midnight',
        quantity: 1,
        price: 369.0,
        size: 'GG',
      },
    ],
    date: formatDate(10),
    status: 'concluido',
  },
  {
    id: 'ord-5',
    customerName: 'André Luiz',
    totalAmount: 189.0,
    items: [
      {
        productName: 'Camisa Linho Manga Curta Terracota',
        quantity: 1,
        price: 189.0,
        size: 'G',
      },
    ],
    date: formatDate(20),
    status: 'concluido',
  },
];
