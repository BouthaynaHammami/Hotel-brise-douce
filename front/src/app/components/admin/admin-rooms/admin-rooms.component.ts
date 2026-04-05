import { Component, OnInit } from '@angular/core';
import { Room, Etat } from '../../../core/models/room.model';
import { RoomService } from '../../../services/room.service';

@Component({ 
  selector: 'app-admin-rooms', 
  templateUrl: './admin-rooms.component.html', 
  styleUrls: ['./admin-rooms.component.css'] 
})
export class AdminRoomsComponent implements OnInit {
  filter = 'all';
  rooms: Room[] = [];
  showAddModal = false;
  newRoom: Room = {
    numero: '',
    typeChambre: '',
    etage: 1,
    tarifStandard: 0,
    etat: Etat.DISPONIBLE,
    capacite: 1,
    imageChambre: ''
  };

  roomTypes = ['Standard', 'Deluxe', 'Suite', 'Suite Présidentielle'];
  etatOptions = Object.values(Etat);

  constructor(private roomService: RoomService) {}

  ngOnInit() {
    this.roomService.getRooms().subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  get filteredRooms() {
    if (this.filter === 'all') return this.rooms;
    return this.rooms.filter(room => room.etat.toLowerCase() === this.filter.toLowerCase());
  }

  setFilter(filter: string) {
    this.filter = filter;
  }

  openAddModal() {
    this.showAddModal = true;
    this.resetNewRoom();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetNewRoom();
  }

  resetNewRoom() {
    this.newRoom = {
      numero: '',
      typeChambre: '',
      etage: 1,
      tarifStandard: 0,
      etat: Etat.DISPONIBLE,
      capacite: 1,
      imageChambre: ''
    };
  }

  addRoom() {
    if (this.isValidRoom()) {
      this.roomService.addRoom(this.newRoom);
      this.closeAddModal();
    }
  }

  isValidRoom(): boolean {
    return this.newRoom.numero.trim() !== '' && 
           this.newRoom.typeChambre.trim() !== '' &&
           this.newRoom.etage > 0 &&
           this.newRoom.tarifStandard > 0 &&
           this.newRoom.capacite > 0;
  }

  getRoomStatusBadge(etat: Etat): string {
    switch (etat) {
      case Etat.DISPONIBLE: return 'badge-green';
      case Etat.OCCUPEE: return 'badge-blue';
      case Etat.NETTOYAGE: return 'badge-yellow';
      case Etat.MAINTENANCE: return 'badge-red';
      case Etat.HORS_SERVICE: return 'badge-gray';
      default: return 'badge-gray';
    }
  }

  getRoomBorder(etat: Etat): string {
    switch (etat) {
      case Etat.DISPONIBLE: return 'border-green-400';
      case Etat.OCCUPEE: return 'border-blue-400';
      case Etat.NETTOYAGE: return 'border-yellow-400';
      case Etat.MAINTENANCE: return 'border-red-400';
      case Etat.HORS_SERVICE: return 'border-gray-400';
      default: return 'border-gray-400';
    }
  }

  getStatusLabel(etat: Etat): string {
    switch (etat) {
      case Etat.DISPONIBLE: return 'Disponible';
      case Etat.OCCUPEE: return 'Occupée';
      case Etat.NETTOYAGE: return 'Nettoyage';
      case Etat.MAINTENANCE: return 'Maintenance';
      case Etat.HORS_SERVICE: return 'Hors Service';
      default: return etat;
    }
  }
}
