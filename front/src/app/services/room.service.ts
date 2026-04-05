import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Room, Etat, Reservation, ReservationStatus } from '../core/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomsSubject = new BehaviorSubject<Room[]>([
    {
      numero: '101',
      typeChambre: 'Standard',
      etage: 1,
      tarifStandard: 120,
      etat: Etat.DISPONIBLE,
      capacite: 2,
      imageChambre: 'assets/rooms/standard.jpg',
      description: 'Confort et élégance dans un espace pensé pour votre repos.',
      amenities: ['📶 Wi-Fi', '❄️ Climatisation', '📺 TV', '☕ Mini-bar']
    },
    {
      numero: '102',
      typeChambre: 'Standard',
      etage: 1,
      tarifStandard: 120,
      etat: Etat.DISPONIBLE,
      capacite: 2,
      imageChambre: 'assets/rooms/standard.jpg',
      description: 'Confort et élégance dans un espace pensé pour votre repos.',
      amenities: ['📶 Wi-Fi', '❄️ Climatisation', '📺 TV', '☕ Mini-bar']
    },
    {
      numero: '201',
      typeChambre: 'Deluxe',
      etage: 2,
      tarifStandard: 185,
      etat: Etat.DISPONIBLE,
      capacite: 2,
      imageChambre: 'assets/rooms/deluxe.jpg',
      description: 'Spacieuse et lumineuse, une chambre pour les amoureux du luxe.',
      amenities: ['📶 Wi-Fi', '❄️ Climatisation', '📺 TV', '🛁 Baignoire', '🌅 Vue ville']
    },
    {
      numero: '202',
      typeChambre: 'Deluxe',
      etage: 2,
      tarifStandard: 185,
      etat: Etat.OCCUPEE,
      capacite: 2,
      imageChambre: 'assets/rooms/deluxe.jpg',
      description: 'Spacieuse et lumineuse, une chambre pour les amoureux du luxe.',
      amenities: ['📶 Wi-Fi', '❄️ Climatisation', '📺 TV', '🛁 Baignoire', '🌅 Vue ville']
    },
    {
      numero: '301',
      typeChambre: 'Suite',
      etage: 3,
      tarifStandard: 380,
      etat: Etat.DISPONIBLE,
      capacite: 4,
      imageChambre: 'assets/rooms/suite.jpg',
      description: 'L\'expérience ultime avec salon privé et terrasse panoramique.',
      amenities: ['📶 Wi-Fi', '❄️ Climatisation', '📺 TV', '🛁 Jacuzzi', '🌅 Vue panoramique', '🛋️ Salon privé']
    }
  ]);

  private reservationsSubject = new BehaviorSubject<Reservation[]>([
    {
      id: 'res001',
      roomId: '202',
      clientId: 'current-user',
      dateArrivee: new Date('2026-03-28'),
      dateDepart: new Date('2026-04-02'),
      nombreAdultes: 2,
      demandes: 'Arrivée tardive prévue',
      statut: ReservationStatus.CONFIRMEE,
      prixTotal: 925,
      dateReservation: new Date('2026-03-20')
    },
    {
      id: 'res002',
      roomId: '301',
      clientId: 'current-user',
      dateArrivee: new Date('2026-05-15'),
      dateDepart: new Date('2026-05-20'),
      nombreAdultes: 2,
      demandes: '',
      statut: ReservationStatus.CONFIRMEE,
      prixTotal: 1900,
      dateReservation: new Date('2026-03-25')
    }
  ]);

  constructor() { }

  getRooms(): Observable<Room[]> {
    return this.roomsSubject.asObservable();
  }

  getAvailableRooms(dateArrivee: Date, dateDepart: Date, capacite?: number): Observable<Room[]> {
    return new Observable(observer => {
      const allRooms = this.roomsSubject.value;
      const reservations = this.reservationsSubject.value;
      
      const availableRooms = allRooms.filter(room => {
        // Check if room is available (not occupied, maintenance, etc.)
        if (room.etat !== Etat.DISPONIBLE) return false;
        
        // Check capacity if specified
        if (capacite && room.capacite < capacite) return false;
        
        // Check if room is not reserved during the requested period
        const isReserved = reservations.some(reservation => {
          if (reservation.roomId !== room.numero) return false;
          if (reservation.statut === ReservationStatus.ANNULEE) return false;
          
          const resStart = new Date(reservation.dateArrivee);
          const resEnd = new Date(reservation.dateDepart);
          
          // Check for date overlap
          return (dateArrivee < resEnd && dateDepart > resStart);
        });
        
        return !isReserved;
      });
      
      observer.next(availableRooms);
      observer.complete();
    });
  }

  addRoom(room: Room): void {
    const currentRooms = this.roomsSubject.value;
    this.roomsSubject.next([...currentRooms, room]);
  }

  updateRoom(numero: string, updatedRoom: Partial<Room>): void {
    const currentRooms = this.roomsSubject.value;
    const index = currentRooms.findIndex(room => room.numero === numero);
    if (index !== -1) {
      currentRooms[index] = { ...currentRooms[index], ...updatedRoom };
      this.roomsSubject.next([...currentRooms]);
    }
  }

  deleteRoom(numero: string): void {
    const currentRooms = this.roomsSubject.value;
    const filteredRooms = currentRooms.filter(room => room.numero !== numero);
    this.roomsSubject.next(filteredRooms);
  }

  makeReservation(reservation: Omit<Reservation, 'id' | 'dateReservation'>): Observable<Reservation> {
    return new Observable(observer => {
      const newReservation: Reservation = {
        ...reservation,
        id: this.generateId(),
        dateReservation: new Date()
      };
      
      const currentReservations = this.reservationsSubject.value;
      this.reservationsSubject.next([...currentReservations, newReservation]);
      
      observer.next(newReservation);
      observer.complete();
    });
  }

  getReservations(): Observable<Reservation[]> {
    return this.reservationsSubject.asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}