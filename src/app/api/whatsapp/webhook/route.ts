import { NextRequest, NextResponse } from 'next/server';
import { updateDbAppointmentStatus } from '@/services/db';

/**
 * Webhook para integração automática com APIs de WhatsApp
 * (Evolution API, Z-API, Meta Cloud API, etc.)
 *
 * Ao receber a resposta do cliente contendo "1", "SIM", "CONFIRMAR", etc.,
 * atualiza automaticamente o status do agendamento para 'confirmado'.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Suporte a diferentes formatos de payload de APIs de WhatsApp
    const messageText = (
      body?.message?.conversation ||
      body?.message?.extendedTextMessage?.text ||
      body?.text?.message ||
      body?.text ||
      body?.data?.message?.conversation ||
      ''
    ).trim().toLowerCase();

    const appointmentId = body?.appointmentId || body?.id;

    // Se o webhook enviar diretamente o appointmentId
    if (appointmentId && (messageText.includes('sim') || messageText.includes('confirm') || messageText === '1')) {
      await updateDbAppointmentStatus(appointmentId, 'confirmado');
      return NextResponse.json({ success: true, message: 'Agendamento confirmado via webhook!' });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro no processamento do webhook';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    description: 'Endpoint de Webhook do WhatsApp Los Santos para confirmação de agendamentos.',
  });
}
