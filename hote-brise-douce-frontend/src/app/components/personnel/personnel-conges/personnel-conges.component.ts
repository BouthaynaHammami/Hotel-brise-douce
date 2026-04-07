import { Component, OnInit, inject } from '@angular/core';
import { PersonnelService } from '../../../core/services/personnel.service';
import { UserService } from '../../../core/services/user.service';
import { Conge, StatutConge } from '../../../core/models/personnel.model';

@Component({
  selector: 'app-personnel-conges',
  templateUrl: './personnel-conges.component.html',
  styleUrls: ['./personnel-conges.component.css']
})
export class PersonnelCongesComponent implements OnInit {
  isAddLeaveModalVisible = false;
  isLoading = true;
  leaves: Conge[] = [];
  currentEmployeeId: number | null = null;

  newLeave: Conge = {
    dateDebut: '',
    dateFin: '',
    type: '',
    idEmploye: undefined as any
  };

  leaveTypes = [
    'Congé payé',
    'Congé sans solde',
    'Congé maladie',
    'Congé maternité',
    'Congé paternité'
  ];

  private personnelService = inject(PersonnelService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.fetchCurrentEmployeeId();
  }

  fetchCurrentEmployeeId(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentEmployeeId = user.idUtilisateur;
        this.fetchEmployeeLeaves();
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.isLoading = false;
      }
    });
  }

  fetchEmployeeLeaves(): void {
    if (!this.currentEmployeeId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.personnelService.getLeavesByEmployee(this.currentEmployeeId).subscribe({
      next: (leaves) => {
        this.leaves = leaves;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des congés:', err);
        this.isLoading = false;
      }
    });
  }

  openAddLeaveModal(): void {
    this.isAddLeaveModalVisible = true;
    this.resetLeaveForm();
  }

  closeAddLeaveModal(): void {
    this.isAddLeaveModalVisible = false;
    this.resetLeaveForm();
  }

  saveLeave(): void {
    // Validation
    if (!this.newLeave.dateDebut) {
      alert('Erreur: La date de début est requise.');
      return;
    }
    if (!this.newLeave.dateFin) {
      alert('Erreur: La date de fin est requise.');
      return;
    }
    if (!this.newLeave.type || this.newLeave.type.trim().length === 0) {
      alert('Erreur: Le type de congé est requis.');
      return;
    }
    if (!this.currentEmployeeId) {
      alert('Erreur: Impossible de récupérer votre ID utilisateur.');
      return;
    }

    const leaveData: Conge = {
      dateDebut: this.newLeave.dateDebut,
      dateFin: this.newLeave.dateFin,
      type: this.newLeave.type.trim(),
      idEmploye: this.currentEmployeeId
    };

    console.log('Sending leave request:', leaveData);
    this.personnelService.addLeave(leaveData).subscribe({
      next: () => {
        alert('Demande de congé soumise avec succès!');
        this.closeAddLeaveModal();
        this.fetchEmployeeLeaves();
      },
      error: (err) => {
        console.error('Erreur lors de la création du congé:', err);
        alert('Erreur lors de la soumission: ' + (err.error?.detail || err.message || 'Erreur inconnue'));
      }
    });
  }

  resetLeaveForm(): void {
    this.newLeave = {
      dateDebut: '',
      dateFin: '',
      type: '',
      idEmploye: undefined as any
    };
  }

  deleteLeave(leaveId: number | undefined): void {
    if (!leaveId) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de congé?')) return;

    this.personnelService.deleteLeave(leaveId).subscribe({
      next: () => {
        alert('Demande de congé annulée.');
        this.fetchEmployeeLeaves();
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation:', err);
        alert('Erreur lors de l\'annulation: ' + (err.message || 'Erreur inconnue'));
      }
    });
  }

  getStatutBadgeClass(statut: StatutConge | undefined): string {
    if (!statut) return 'badge-gray';
    switch (statut) {
      case StatutConge.EN_ATTENTE:
        return 'badge-yellow';
      case StatutConge.APPROUVE:
        return 'badge-green';
      case StatutConge.REFUSE:
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  }

  getStatutLabel(statut: StatutConge | undefined): string {
    if (!statut) return 'En attente';
    switch (statut) {
      case StatutConge.EN_ATTENTE:
        return 'En attente';
      case StatutConge.APPROUVE:
        return 'Approuvé';
      case StatutConge.REFUSE:
        return 'Refusé';
      default:
        return 'En attente';
    }
  }

  canDeleteLeave(statut: StatutConge | undefined): boolean {
    // Can only delete leaves that are pending
    return statut === StatutConge.EN_ATTENTE;
  }

  calculateLeaveDuration(dateDebut: string, dateFin: string): number {
    try {
      const start = new Date(dateDebut).getTime();
      const end = new Date(dateFin).getTime();
      return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    } catch {
      return 0;
    }
  }
}
