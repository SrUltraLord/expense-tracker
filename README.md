# 💰 Expense Tracker Bot

Bot de Telegram para rastrear gastos automáticamente usando IA. Envía un mensaje describiendo tu gasto y el bot lo procesa, categoriza y guarda en Google Sheets.

## ✨ Características

- 🤖 **IA Integrada**: Utiliza Google Gemini para interpretar mensajes en lenguaje natural
- 📊 **Google Sheets**: Almacena automáticamente todos tus gastos en una hoja de cálculo
- ⚡ **Cloudflare Workers**: Infraestructura serverless ultra-rápida y escalable
- 🔒 **Seguro**: Verificación de tokens y autenticación de webhooks
- 🌐 **TypeScript**: Code base completamente tipado

## 🏗️ Arquitectura

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│  Telegram   │─────▶│ Cloudflare Worker│─────▶│   Gemini AI │
│    User     │      │   (Hono Server)  │      └─────────────┘
└─────────────┘      └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Google Sheets   │
                     │    API Storage   │
                     └──────────────────┘
```

## 📋 Requisitos

- [Bun](https://bun.sh/) 1.0+
- Cuenta de Cloudflare (plan gratuito funciona)
- Bot de Telegram (crear con [@BotFather](https://t.me/botfather))
- Google Cloud Project con Sheets API habilitada
- Google Gemini API Key

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/SrUltraLord/expense-tracker.git
cd expense-tracker
bun install
```

### 2. Configurar Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita Google Sheets API
4. Crea una Service Account y descarga las credenciales JSON
5. Crea una Google Sheet y compártela con el email de la Service Account

### 3. Obtener API Keys

- **Telegram Bot Token**: Habla con [@BotFather](https://t.me/botfather) y ejecuta `/newbot`
- **Gemini API Key**: Ve a [Google AI Studio](https://aistudio.google.com/apikey)

### 4. Configurar Secrets en Cloudflare

```bash
# Token del bot de Telegram
bunx wrangler secret put TELEGRAM_BOT_TOKEN

# API Key de Google Gemini
bunx wrangler secret put GEMINI_API_KEY

# Credenciales de Google Service Account (todo el JSON en una línea)
bunx wrangler secret put GOOGLE_SERVICE_ACCOUNT_CREDENTIALS

# ID de tu Google Spreadsheet (obtenerlo de la URL)
bunx wrangler secret put GOOGLE_SPREADSHEET_ID

# Token secreto para verificar webhooks (genera uno aleatorio)
bunx wrangler secret put SECRET_TOKEN

# IDs de chat autorizados - opcional (separados por comas: 123456789,987654321)
# Si no se configura, cualquiera puede usar el bot
bunx wrangler secret put ALLOWED_CHAT_IDS
```

### 5. Configurar el Webhook de Telegram

Una vez desplegado, configura el webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TU_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://expense-tracker.<tu-subdomain>.workers.dev/webhook",
    "secret_token": "<TU_SECRET_TOKEN>"
  }'
```

## 💻 Desarrollo

### Ejecutar en local

```bash
bun run dev
```

El servidor estará disponible en `http://localhost:8787`

### Generar tipos de Cloudflare

```bash
bun run cf-typegen
```

### Desplegar a producción

```bash
bun run deploy
```

## 📝 Uso

Una vez configurado, simplemente envía mensajes a tu bot:

**Ejemplos:**

- "Gasté $50 en comida en el super"
- "Pagué 1200 de renta"
- "30 dólares en uber"
- "Compré café por $5"

El bot automáticamente:

1. ✅ Extrae el monto
2. ✅ Identifica la categoría
3. ✅ Guarda en Google Sheets
4. ✅ Te confirma el registro

## 🗂️ Estructura del Proyecto

```
expense-tracker/
├── src/
│   ├── index.ts              # Entry point (Hono app)
│   ├── types.ts              # TypeScript types
│   ├── handlers/
│   │   ├── index.ts          # Exports
│   │   └── expenses-handler.ts  # Webhook handler
│   ├── middlewares/
│   │   └── index.ts          # Secret token verification
│   ├── services/
│   │   ├── gemini.ts         # Google Gemini integration
│   │   ├── google-sheets.ts  # Google Sheets API
│   │   └── telegram.ts       # Telegram Bot API
│   ├── utils/
│   │   ├── encoding-utils.ts # Base64 encoding
│   │   └── jwt-utils.ts      # JWT verification
│   └── assets/
│       └── prompt.md         # AI prompt template
├── package.json
├── tsconfig.json
├── wrangler.jsonc            # Cloudflare config
└── README.md
```

## 🔧 Variables de Entorno

| Variable                             | Descripción                                       | Requerido   |
| ------------------------------------ | ------------------------------------------------- | ----------- |
| `TELEGRAM_BOT_TOKEN`                 | Token del bot de Telegram                         | ✅          |
| `GEMINI_API_KEY`                     | API key de Google Gemini                          | ✅          |
| `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` | Credenciales JSON de Google Service Account       | ✅          |
| `GOOGLE_SPREADSHEET_ID`              | ID de la hoja de cálculo                          | ✅          |
| `SECRET_TOKEN`                       | Token secreto para verificar webhooks             | ✅          |
| `ALLOWED_CHAT_IDS`                   | IDs de usuarios autorizados (separados por comas) | ⚠️ Opcional |
| `SECRET_TOKEN`                       | Token secreto para verificar webhooks             |

## 🛠️ Tecnologías

- [Hono](https://hono.dev/) - Framework web ultrarrápido
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Google Gemini](https://ai.google.dev/) - Procesamiento de lenguaje natural
- [Google Sheets API](https://developers.google.com/sheets/api) - Almacenamiento de datos
- [Telegram Bot API](https://core.telegram.org/bots/api) - Interfaz de chat

## 📄 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

David - [@SrUltraLord](https://github.com/SrUltraLord)

Project Link: [https://github.com/SrUltraLord/expense-tracker](https://github.com/SrUltraLord/expense-tracker)
