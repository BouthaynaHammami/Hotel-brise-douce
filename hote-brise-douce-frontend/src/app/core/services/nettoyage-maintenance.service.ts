import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InterventionRequest,
  InterventionResponse,
  StatusIntervention,
  TypeIntervention,
  UtilisateurDTO
} from '../models/nettoyage-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class NettoyageMaintenanceService {
  /** Base URL — routed through the Spring Cloud API Gateway */
  private apiUrl = 'http://localhost:8081/nettoyage_maintenance/api/interventions';
  private http = inject(HttpClient);

  // ─── ADMIN — CRUD ─────────────────────────────────────────────────────────

  /** GET /interventions — all interventions (admin view) */
  getAll(): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(this.apiUrl);
  }

  /** GET /interventions/{id} */
  getById(id: number): Observable<InterventionResponse> {
    return this.http.get<InterventionResponse>(`${this.apiUrl}/${id}`);
  }

  /** POST /interventions */
  create(payload: InterventionRequest): Observable<InterventionResponse> {
    return this.http.post<InterventionResponse>(this.apiUrl, payload);
  }

  /** PUT /interventions/{id} — admin full-update */
  update(id: number, payload: InterventionRequest): Observable<InterventionResponse> {
    return this.http.put<InterventionResponse>(`${this.apiUrl}/${id}`, payload);
  }

  /** DELETE /interventions/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** GET /interventions/status/{status} */
  getByStatus(status: StatusIntervention): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(`${this.apiUrl}/status/${status}`);
  }

  /** GET /interventions/type/{type} */
  getByType(type: TypeIntervention): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(`${this.apiUrl}/type/${type}`);
  }

  // ─── PERSONNEL — own tasks + status update ────────────────────────────────

  /** GET /interventions/personnel/{personnelId} — tasks assigned to this user */
  getByPersonnelId(personnelId: number): Observable<InterventionResponse[]> {
    return this.http.get<InterventionResponse[]>(`${this.apiUrl}/personnel/${personnelId}`);
  }

  /**
   * PATCH /interventions/{id}/personnel/{personnelId}/status?newStatus=EN_COURS
   * Personnel-only: update the status of one of their own interventions.
   */
  updateStatus(
    id: number,
    personnelId: number,
    newStatus: StatusIntervention
  ): Observable<InterventionResponse> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.patch<InterventionResponse>(
      `${this.apiUrl}/${id}/personnel/${personnelId}/status`,
      null,
      { params }
    );
  }

  // ─── ADMIN HELPERS ────────────────────────────────────────────────────────

  /** GET /interventions/personnel — list of PERSONNEL users (for dropdowns) */
  getAllPersonnel(): Observable<UtilisateurDTO[]> {
    return this.http.get<UtilisateurDTO[]>(`${this.apiUrl}/personnel`);
  }
}
