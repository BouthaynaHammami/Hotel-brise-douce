import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NettoyageMaintenance, StatusIntervention, TypeIntervention, UtilisateurDTO } from '../models/nettoyage-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class NettoyageMaintenanceService {
  private apiUrl = 'http://localhost:8081/nettoyage_maintenance/api/interventions';
  private http = inject(HttpClient);

  getAll(): Observable<NettoyageMaintenance[]> {
    return this.http.get<NettoyageMaintenance[]>(this.apiUrl);
  }

  getById(id: number): Observable<NettoyageMaintenance> {
    return this.http.get<NettoyageMaintenance>(`${this.apiUrl}/${id}`);
  }

  create(intervention: NettoyageMaintenance): Observable<NettoyageMaintenance> {
    return this.http.post<NettoyageMaintenance>(this.apiUrl, intervention);
  }

  update(id: number, intervention: NettoyageMaintenance): Observable<NettoyageMaintenance> {
    return this.http.put<NettoyageMaintenance>(`${this.apiUrl}/${id}`, intervention);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: StatusIntervention): Observable<NettoyageMaintenance[]> {
    return this.http.get<NettoyageMaintenance[]>(`${this.apiUrl}/status/${status}`);
  }

  getByType(type: TypeIntervention): Observable<NettoyageMaintenance[]> {
    return this.http.get<NettoyageMaintenance[]>(`${this.apiUrl}/type/${type}`);
  }

  getAllPersonnel(token: string): Observable<UtilisateurDTO[]> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get<UtilisateurDTO[]>(`${this.apiUrl}/personnel`, { headers });
  }

  setPersonnelToIntervention(id: number, personnelId: number, token: string): Observable<NettoyageMaintenance> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put<NettoyageMaintenance>(`${this.apiUrl}/${id}/personnel/${personnelId}`, {}, { headers });
  }
}
