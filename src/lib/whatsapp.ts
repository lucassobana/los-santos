// Números de WhatsApp padrão (podem ser substituídos por variáveis de ambiente)
// Exemplo: '5511999999999'
export const WHATSAPP_NUMBERS = {
  LOJA_E_BARBEARIA: process.env.NEXT_PUBLIC_WHATSAPP_LOJA_BARBEARIA || '5535992158424',
  MANICURE: process.env.NEXT_PUBLIC_WHATSAPP_MANICURE || '5511988888888',
};

export interface CartItemWhatsApp {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export function generateClothingWhatsAppUrl(
  items: CartItemWhatsApp[],
  customerName?: string,
  customerNotes?: string
): string {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let message = `*Olá! Gostaria de fazer um pedido pela Loja de Roupas:*\n\n`;

  if (customerName) {
    message += `👤 *Cliente:* ${customerName}\n`;
  }

  message += `🛒 *Itens do Pedido:*\n`;
  items.forEach((item, index) => {
    const sizeInfo = item.size ? ` [Tam: ${item.size}]` : '';
    message += `${index + 1}. *${item.name}*${sizeInfo} - ${item.quantity}x de R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
  });

  message += `\n💰 *Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;

  if (customerNotes) {
    message += `📝 *Observação:* ${customerNotes}\n`;
  }

  message += `\n_Podemos combinar a entrega e o pagamento por aqui?_`;

  const phone = WHATSAPP_NUMBERS.LOJA_E_BARBEARIA.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateBookingWhatsAppUrl(params: {
  type: 'barbearia' | 'manicure';
  serviceName: string;
  professionalName?: string;
  date: string;
  shift: 'manha' | 'tarde' | 'noite';
  customerName: string;
  notes?: string;
}): string {
  const isBarber = params.type === 'barbearia';
  const title = isBarber ? '💈 Agendamento Barbearia' : '💅 Agendamento Manicure';
  const roleName = isBarber ? 'Barbeiro' : 'Manicure';
  
  const shiftLabels: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
  };

  let message = `*Olá! Gostaria de solicitar um agendamento:*\n\n`;
  message += `${title}\n`;
  message += `👤 *Nome:* ${params.customerName}\n`;
  message += `✂️ *Serviço:* ${params.serviceName}\n`;
  
  if (params.professionalName) {
    message += `🧑‍💼 *${roleName}:* ${params.professionalName}\n`;
  }

  // Format date dd/mm/yyyy if yyyy-mm-dd
  let formattedDate = params.date;
  if (params.date.includes('-')) {
    const [y, m, d] = params.date.split('-');
    formattedDate = `${d}/${m}/${y}`;
  }

  message += `📅 *Data sugerida:* ${formattedDate}\n`;
  message += `⏰ *Preferência de Horário:* ${shiftLabels[params.shift] || params.shift}\n`;

  if (params.notes) {
    message += `📝 *Observação:* ${params.notes}\n`;
  }

  message += `\n_Poderia confirmar a disponibilidade deste horário, por favor?_`;

  const targetPhone = isBarber
    ? WHATSAPP_NUMBERS.LOJA_E_BARBEARIA
    : WHATSAPP_NUMBERS.MANICURE;

  const phone = targetPhone.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateConfirmationRequestWhatsAppUrl(params: {
  customerPhone: string;
  customerName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time?: string;
  appointmentId: string;
  origin?: string;
}): string {
  let formattedDate = params.date;
  if (params.date.includes('-')) {
    const [y, m, d] = params.date.split('-');
    formattedDate = `${d}/${m}/${y}`;
  }

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  const windowOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseOrigin = params.origin || envAppUrl || windowOrigin || 'http://localhost:3000';
  const confirmUrl = `${baseOrigin}/confirmar?id=${params.appointmentId}`;

  let message = `*Los Santos • Confirmação de Horário* 💈💅\n\n`;
  message += `Olá, *${params.customerName}*!\n`;
  message += `Seu atendimento para *${params.serviceName}* com *${params.professionalName}* foi agendado:\n\n`;
  message += `📅 *Data:* ${formattedDate}\n`;
  if (params.time) {
    message += `⏰ *Horário Confirmado:* ${params.time}\n`;
  }
  message += `\n👉 *Clique no link abaixo para confirmar sua presença:*\n${confirmUrl}\n\n`;
  message += `_Aguardamos sua confirmação! Caso precise ajustar o horário, responda esta mensagem._`;

  // Sanitiza o telefone do cliente
  let rawPhone = params.customerPhone.replace(/\D/g, '');
  // Se for DDD + 9 dígitos sem o DDI 55, adiciona o 55
  if (rawPhone.length === 10 || rawPhone.length === 11) {
    rawPhone = `55${rawPhone}`;
  }

  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
}
