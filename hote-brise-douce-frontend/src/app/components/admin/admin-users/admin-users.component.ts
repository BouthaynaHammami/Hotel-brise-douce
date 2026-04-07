import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UtilisateurResponse, RoleEnum } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);

  users: UtilisateurResponse[] = [];
  selectedUser: UtilisateurResponse | null = null;
  RoleEnums = Object.values(RoleEnum);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  deleteUser(userId: number) {
    if(confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  openUpdateModal(user: UtilisateurResponse) {
    // Clone user data for the form
    this.selectedUser = { ...user };
  }

  closeUpdateModal() {
    this.selectedUser = null;
  }

  saveRoleUpdate() {
    if(this.selectedUser) {
      this.userService.updateUserRole(this.selectedUser.idUtilisateur, {
        role: this.selectedUser.role,
        matricule: this.selectedUser.matricule,
        poste: this.selectedUser.poste,
        status: this.selectedUser.status,
        horaires: this.selectedUser.horaires
      }).subscribe(() => {
        this.closeUpdateModal();
        this.loadUsers();
      });
    }
  }

  getRoleBadge(role: RoleEnum): string {
    switch(role) {
      case RoleEnum.ADMIN: return 'badge-red';
      case RoleEnum.PERSONNEL: return 'badge-yellow';
      case RoleEnum.CLIENT: return 'badge-blue';
      default: return 'badge-gray';
    }
  }
}
