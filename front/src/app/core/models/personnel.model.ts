// ===== ENUMS =====

export enum StatutConge {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REFUSE = 'REFUSE'
}

export enum StatutTache {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export enum TypeShift {
  MATIN = 'MATIN',
  SOIR = 'SOIR',
  NUIT = 'NUIT'
}

// ===== MODELS =====

export interface Conge {
  idConge?: number;
  dateDebut: string;   // Format ISO attendu par LocalDate (yyyy-MM-dd)
  dateFin: string;
  type: string;
  
  // Optionnel car le backend l'initialise par défaut à EN_ATTENTE lors d'un ajout
  statut?: StatutConge; 
  
  idEmploye: number;
}

export interface Tache {
  idTache?: number;
  titre: string;
  description: string;
  
  // Optionnel car le backend l'initialise par défaut à A_FAIRE lors d'un ajout
  statut?: StatutTache;
  
  dateDebut: string;
  dateFin: string;
  typeShift: TypeShift;
  
  // Optionnel car une tâche peut être créée par l'admin d'abord, puis assignée plus tard au personnel
  idEmploye?: number; 
}
