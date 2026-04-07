// ─── Enums (must match Java enums exactly) ───────────────────────────────────

export enum TypeIntervention {
  NETTOYAGE = 'NETTOYAGE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum Priorite {
  BASSE = 'BASSE',
  NORMALE = 'NORMALE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}

export enum StatusIntervention {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

// ─── DTO from the utilisateurs-service (resolved by the backend) ──────────────

export interface UtilisateurDTO {
  idUtilisateur?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
}

// ─── Request payload (POST / PUT to /interventions) ──────────────────────────

export interface InterventionRequest {
  typeIntervention: TypeIntervention;
  description?: string;
  chambreNumero?: number;
  priorite?: Priorite;
  note?: string;
  datePlanification?: string; // ISO date yyyy-MM-dd
  dateDebut?: string;
  dateFin?: string;
  status?: StatusIntervention;
  personnelId?: number | null;
}

// ─── Response payload (GET from /interventions) ──────────────────────────────

export interface InterventionResponse {
  idIntervention: number;
  typeIntervention: TypeIntervention;
  description?: string;
  chambreNumero?: number;
  priorite: Priorite;
  note?: string;
  datePlanification?: string;
  dateDebut?: string;
  dateFin?: string;
  status: StatusIntervention;
  personnelId?: number;
  personnelNom?: string; // resolved by backend: prenom + " " + nom
}

// ─── Legacy alias kept so the service file import doesn't break immediately ───
/** @deprecated Use InterventionResponse instead */
export type NettoyageMaintenance = InterventionResponse;
