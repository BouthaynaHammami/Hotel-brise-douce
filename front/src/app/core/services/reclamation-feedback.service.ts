import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReclamationFeedback,
  CreateReclamationFeedbackDto,
  Statut,
  TypeEntree
} from '../models/reclamation-feedback.model';

@Injectable({
  providedIn: 'root'
})
export class ReclamationFeedbackService {

  private apiUrl = 'http://localhost:8082/avis_reclamations/api/reclamations-feedbacks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReclamationFeedback[]> {
    return this.http.get<ReclamationFeedback[]>(this.apiUrl);
  }

  getById(id: number): Observable<ReclamationFeedback> {
    return this.http.get<ReclamationFeedback>(`${this.apiUrl}/${id}`);
  }

  getByType(type: TypeEntree): Observable<ReclamationFeedback[]> {
    return this.http.get<ReclamationFeedback[]>(`${this.apiUrl}/type/${type}`);
  }

  getByClient(idClient: number): Observable<ReclamationFeedback[]> {
    return this.http.get<ReclamationFeedback[]>(`${this.apiUrl}/client/${idClient}`);
  }

  create(dto: CreateReclamationFeedbackDto): Observable<ReclamationFeedback> {
    return this.http.post<ReclamationFeedback>(this.apiUrl, dto);
  }

  update(id: number, dto: Partial<ReclamationFeedback>): Observable<ReclamationFeedback> {
    return this.http.put<ReclamationFeedback>(`${this.apiUrl}/${id}`, dto);
  }

  changerStatut(id: number, statut: Statut, reponse?: string): Observable<ReclamationFeedback> {
    let params = new HttpParams().set('statut', statut);
    if (reponse) params = params.set('reponse', reponse);
    return this.http.patch<ReclamationFeedback>(`${this.apiUrl}/${id}/statut`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}