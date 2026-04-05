import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserRegister, Token, UtilisateurResponse, RoleEnum } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/utilisateurs/api';
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  login(username: string, password: string): Observable<Token> {
    const body = { username, password };

    return this.http.post<Token>(`${this.apiUrl}/login`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        this.setSession(response.access_token);
        this.currentUserSubject.next(this.getUserFromToken());
      })
    );
  }

  register(user: UserRegister): Observable<UtilisateurResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<UtilisateurResponse>(
      `${this.apiUrl}/register`, 
      user,
      { headers }
    ).pipe(
      catchError(this.handleRegistrationError)
    );
  }

  private handleRegistrationError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.error && error.error.detail) {
      if (Array.isArray(error.error.detail)) {
        // Pydantic validation errors
        const fieldErrors = error.error.detail.map((err: any) => {
          const field = err.loc[err.loc.length - 1];
          return `${field}: ${err.msg}`;
        }).join(', ');
        errorMessage = `Validation error: ${fieldErrors}`;
      } else if (typeof error.error.detail === 'string') {
        // Simple error message (e.g., "Email already registered")
        errorMessage = error.error.detail;
      }
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    }
    
    console.error('Registration error:', error);
    return throwError(() => new Error(errorMessage));
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
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)); // contains 'sub' (email) and 'role'
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

    // Support des tokens classiques (Python custom)
    if (user.role) {
      return user.role;
    }

    // Support des tokens Keycloak (RS256)
    if (user.realm_access && user.realm_access.roles) {
      const roles: string[] = user.realm_access.roles;
      // Normalisation des rôles Keycloak vers RoleEnum
      if (roles.includes('ADMIN')) return RoleEnum.ADMIN;
      if (roles.includes('PERSONNEL') || roles.includes('PERSONNEL')) return RoleEnum.PERSONNEL;
      if (roles.includes('CLIENT')) return RoleEnum.CLIENT;
    }

    return null;
  }
}