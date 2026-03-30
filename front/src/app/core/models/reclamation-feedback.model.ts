export type TypeEntree = 'RECLAMATION' | 'FEEDBACK';
export type Statut = 'NOUVELLE' | 'EN_COURS' | 'RESOLUE' | 'FERMEE';
export type Priorite = 'FAIBLE' | 'MOYENNE' | 'HAUTE';

export interface ReclamationFeedback {
  id: number;
  typeEntree: TypeEntree;
  titre: string;
  description: string;
  categorie: string;
  priorite: Priorite;
  statut: Statut;
  note?: number;
  reponse?: string;
  idClient: number;
  idReservation?: number;
  dateCreation: string;
  dateResolution?: string;
}

export interface CreateReclamationFeedbackDto {
  typeEntree: TypeEntree;
  titre: string;
  description: string;
  categorie: string;
  priorite: Priorite;
  note?: number;
  idClient: number;
  idReservation?: number;
}