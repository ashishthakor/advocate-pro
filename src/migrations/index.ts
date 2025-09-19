import { Migration } from '../lib/migrations/migration';
import { createUsersTable } from './001_create_users_table';
import { createProfilesTable } from './002_create_profiles_table';
import { createCompetitionsTable } from './003_create_competitions_table';
import { createParticipantsTable } from './004_create_participants_table';
import { seedInitialData } from './005_seed_initial_data';
import { createClientsTable } from './006_create_clients_table';
import { createCasesTable } from './007_create_cases_table';
import { createDocumentsTable } from './008_create_documents_table';
import { createAppointmentsTable } from './009_create_appointments_table';
import { seedAdvocateData } from './010_seed_advocate_data';

export const migrations: Migration[] = [
  createUsersTable,
  createProfilesTable,
  createCompetitionsTable,
  createParticipantsTable,
  seedInitialData,
  createClientsTable,
  createCasesTable,
  createDocumentsTable,
  createAppointmentsTable,
  seedAdvocateData,
];

export * from './001_create_users_table';
export * from './002_create_profiles_table';
export * from './003_create_competitions_table';
export * from './004_create_participants_table';
export * from './005_seed_initial_data';
export * from './006_create_clients_table';
export * from './007_create_cases_table';
export * from './008_create_documents_table';
export * from './009_create_appointments_table';
export * from './010_seed_advocate_data';
