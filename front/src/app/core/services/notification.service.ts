import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap, shareReplay, catchError } from 'rxjs/operators';
import { Notification } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8081/utilisateurs/api/notifications';
  private http = inject(HttpClient);
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Poll notifications every 30 seconds
    timer(0, 30000).pipe(
      switchMap(() => this.getMyNotifications()),
      catchError(err => {
        console.error('Error polling notifications:', err);
        return [];
      })
    ).subscribe(notifications => {
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(notifications.filter(n => !n.lue).length);
    });
  }

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/me`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => n.id === id ? { ...n, lue: true } : n);
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(updated.filter(n => !n.lue).length);
      })
    );
  }
}
