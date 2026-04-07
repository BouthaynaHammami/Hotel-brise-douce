import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Conge, StatutConge } from '../models/personnel.model';
import { UtilisateurResponse, RoleEnum } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PersonnelService {

  private apiUrl = 'http://localhost:8081/personnel/api';
  private http = inject(HttpClient);

  // ================= CONGES =================

  getLeaves(): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges`);
  }

  getLeavesByEmployee(employeeId: number): Observable<Conge[]> {
    return this.http.get<Conge[]>(`${this.apiUrl}/conges/employe/${employeeId}`);
  }

  addLeave(leave: Conge): Observable<Conge> {
    return this.http.post<Conge>(`${this.apiUrl}/conges`, leave);
  }

  updateLeave(leave: Conge): Observable<Conge> {
    return this.http.put<Conge>(`${this.apiUrl}/conges`, leave);
  }

  deleteLeave(leaveId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conges/${leaveId}`);
  }

  getLeaveById(leaveId: number): Observable<Conge> {
    return this.http.get<Conge>(`${this.apiUrl}/conges/${leaveId}`);
  }

  // --- CORRIGÉ : Permet à l'admin d'APPROUVER ou REFUSER le congé ---
  updateLeaveStatus(leaveId: number, status: StatutConge): Observable<Conge> {
    // La route correcte est /traiter et le statut est passé en paramètre de requête
    return this.http.put<Conge>(`${this.apiUrl}/conges/${leaveId}/traiter?statut=${status}`, {});
  }

  // === STAFF ===

  getStaffMembers(): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(`http://localhost:8081/utilisateurs/api/users`).pipe(
      map(users => users.filter(u => u.role === RoleEnum.PERSONNEL))
    );
  }
}
