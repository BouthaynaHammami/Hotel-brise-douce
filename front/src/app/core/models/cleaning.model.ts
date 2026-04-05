import { UtilisateurResponse } from './user.model';

export enum TypeIntervention {
  NETTOYAGE = 'NETTOYAGE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum StatusIntervention {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export interface NettoyageMaintenance {
  id?: number;
  chambreId?: number;
  numeroChambre?: string;
  type?: TypeIntervention;
  personnelId?: number;
  personnel?: UtilisateurResponse;
  dateIntervention?: string;
  priorite?: string;
  status?: StatusIntervention;
  notes?: string;
}
