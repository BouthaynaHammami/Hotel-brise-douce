import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilisateurResponse, RoleUpdate, UserProfileUpdate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/utilisateurs/api';
  private http = inject(HttpClient);

  // ADMIN: Get all users
  getUsers(): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(`${this.apiUrl}/users`);
  }

  // ADMIN: Update user role and specialized fields
  updateUserRole(userId: number, roleData: RoleUpdate): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}/users/${userId}/role`, roleData);
  }

  // ADMIN: Delete user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // EVERYONE: Update self profile
  updateMyProfile(profileData: UserProfileUpdate): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(`${this.apiUrl}/users/me/profile`, profileData);
  }

  // EVERYONE: Fetch self profile
  getMe(): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${this.apiUrl}/users/me`);
  }
}
