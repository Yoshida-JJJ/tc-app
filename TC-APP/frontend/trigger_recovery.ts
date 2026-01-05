import { getBuyerItemByOrder } from './app/actions/item';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function run() {
    const orderId = '747bf8d6-0889-47f5-90ef-c890542ce115';
    console.log(`Triggering recovery for Order: ${orderId}`);
    const result = await getBuyerItemByOrder(orderId);
    console.log('Result:', result);
}

run();
