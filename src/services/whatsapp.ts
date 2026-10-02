import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

import fs from 'fs';

const getChromePath = (): string | undefined => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const standardPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  return standardPaths.find((p) => fs.existsSync(p));
};

export class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client | null = null;
  private isReady: boolean = false;
  private latestQr: string | null = null;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public getStatus(): { isReady: boolean; hasQr: boolean; qrCode: string | null } {
    return {
      isReady: this.isReady,
      hasQr: Boolean(this.latestQr),
      qrCode: this.latestQr,
    };
  }

  public initialize(): void {
    if (process.env.NODE_ENV === 'test' || process.env.ENABLE_WHATSAPP === 'false') return;

    try {
      const chromePath = getChromePath();
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: process.env.WA_SESSION_DIR || './.wwebjs_auth',
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          ...(chromePath ? { executablePath: chromePath } : {}),
        },
      });

      this.client.on('qr', (qr: string) => {
        this.latestQr = qr;
        console.log('[WhatsApp Bot] Pindai kode QR terminal ini untuk menghubungkan bot:');
        qrcode.generate(qr, { small: true });
      });

      this.client.on('ready', () => {
        this.isReady = true;
        this.latestQr = null;
        console.log('[WhatsApp Bot] Bot WhatsApp Dimsum Intan siap digunakan!');
      });

      this.client.on('auth_failure', (msg: string) => {
        this.isReady = false;
        this.latestQr = null;
        console.error('[WhatsApp Bot] Otentikasi gagal:', msg);
      });

      this.client.initialize().catch((err: any) => {
        console.warn('[WhatsApp Bot] Menunggu inisialisasi browser runtime:', err.message);
      });
    } catch (err: any) {
      console.warn('[WhatsApp Bot] Inisialisasi dilewati:', err.message);
    }
  }

  public async sendNotification(phone: string, message: string): Promise<boolean> {
    if (!this.client || !this.isReady) {
      console.log(`[WhatsApp Mock Simulation] Mengirim pesan ke ${phone}:\n${message}`);
      return true;
    }

    try {
      const formattedPhone = phone.startsWith('0')
        ? `62${phone.slice(1)}@c.us`
        : `${phone}@c.us`;
      await this.client.sendMessage(formattedPhone, message);
      return true;
    } catch (error) {
      console.error('[WhatsApp Error]', error);
      return false;
    }
  }
}

export const whatsappService = WhatsAppService.getInstance();
