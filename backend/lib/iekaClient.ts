import axios from 'axios';
import https from 'https';

interface VmiReceiptPayload {
  companyCode: string;
  receiptNumber: number;
  totalAmount: number;
  previousHash: string;
  currentHash: string;
  // Kiti VMI reikalaujami duomenys pagal EKA004 / EKA001 specifikaciją
}

interface VmiClientConfig {
  cert: string;     // Įmonės sertifikatas (PEM formatu arba išenv kintamojo)
  key: string;      // Įmonės privatus raktas (privateKey iš Company modelio)
  passphrase?: string; // Jei raktas apsaugotas slaptažodžiu
  isTestEnvironment?: boolean;
}

export class IekaClient {
  private httpsAgent: https.Agent;
  private baseURL: string;

  constructor(config: VmiClientConfig) {
    // VMI testinės ir gamybinės aplinkos adresai (skiriasi pagal oficialią VMI specifikaciją)
    const isTest = config.isTestEnvironment ?? true;
    this.baseURL = isTest 
      ? 'https://rit.vmi.lt/eka/services' // Pavyzdinis testinis URL
      : 'https://i.eka.vmi.lt/eka/services'; // Pavyzdinis gamybinis URL

    // Sukuriame saugų https agentą mTLS autentifikacijai (TLS 1.2 / 1.3 palaikymas)
    this.httpsAgent = new https.Agent({
      cert: config.cert,
      key: config.key,
      passphrase: config.passphrase,
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true, // Gamybinėje aplinkoje privaloma tikrinti VMI sertifikatą
    });
  }

  /**
   * Virtualios fiskalizacijos (EKA004) arba kvito siuntimo (EKA001) užklausa
   */
  async sendReceipt(payload: VmiReceiptPayload) {
    try {
      const response = await axios.post(`${this.baseURL}/v1/receipts`, payload, {
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10 sekundžių taimautas
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('VMI i.EKA ryšio klaida:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}