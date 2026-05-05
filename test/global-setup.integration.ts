import { setupTestDatabase } from './global-setup';

export default async function globalSetup() {
  await setupTestDatabase(process.env.DB_SCHEMA ?? 'test_integration');
}
