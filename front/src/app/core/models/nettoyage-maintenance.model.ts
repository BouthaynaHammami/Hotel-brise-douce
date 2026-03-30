export enum StatusIntervention {
    EN_ATTENTE = 'EN_ATTENTE',
    EN_COURS = 'EN_COURS',
    TERMINE = 'TERMINE'
}

export enum TypeIntervention {
    NETTOYAGE = 'NETTOYAGE',
    MAINTENANCE = 'MAINTENANCE'
}

export interface UtilisateurDTO {
    idUtilisateur?: number;
    nom?: string;
    prenom?: string;
    email?: string;
    role?: string;
}

export interface NettoyageMaintenance {
    id?: number;
    chambreId?: number;
    numeroChambre?: string;
    type?: TypeIntervention;
    personnelId?: number;
    personnel?: UtilisateurDTO;
    dateIntervention?: string;
    priorite?: string;
    status?: StatusIntervention;
    notes?: string;
}
