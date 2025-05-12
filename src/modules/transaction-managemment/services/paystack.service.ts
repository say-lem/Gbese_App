import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('Paystack secret key is not defined in .env');
}

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class PaystackService {
  static async initializeTransaction(payload: {
    email: string;
    amount: number; // in kobo: e.g. 1000 = ₦10
    callback_url: string;
  }) {
    try {
      const response = await paystack.post('/transaction/initialize', payload);
      return response.data.data; // contains authorization_url, reference, etc.
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Initialization failed');
    }
  }

  static async verifyTransaction(reference: string) {
    try {
      const response = await paystack.get(`/transaction/verify/${reference}`);
      const data = response.data;
      if (!data.status) throw new Error(data.message || 'Verification failed');
      return data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Verification failed');
    }
  }
}
