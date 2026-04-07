export enum RoleEnum {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  PERSONNEL = 'PERSONNEL'
}

export enum TypeClientEnum {
  VIP = 'VIP',
  NORMAL = 'NORMAL',
  ENTREPRISE = 'ENTREPRISE'
}

export interface UtilisateurBase {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface UserRegister extends UtilisateurBase {
  motDePasse: string;
}

export interface UserProfileUpdate {
  nom?: string;
  prenom?: string;
  telephone?: string;
  allergies?: string;
  typeClient?: TypeClientEnum;
}

export interface RoleUpdate {
  role: RoleEnum;
  matricule?: string;
  poste?: string;
  status?: string;
  horaires?: string;
}

export interface UtilisateurResponse extends UtilisateurBase {
  idUtilisateur: number;
  role: RoleEnum;
  statusCompte: boolean;
  dateCreation: string;
  
  typeClient?: TypeClientEnum;
  allergies?: string;
  dernierSejour?: string;
  actif?: boolean;
  
  matricule?: string;
  poste?: string;
  dateEmbauche?: string;
  status?: string;
  horaires?: string;
}