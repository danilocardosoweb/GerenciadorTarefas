
import { GoogleGenAI } from "@google/genai";
import { Task, NotificationTarget, User, GroupPermissions } from "../types";

/**
 * Generates and "sends" an email notification for a task.
 * Uses Gemini to draft a technical, professional body.
 */
export const sendTaskEmailNotification = async (
  task: Partial<Task>, 
  target: NotificationTarget,
  recipientInfo: { users?: User[], groups?: GroupPermissions[] }
) => {
  if (target === NotificationTarget.NONE) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Escreva um e-mail formal e técnico de notificação industrial para a empresa Tecnoperfil Alumínio.
  Assunto: [TecnoPerfil] Nova Atividade - ${task.type} - OP: ${task.opNumber || 'N/A'}
  Detalhes da Atividade:
  - Tipo: ${task.type}
  - Prioridade: ${task.priority}
  - Perfil: ${task.productProfile}
  - OP: ${task.opNumber}
  - Descrição: ${task.description}
  - Prazo: ${task.deadline}
  
  O e-mail deve ser direcionado para o nível operacional/gerencial. Use um tom profissional e direto. 
  Mencione que os detalhes completos estão disponíveis no sistema de gestão industrial.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente de comunicação industrial da Tecnoperfil Alumínio. Seu objetivo é redigir comunicações claras, técnicas e profissionais sobre ordens de produção e tarefas de fábrica.",
      }
    });

    const emailBody = response.text;
    
    // Simulate finding recipients
    let recipients: string[] = [];
    if (target === NotificationTarget.GLOBAL) recipients = ['todos@tecnoperfil.com.br'];
    else if (target === NotificationTarget.INDIVIDUAL) recipients = recipientInfo.users?.map(u => u.email) || [];
    else if (target === NotificationTarget.GROUP) recipients = recipientInfo.groups?.map(g => `${g.name.toLowerCase()}@tecnoperfil.com.br`) || [];

    console.log(`[Email Service] Disparando e-mail para: ${recipients.join(', ')}`);
    console.log(`[Email Service] Assunto: [TecnoPerfil] Nova Atividade - ${task.opNumber}`);
    console.log(`[Email Service] Corpo:\n${emailBody}`);

    // In a real world scenario, you would call an endpoint like /api/send-email here
    return {
      success: true,
      recipients,
      body: emailBody
    };
  } catch (error) {
    console.error("Failed to generate/send notification email:", error);
    return { success: false, error };
  }
};
