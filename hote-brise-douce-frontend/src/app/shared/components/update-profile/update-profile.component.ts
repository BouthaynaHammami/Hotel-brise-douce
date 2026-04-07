import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { UtilisateurResponse, UserProfileUpdate, TypeClientEnum } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit {
  @Input() user: UtilisateurResponse | null = null;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<UtilisateurResponse>();

  private userService = inject(UserService);

  profileData: UserProfileUpdate = {
    nom: '',
    prenom: '',
    telephone: '',
    allergies: '',
  };

  ClientTypes = Object.values(TypeClientEnum);
  errorMessage = '';

  ngOnInit() {
    this.populateForm();
  }

  ngOnChanges() {
    this.populateForm();
  }

  populateForm() {
    if (this.user) {
      this.profileData = {
        nom: this.user.nom,
        prenom: this.user.prenom,
        telephone: this.user.telephone,
        allergies: this.user.allergies,
        typeClient: this.user.typeClient
      };
    }
  }

  onSaveProfile() {
    this.errorMessage = '';
    this.userService.updateMyProfile(this.profileData).subscribe({
      next: (res) => {
        this.profileUpdated.emit(res);
        this.onClose();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || "Erreur de mise à jour";
      }
    });
  }

  onClose() {
    this.visible = false;
    this.close.emit();
  }
}
