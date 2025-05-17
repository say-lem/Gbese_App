import axios from 'axios'; 
import { PAYSTACK_SECRET_KEY } from '../../../config/constants';

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
    amount: number; 
    callback_url: string;
  }) {
    try {
      const response = await paystack.post('/transaction/initialize', payload);
      return response.data.data; 
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
