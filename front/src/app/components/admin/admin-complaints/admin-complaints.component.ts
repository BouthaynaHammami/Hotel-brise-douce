import { Component, OnInit } from '@angular/core';
import { ReclamationFeedbackService } from '../../../core/services/reclamation-feedback.service';
import {
  ReclamationFeedback,
  TypeEntree,
  Statut,
  Priorite
} from '../../../core/models/reclamation-feedback.model';

@Component({
  selector: 'app-admin-complaints',
  templateUrl: './admin-complaints.component.html',
  styleUrls: ['./admin-complaints.component.css']
})
export class AdminComplaintsComponent implements OnInit {
  items: ReclamationFeedback[] = [];
  filtered: ReclamationFeedback[] = [];
  activeTab: 'ALL' | TypeEntree = 'ALL';
  loading = true;
  error = '';

  selectedItem: ReclamationFeedback | null = null;
  showModal = false;
  reponseAdmin = '';
  savingStatut = false;

  constructor(private reclamationService: ReclamationFeedbackService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.reclamationService.getAll().subscribe({
      next: (data: ReclamationFeedback[]) => {
        this.items = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les données. Vérifiez que le backend tourne sur le port 8082.';
        this.loading = false;
      }
    });
  }

  setTab(tab: 'ALL' | TypeEntree): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filtered = this.activeTab === 'ALL'
      ? this.items
      : this.items.filter(i => i.typeEntree === this.activeTab);
  }

  ouvrirDetail(item: ReclamationFeedback): void {
    this.selectedItem = { ...item };
    this.reponseAdmin = item.reponse ?? '';
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.selectedItem = null;
    this.reponseAdmin = '';
  }

  changerStatut(id: number, statut: Statut, reponse?: string): void {
    this.savingStatut = true;
    this.reclamationService.changerStatut(id, statut, reponse).subscribe({
      next: () => {
        this.savingStatut = false;
        this.fermerModal();
        this.loadAll();
      },
      error: () => {
        this.savingStatut = false;
        alert('Erreur lors du changement de statut');
      }
    });
  }

  resoudreAvecReponse(): void {
    if (!this.selectedItem) return;
    this.changerStatut(this.selectedItem.id, 'RESOLUE', this.reponseAdmin);
  }

  supprimer(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.reclamationService.delete(id).subscribe({
        next: () => this.loadAll(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  getStatutClass(statut: Statut): string {
    const map: Record<Statut, string> = {
      NOUVELLE: 'badge bg-warning text-dark',
      EN_COURS: 'badge bg-info text-dark',
      RESOLUE:  'badge bg-success',
      FERMEE:   'badge bg-secondary'
    };
    return map[statut] ?? 'badge bg-secondary';
  }

  getTypeClass(type: TypeEntree): string {
    return type === 'RECLAMATION' ? 'badge bg-danger' : 'badge bg-primary';
  }

  getPrioriteClass(priorite: Priorite): string {
    const map: Record<Priorite, string> = {
      FAIBLE:  'badge bg-success',
      MOYENNE: 'badge bg-warning text-dark',
      HAUTE:   'badge bg-danger'
    };
    return map[priorite] ?? 'badge bg-secondary';
  }

  count(type: TypeEntree): number {
    return this.items.filter(i => i.typeEntree === type).length;
  }

  countStatut(statut: Statut): number {
    return this.items.filter(i => i.statut === statut).length;
  }
}