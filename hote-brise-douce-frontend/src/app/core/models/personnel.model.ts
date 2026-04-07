// ===== ENUMS =====

export enum StatutConge {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE'
}

// ===== MODELS =====

export interface Conge {
  idConge?: number;
  dateDebut: string;   
  dateFin: string;
  type: string;
  
  statut?: StatutConge; 
  
  idEmploye: number;
}
