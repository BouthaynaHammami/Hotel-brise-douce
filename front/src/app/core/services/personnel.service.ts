import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Conge, Tache, StatutTache, StatutConge } from '../models/personnel.model';
import { UtilisateurResponse, RoleEnum } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PersonnelService {

  private apiUrl = 'http://localhost:8081/personnel/api';
  private http = inject(HttpClient);

  // ================= TASKS =================

  getTasks(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/taches`);
  }

  getTasksByEmployee(employeeId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/taches/employe/${employeeId}`);
  }

  addTask(task: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/taches`, task);
  }

  updateTask(task: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/taches`, task);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/taches/${taskId}`);
  }

  getTaskById(taskId: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/taches/${taskId}`);
  }

  // --- NOUVEAU : Permet à l'admin d'assigner une tâche à un membre du personnel ---
  assignTask(taskId: number, employeeId: number): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/taches/${taskId}/assigner/${employeeId}`, {});
  }

  // --- NOUVEAU : Permet au personnel de changer l'état de la tâche (EN_COURS, TERMINE) ---
  updateTaskStatus(taskId: number, status: StatutTache): Observable<Tache> {
    // Le statut est passé en RequestParam côté backend (?statut=VALEUR)
    return this.http.put<Tache>(`${this.apiUrl}/taches/${taskId}/statut?statut=${status}`, {});
  }

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
