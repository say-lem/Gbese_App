import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load env vars once at the top level of your app

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('Paystack secret key is not defined in .env');
}

export const verifyPaystackTransaction = async (reference: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    if (!data.status) {
      throw new Error('Verification failed');
    }

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Paystack verification failed'
    );
  }
};
