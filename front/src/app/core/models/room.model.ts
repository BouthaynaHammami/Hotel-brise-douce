export interface Room {
  numero: string;
  typeChambre: string;
  etage: number;
  tarifStandard: number;
  etat: Etat;
  capacite: number;
  imageChambre: string;
  description?: string;
  amenities?: string[];
}

export enum Etat {
  DISPONIBLE = 'DISPONIBLE',
  OCCUPEE = 'OCCUPEE',
  NETTOYAGE = 'NETTOYAGE',
  MAINTENANCE = 'MAINTENANCE',
  HORS_SERVICE = 'HORS_SERVICE'
}

export interface Reservation {
  id?: string;
  roomId: string;
  clientId: string;
  dateArrivee: Date;
  dateDepart: Date;
  nombreAdultes: number;
  nombreEnfants?: number;
  demandes?: string;
  statut: ReservationStatus;
  prixTotal: number;
  dateReservation: Date;
}

export enum ReservationStatus {
  CONFIRMEE = 'CONFIRMEE',
  EN_ATTENTE = 'EN_ATTENTE',
  ANNULEE = 'ANNULEE',
  TERMINEE = 'TERMINEE'
}