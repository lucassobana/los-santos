// Números de WhatsApp padrão (podem ser substituídos por variáveis de ambiente)
// Exemplo: '5511999999999'
export const WHATSAPP_NUMBERS = {
  LOJA_E_BARBEARIA: process.env.NEXT_PUBLIC_WHATSAPP_LOJA_BARBEARIA || '5535992158424',
  MANICURE: process.env.NEXT_PUBLIC_WHATSAPP_MANICURE || '5535992158424',
};

export interface CartItemWhatsApp {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

/**
 * Detecta se o usuário está acessando por dispositivo móvel (celular/tablet)
 */
export function isMobileDevice(): boolean {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  return false;
}

export function getWhatsAppBaseUrl(): string {
  // Retorna diretamente a API oficial do WhatsApp
  return 'https://api.whatsapp.com/send';
}

export function generateClothingWhatsAppUrl(
  items: CartItemWhatsApp[],
  customerName?: string,
  customerNotes?: string,
  forceMobile?: boolean
): string {
  const isMobile = forceMobile ?? isMobileDevice();
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const iconUser = isMobile ? '👤' : '✓';
  const iconCart = isMobile ? '🛒' : '✓';
  const iconMoney = isMobile ? '💰' : '✓';
  const iconNote = isMobile ? '📝' : '✓';
  const finalWish = isMobile ? ' 🛍️' : '';

  let message = `*Olá! Gostaria de fazer um pedido pela Loja de Roupas:*\n\n`;

  if (customerName) {
    message += `${iconUser} *Cliente:* ${customerName}\n`;
  }

  message += `${iconCart} *Itens do Pedido:*\n`;
  items.forEach((item, index) => {
    const sizeInfo = item.size ? ` [Tam: ${item.size}]` : '';
    message += `${index + 1}. *${item.name}*${sizeInfo} - ${item.quantity}x de R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
  });

  message += `\n${iconMoney} *Total:* R$ ${total.toFixed(2).replace('.', ',')}\n`;

  if (customerNotes) {
    message += `${iconNote} *Observação:* ${customerNotes}\n`;
  }

  message += `\n_Podemos combinar a entrega e o pagamento por aqui!${finalWish}_`;

  const phone = WHATSAPP_NUMBERS.LOJA_E_BARBEARIA.replace(/\D/g, '');
  const baseUrl = getWhatsAppBaseUrl();
  return `${baseUrl}?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export function formatBookingMessage(params: {
  type: 'barbearia' | 'manicure';
  serviceName: string;
  professionalName?: string;
  date: string;
  shift: 'manha' | 'tarde' | 'noite';
  customerName: string;
  notes?: string;
  isMobile?: boolean;
}): string {
  const isMobile = params.isMobile ?? isMobileDevice();
  const isBarber = params.type === 'barbearia';
  
  const shiftLabels: Record<string, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
  };

  // Formata data dd/mm/yyyy
  let formattedDate = params.date;
  if (params.date.includes('-')) {
    const [y, m, d] = params.date.split('-');
    formattedDate = `${d}/${m}/${y}`;
  }

  let message = `*Olá! Gostaria de solicitar um agendamento:*\n\n`;

  if (isMobile) {
    // No celular: exibe com emojis completos
    if (isBarber) {
      message += `💈 *Agendamento Barbearia*\n`;
      message += `👤 *Nome:* ${params.customerName}\n`;
      message += `✂️ *Serviço:* ${params.serviceName}\n`;
      if (params.professionalName) {
        message += `💈 *Barbeiro:* ${params.professionalName}\n`;
      }
    } else {
      message += `💅 *Agendamento Manicure*\n`;
      message += `👤 *Nome:* ${params.customerName}\n`;
      message += `💅 *Serviço:* ${params.serviceName}\n`;
      if (params.professionalName) {
        message += `💅 *Manicure:* ${params.professionalName}\n`;
      }
    }

    message += `📅 *Data sugerida:* ${formattedDate}\n`;
    message += `⏰ *Preferência de Horário:* ${shiftLabels[params.shift] || params.shift}\n`;

    if (params.notes) {
      message += `📝 *Observação:* ${params.notes}\n`;
    }

    message += `\n_Poderia confirmar a disponibilidade deste horário, por favor! 🙏_`;
  } else {
    // No Desktop: exibe com ✓ para compatibilidade perfeita e sem interrogações
    const typeLabel = isBarber ? 'Agendamento Barbearia' : 'Agendamento Manicure';
    const roleLabel = isBarber ? 'Barbeiro' : 'Manicure';

    message += `✓ *${typeLabel}*\n`;
    message += `✓ *Nome:* ${params.customerName}\n`;
    message += `✓ *Serviço:* ${params.serviceName}\n`;
    if (params.professionalName) {
      message += `✓ *${roleLabel}:* ${params.professionalName}\n`;
    }

    message += `✓ *Data sugerida:* ${formattedDate}\n`;
    message += `✓ *Preferência de Horário:* ${shiftLabels[params.shift] || params.shift}\n`;

    if (params.notes) {
      message += `✓ *Observação:* ${params.notes}\n`;
    }

    message += `\n_Poderia confirmar a disponibilidade deste horário, por favor!_`;
  }

  return message;
}

export function generateBookingWhatsAppUrl(params: {
  type: 'barbearia' | 'manicure';
  serviceName: string;
  professionalName?: string;
  date: string;
  shift: 'manha' | 'tarde' | 'noite';
  customerName: string;
  notes?: string;
  isMobile?: boolean;
}): string {
  const message = formatBookingMessage(params);

  const targetPhone = params.type === 'barbearia'
    ? WHATSAPP_NUMBERS.LOJA_E_BARBEARIA
    : WHATSAPP_NUMBERS.MANICURE;

  const phone = targetPhone.replace(/\D/g, '');
  const baseUrl = getWhatsAppBaseUrl();
  return `${baseUrl}?phone=${phone}&text=${encodeURIComponent(message)}`;
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
  isMobile?: boolean;
}): string {
  const isMobile = params.isMobile ?? isMobileDevice();

  let formattedDate = params.date;
  if (params.date.includes('-')) {
    const [y, m, d] = params.date.split('-');
    formattedDate = `${d}/${m}/${y}`;
  }

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  const windowOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // Determina a URL base: prioriza IP de rede / domínio de produção se não for localhost
  let baseOrigin = params.origin;
  if (!baseOrigin) {
    if (envAppUrl && !envAppUrl.includes('localhost') && !envAppUrl.includes('127.0.0.1')) {
      baseOrigin = envAppUrl;
    } else if (windowOrigin && !windowOrigin.includes('localhost') && !windowOrigin.includes('127.0.0.1')) {
      baseOrigin = windowOrigin;
    } else {
      baseOrigin = envAppUrl || windowOrigin || 'http://192.168.127.26:3000';
    }
  }

  const confirmUrl = `${baseOrigin}/confirmar?id=${params.appointmentId}`;

  const headerTitle = isMobile
    ? `*Los Santos • Confirmação de Horário* 💈💅`
    : `*Los Santos • Confirmação de Horário*`;
  const iconDate = isMobile ? '📅' : '✓';
  const iconTime = isMobile ? '⏰' : '✓';
  const iconLink = isMobile ? '👉' : '✓';

  let message = `${headerTitle}\n\n`;
  message += `Olá, *${params.customerName}*!\n`;
  message += `Seu atendimento para *${params.serviceName}* com *${params.professionalName}* foi agendado:\n\n`;
  message += `${iconDate} *Data:* ${formattedDate}\n`;
  if (params.time) {
    message += `${iconTime} *Horário Confirmado:* ${params.time}\n`;
  }
  message += `\n${iconLink} *Clique no link abaixo para confirmar sua presença:*\n${confirmUrl}\n\n`;
  message += `_Aguardamos sua confirmação! Caso precise ajustar o horário, responda esta mensagem._`;

  // Sanitiza o telefone do cliente
  let rawPhone = params.customerPhone.replace(/\D/g, '');
  // Se for DDD + 9 dígitos sem o DDI 55, adiciona o 55
  if (rawPhone.length === 10 || rawPhone.length === 11) {
    rawPhone = `55${rawPhone}`;
  }

  const baseUrl = getWhatsAppBaseUrl();
  return `${baseUrl}?phone=${rawPhone}&text=${encodeURIComponent(message)}`;
}
