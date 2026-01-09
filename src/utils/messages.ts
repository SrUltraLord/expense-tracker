import { AppErrors } from "../types";

export type MessageData = {
  title: string;
  body: string;
  footer?: string;
};

export const ERROR_MESSAGES: Record<AppErrors, MessageData> = {
  SERVICE_OVERLOADED: {
    title: "⏳ Servicio temporalmente ocupado",
    body: "El servicio de inteligencia artificial está experimentando alta demanda en este momento. Por favor, intenta registrar tu gasto nuevamente en unos minutos.",
    footer: "Disculpa las molestias. 🙏",
  },
  NETWORK_ERROR: {
    title: "🌐 Error de conexión",
    body: "No se pudo conectar con el servicio de IA. Verifica tu conexión e intenta nuevamente.",
    footer: "",
  },
  SAVE_ERROR: {
    title: "⚠️ Error al guardar",
    body: "Gasto procesado pero hubo un error al guardarlo. Intenta de nuevo.",
    footer: "",
  },
} as const;
