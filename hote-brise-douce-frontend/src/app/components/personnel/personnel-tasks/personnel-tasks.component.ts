import { Component, OnInit, inject } from '@angular/core';
import { NettoyageMaintenanceService } from '../../../core/services/nettoyage-maintenance.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  InterventionResponse,
  Priorite,
  StatusIntervention,
  TypeIntervention
} from '../../../core/models/nettoyage-maintenance.model';

@Component({
  selector: 'app-personnel-tasks',
  templateUrl: './personnel-tasks.component.html',
  styleUrls: ['./personnel-tasks.component.css']
})
export class PersonnelTasksComponent implements OnInit {

  filter: StatusIntervention | 'all' = 'all';
  modalOpen = false;
  selectedTask: InterventionResponse | null = null;

  tasks: InterventionResponse[] = [];
  loading = false;
  error: string | null = null;

  StatusIntervention = StatusIntervention;
  Priorite = Priorite;

  private cleaningService = inject(NettoyageMaintenanceService);
  private authService = inject(AuthService);

  get personnelId(): number | null {
    const user = this.authService.getUserFromToken();
    return user?.id ?? user?.idUtilisateur ?? null;
  }

  // ─── Computed stats ───────────────────────────────────────────────────────

  get stats() {
    const aFaire  = this.tasks.filter(t => t.status === StatusIntervention.A_FAIRE).length;
    const enCours = this.tasks.filter(t => t.status === StatusIntervention.EN_COURS).length;
    const termine = this.tasks.filter(t => t.status === StatusIntervention.TERMINE).length;
    return [
      { value: String(aFaire),  color: 'text-yellow-500', label: 'À faire' },
      { value: String(enCours), color: 'text-blue-500',   label: 'En cours' },
      { value: String(termine), color: 'text-green-500',  label: 'Terminées' },
      { value: String(this.tasks.length), color: 'text-navy', label: 'Total assignées' }
    ];
  }

  get filteredTasks(): InterventionResponse[] {
    if (this.filter === 'all') return this.tasks;
    return this.tasks.filter(t => t.status === this.filter);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const id = this.personnelId;
    if (!id) {
      this.error = 'Impossible de récupérer votre identifiant. Veuillez vous reconnecter.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.cleaningService.getByPersonnelId(id).subscribe({
      next: (data) => { this.tasks = data; this.loading = false; },
      error: (err) => {
        console.error('Error fetching tasks', err);
        this.error = 'Erreur lors du chargement des tâches.';
        this.loading = false;
      }
    });
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  setFilter(f: StatusIntervention | 'all') { this.filter = f; }

  openModal(task: InterventionResponse) {
    this.selectedTask = task;
    this.modalOpen = true;
  }

  onStatusSaved(payload: { task: InterventionResponse; newStatus: StatusIntervention }) {
    const id = this.personnelId;
    if (!id) return;

    this.cleaningService.updateStatus(payload.task.idIntervention, id, payload.newStatus).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex(t => t.idIntervention === updated.idIntervention);
        if (idx !== -1) this.tasks[idx] = updated;
        this.modalOpen = false;
      },
      error: (err) => console.error('Error updating status', err)
    });
  }

  onModalClosed() { this.modalOpen = false; }

  // ─── Badge helpers ────────────────────────────────────────────────────────

  getBadgeClass(status: StatusIntervention): string {
    switch (status) {
      case StatusIntervention.A_FAIRE:  return 'badge-yellow';
      case StatusIntervention.EN_COURS: return 'badge-blue';
      case StatusIntervention.TERMINE:  return 'badge-green';
      default:                          return 'badge-gray';
    }
  }

  getBadgeLabel(status: StatusIntervention): string {
    switch (status) {
      case StatusIntervention.A_FAIRE:  return 'À faire';
      case StatusIntervention.EN_COURS: return 'En cours';
      case StatusIntervention.TERMINE:  return 'Terminé ✓';
      default:                          return status;
    }
  }

  getPriorityBadgeClass(p: Priorite): string {
    switch (p) {
      case Priorite.URGENTE: return 'badge-red';
      case Priorite.HAUTE:   return 'badge-orange';
      case Priorite.NORMALE: return 'badge-yellow';
      case Priorite.BASSE:   return 'badge-gray';
      default:               return 'badge-gray';
    }
  }

  getTaskIcon(type: TypeIntervention, status: StatusIntervention): string {
    if (status === StatusIntervention.TERMINE) return '✅';
    return type === TypeIntervention.MAINTENANCE ? '🔧' : '🧹';
  }
}
