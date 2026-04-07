import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserRegister, UtilisateurResponse, RoleEnum } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private gatewayUrl = 'http://localhost:8081/utilisateurs/api';
  private keycloakTokenUrl = 'http://localhost:8080/realms/Hotel_Realm/protocol/openid-connect/token';
  private keycloakClientId = 'hotel-frontend';

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.keycloakClientId)
      .set('username', username)
      .set('password', password)
      .set('scope', 'openid offline_access');

    return this.http.post<any>(this.keycloakTokenUrl, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    }).pipe(
      tap(response => {
        this.setSession(response.access_token);
        this.currentUserSubject.next(this.getUserFromToken());
      })
    );
  }

  register(user: UserRegister): Observable<UtilisateurResponse> {
    // Registration still goes through the Gateway → FastAPI
    return this.http.post<UtilisateurResponse>(`${this.gatewayUrl}/register`, user);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  private setSession(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      let payload = token.split('.')[1];
      if (!payload) return null;
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) payload += '='.repeat(4 - pad);
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): RoleEnum | null {
    const user = this.getUserFromToken();
    if (!user) return null;

    // Keycloak puts roles in realm_access.roles, not a top-level 'role' field
    const realmRoles: string[] = user?.realm_access?.roles ?? [];
    if (realmRoles.includes('ADMIN')) return RoleEnum.ADMIN;
    if (realmRoles.includes('PERSONNEL')) return RoleEnum.PERSONNEL;
    if (realmRoles.includes('CLIENT')) return RoleEnum.CLIENT;
    return null;
  }
}