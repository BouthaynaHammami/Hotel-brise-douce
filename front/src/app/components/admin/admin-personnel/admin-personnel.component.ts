import { Component, OnInit, inject } from '@angular/core';
import { PersonnelService } from '../../../core/services/personnel.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoleEnum } from '../../../core/models/user.model';
import { Tache, TypeShift, StatutTache, Conge, StatutConge } from '../../../core/models/personnel.model';

@Component({ selector: 'app-admin-personnel', templateUrl: './admin-personnel.component.html', styleUrls: ['./admin-personnel.component.css'] })
export class AdminPersonnelComponent implements OnInit {
    staff: any[] = [];
    tasks: Tache[] = [];
    leaves: Conge[] = [];
    isAddModalVisible = false;
    isEditModalVisible = false;
    isAddTaskModalVisible = false;
    isEditTaskModalVisible = false;
    isAddLeaveModalVisible = false;
    isEditLeaveModalVisible = false;
    activeTab: 'personnel' | 'taches' | 'conges' = 'personnel';
    
    editingEmployee: any = {
        idUtilisateur: null,
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        poste: '',
        status: 'Actif'
    };
    
    newEmployee: any = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        motDePasse: '',
        poste: '',
        role: RoleEnum.PERSONNEL
    };

    newTask: Tache = {
        titre: '',
        description: '',
        dateDebut: '',
        dateFin: '',
        typeShift: TypeShift.MATIN,
        idEmploye: undefined as any,
        statut: StatutTache.A_FAIRE
    };

    newLeave: Conge = {
        dateDebut: '',
        dateFin: '',
        type: '',
        idEmploye: undefined as any
    };

    editingTask: Tache = { ...this.newTask };
    editingLeave: Conge = { ...this.newLeave };

    typeShiftOptions = Object.values(TypeShift);

    private personnelService = inject(PersonnelService);
    private authService = inject(AuthService);
    private userService = inject(UserService);

    ngOnInit(): void {
        this.fetchStaff();
        this.fetchTasks();
        this.fetchLeaves();
    }

    fetchStaff(): void {
        // We use forkJoin to get both users and tasks to calculate the count
        forkJoin({
            users: this.personnelService.getStaffMembers(),
            tasks: this.personnelService.getTasks()
        }).subscribe({
            next: ({ users, tasks }) => {
                this.tasks = tasks; // Also update tasks list
                this.staff = users.map(u => {
                    const taskCount = tasks.filter(t => t.idEmploye === u.idUtilisateur).length;
                    return {
                        idEmploye: u.idUtilisateur,
                        name: `${u.nom} ${u.prenom}`,
                        role: u.poste || 'Employé',
                        contact: u.telephone || u.email,
                        tasks: taskCount,
                        status: u.status || 'Actif',
                        badge: this.getBadgeClass(u.status || 'Actif')
                    };
                });
            },
            error: (err) => {
                console.error('Erreur lors de la récupération du personnel et des tâches:', err);
            }
        });
    }

    saveEmployee(): void {
        // 1. Validation Frontend stricte (Correspond aux règles Pydantic du Backend)
        if (!this.newEmployee.nom || this.newEmployee.nom.trim().length === 0) {
            alert('Erreur: Le nom est requis.');
            return;
        }
        if (!this.newEmployee.prenom || this.newEmployee.prenom.trim().length === 0) {
            alert('Erreur: Le prénom est requis.');
            return;
        }
        if (!this.newEmployee.email || !this.newEmployee.email.includes('@')) {
            alert('Erreur: Email invalide.');
            return;
        }
        if (!this.newEmployee.motDePasse || this.newEmployee.motDePasse.length < 6) {
            alert('Erreur: Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        
        let validPhone = this.newEmployee.telephone ? this.newEmployee.telephone.trim() : '';
        if (validPhone.length < 8) {
            // Pydantic requiert au moins 8 caractères, on met un placeholder valide si c'est laissé vide
            validPhone = '00000000';
        }

        const registerData = {
            nom: this.newEmployee.nom.trim(),
            prenom: this.newEmployee.prenom.trim(),
            email: this.newEmployee.email.trim(),
            telephone: validPhone,
            motDePasse: this.newEmployee.motDePasse
        };

        this.authService.register(registerData).subscribe({
            next: (createdUser) => {
                const roleData = {
                    role: RoleEnum.PERSONNEL,
                    poste: this.newEmployee.poste
                };
                
                this.userService.updateUserRole(createdUser.idUtilisateur, roleData).subscribe({
                    next: () => {
                        this.isAddModalVisible = false;
                        this.resetForm();
                        this.fetchStaff();
                    },
                    error: (err) => {
                        console.error('Erreur mise à jour rôle:', err);
                        alert('Erreur lors de la mise à jour du rôle: ' + (err.message || 'Erreur inconnue'));
                    }
                });
            },
            error: (err) => {
                console.error('Erreur inscription:', err);
                alert('Erreur lors de l\'inscription: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    resetForm(): void {
        this.newEmployee = {
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            motDePasse: '',
            poste: '',
            role: RoleEnum.PERSONNEL
        };
    }

    openEditModal(memberId: number): void {
        // Find the staff member from our local 'staff' array or fetch from service
        const member = this.staff.find(s => s.idEmploye === memberId);
        if (member) {
            this.editingEmployee = {
                idUtilisateur: member.idEmploye,
                nom: member.name.split(' ')[0],
                prenom: member.name.split(' ')[1] || '',
                email: member.contact.includes('@') ? member.contact : '',
                telephone: member.contact.includes('@') ? '' : member.contact,
                poste: member.role
            };
            // Try to find the actual user to get full details if needed
            this.userService.getUsers().subscribe(users => {
                const fullUser = users.find(u => u.idUtilisateur === memberId);
                if (fullUser) {
                    this.editingEmployee = {
                        idUtilisateur: fullUser.idUtilisateur,
                        nom: fullUser.nom,
                        prenom: fullUser.prenom,
                        email: fullUser.email,
                        telephone: fullUser.telephone,
                        poste: fullUser.poste,
                        status: fullUser.status || 'Actif'
                    };
                }
                this.isEditModalVisible = true;
            });
        }
    }

    updateEmployee(): void {
        if (!this.editingEmployee.nom || !this.editingEmployee.prenom) {
            alert('Le nom et le prénom sont requis.');
            return;
        }

        const roleData = {
            role: RoleEnum.PERSONNEL,
            poste: this.editingEmployee.poste,
            status: this.editingEmployee.status || 'Actif'
        };

        const profileData = {
            nom: this.editingEmployee.nom,
            prenom: this.editingEmployee.prenom,
            telephone: this.editingEmployee.telephone
        };

        // Utilisation de forkJoin pour effectuer les deux mises à jour simultanément
        forkJoin({
            role: this.userService.updateUserRole(this.editingEmployee.idUtilisateur, roleData),
            profile: this.userService.updateUserProfile(this.editingEmployee.idUtilisateur, profileData)
        }).subscribe({
            next: () => {
                this.isEditModalVisible = false;
                this.fetchStaff();
                alert('Collaborateur mis à jour avec succès !');
            },
            error: (err) => {
                console.error('Erreur mise à jour:', err);
                alert('Erreur lors de la mise à jour complète du collaborateur.');
            }
        });
    }

    private getBadgeClass(status: string): string {
        const s = status.toUpperCase();
        if (s.includes('ACTIF')) return 'badge-green';
        if (s.includes('PAUSE')) return 'badge-yellow';
        if (s.includes('CONGÉ') || s.includes('CONGE')) return 'badge-blue';
        return 'badge-gray';
    }

    // ========== TASKS MANAGEMENT ==========

    fetchTasks(): void {
        this.personnelService.getTasks().subscribe({
            next: (tasks) => {
                this.tasks = tasks;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des tâches:', err);
            }
        });
    }

    openAddTaskModal(): void {
        this.isAddTaskModalVisible = true;
        this.resetTaskForm();
    }

    closeAddTaskModal(): void {
        this.isAddTaskModalVisible = false;
        this.resetTaskForm();
    }

    saveTask(): void {
        // Validation
        if (!this.newTask.titre || this.newTask.titre.trim().length === 0) {
            alert('Erreur: Le titre de la tâche est requis.');
            return;
        }
        if (!this.newTask.description || this.newTask.description.trim().length === 0) {
            alert('Erreur: La description est requise.');
            return;
        }
        if (!this.newTask.dateDebut) {
            alert('Erreur: La date de début est requise.');
            return;
        }
        if (!this.newTask.dateFin) {
            alert('Erreur: La date de fin est requise.');
            return;
        }
        if (!this.newTask.idEmploye) {
            alert('Erreur: Vous devez assigner la tâche à un membre du personnel.');
            return;
        }

        const taskData: Tache = {
            titre: this.newTask.titre.trim(),
            description: this.newTask.description.trim(),
            dateDebut: this.newTask.dateDebut,
            dateFin: this.newTask.dateFin,
            typeShift: this.newTask.typeShift,
            idEmploye: this.newTask.idEmploye
            // Note: statut is NOT sent on creation - backend initializes it to A_FAIRE
        };

        console.log('Sending task data:', taskData);
        this.personnelService.addTask(taskData).subscribe({
            next: () => {
                alert('Tâche créée et assignée avec succès!');
                this.closeAddTaskModal();
                this.fetchTasks();
            },
            error: (err) => {
                console.error('Erreur lors de la création de la tâche:', err);
                alert('Erreur lors de la création de la tâche: ' + (err.error?.detail || err.message || 'Erreur inconnue'));
            }
        });
    }

    resetTaskForm(): void {
        this.newTask = {
            titre: '',
            description: '',
            dateDebut: '',
            dateFin: '',
            typeShift: TypeShift.MATIN,
            idEmploye: undefined as any,
            statut: StatutTache.A_FAIRE
        };
    }

    deleteTask(taskId: number | undefined): void {
        if (!taskId) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) return;

        this.personnelService.deleteTask(taskId).subscribe({
            next: () => {
                alert('Tâche supprimée avec succès!');
                this.fetchTasks();
            },
            error: (err) => {
                console.error('Erreur lors de la suppression:', err);
                alert('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    openEditTaskModal(task: Tache): void {
        this.editingTask = { ...task };
        this.isEditTaskModalVisible = true;
    }

    closeEditTaskModal(): void {
        this.isEditTaskModalVisible = false;
    }

    updateTask(): void {
        if (!this.editingTask.titre || !this.editingTask.idEmploye) {
            alert('Le titre et l\'employé sont requis.');
            return;
        }

        this.personnelService.updateTask(this.editingTask).subscribe({
            next: () => {
                alert('Tâche mise à jour avec succès !');
                this.isEditTaskModalVisible = false;
                this.fetchTasks();
            },
            error: (err) => {
                console.error('Erreur mise à jour tâche:', err);
                alert('Erreur lors de la mise à jour de la tâche.');
            }
        });
    }

    getStaffMemberName(idEmploye: number | undefined): string {
        if (!idEmploye) return 'Non assignée';
        const member = this.staff.find(s => s.idEmploye === idEmploye);
        return member ? member.name : `Personnel ID: ${idEmploye}`;
    }

    getStatutBadgeClass(statut: StatutTache | undefined): string {
        if (!statut) return 'badge-gray';
        switch (statut) {
            case StatutTache.A_FAIRE:
                return 'badge-gray';
            case StatutTache.EN_COURS:
                return 'badge-yellow';
            case StatutTache.TERMINE:
                return 'badge-green';
            default:
                return 'badge-gray';
        }
    }

    // ========== LEAVES MANAGEMENT ==========

    fetchLeaves(): void {
        this.personnelService.getLeaves().subscribe({
            next: (leaves) => {
                this.leaves = leaves;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des congés:', err);
            }
        });
    }

    openAddLeaveModal(): void {
        this.isAddLeaveModalVisible = true;
        this.resetLeaveForm();
    }

    closeAddLeaveModal(): void {
        this.isAddLeaveModalVisible = false;
        this.resetLeaveForm();
    }

    saveLeave(): void {
        // Validation
        if (!this.newLeave.dateDebut) {
            alert('Erreur: La date de début est requise.');
            return;
        }
        if (!this.newLeave.dateFin) {
            alert('Erreur: La date de fin est requise.');
            return;
        }
        if (!this.newLeave.type || this.newLeave.type.trim().length === 0) {
            alert('Erreur: Le type de congé est requis.');
            return;
        }
        if (!this.newLeave.idEmploye) {
            alert('Erreur: Vous devez assigner le congé à un membre du personnel.');
            return;
        }

        const leaveData: Conge = {
            dateDebut: this.newLeave.dateDebut,
            dateFin: this.newLeave.dateFin,
            type: this.newLeave.type.trim(),
            idEmploye: this.newLeave.idEmploye
            // Note: statut is NOT sent on creation - backend initializes it to EN_ATTENTE
        };

        console.log('Sending leave data:', leaveData);
        this.personnelService.addLeave(leaveData).subscribe({
            next: () => {
                alert('Congé créé avec succès!');
                this.closeAddLeaveModal();
                this.fetchLeaves();
            },
            error: (err) => {
                console.error('Erreur lors de la création du congé:', err);
                alert('Erreur lors de la création du congé: ' + (err.error?.detail || err.message || 'Erreur inconnue'));
            }
        });
    }

    resetLeaveForm(): void {
        this.newLeave = {
            dateDebut: '',
            dateFin: '',
            type: '',
            idEmploye: undefined as any
        };
    }

    deleteLeave(leaveId: number | undefined): void {
        if (!leaveId) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce congé?')) return;

        this.personnelService.deleteLeave(leaveId).subscribe({
            next: () => {
                alert('Congé supprimé avec succès!');
                this.fetchLeaves();
            },
            error: (err) => {
                console.error('Erreur lors de la suppression:', err);
                alert('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    approveLeave(leaveId: number | undefined): void {
        if (!leaveId) return;
        if (!confirm('Êtes-vous sûr de vouloir approuver ce congé?')) return;

        this.personnelService.updateLeaveStatus(leaveId, StatutConge.APPROUVE).subscribe({
            next: () => {
                alert('Congé approuvé avec succès!');
                this.fetchLeaves();
            },
            error: (err) => {
                console.error('Erreur lors de l\'approbation:', err);
                alert('Erreur lors de l\'approbation: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    refuseLeave(leaveId: number | undefined): void {
        if (!leaveId) return;
        if (!confirm('Êtes-vous sûr de vouloir refuser ce congé?')) return;

        this.personnelService.updateLeaveStatus(leaveId, StatutConge.REFUSE).subscribe({
            next: () => {
                alert('Congé refusé avec succès!');
                this.fetchLeaves();
            },
            error: (err) => {
                console.error('Erreur lors du refus:', err);
                alert('Erreur lors du refus: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    openEditLeaveModal(leave: Conge): void {
        this.editingLeave = { ...leave };
        this.isEditLeaveModalVisible = true;
    }

    closeEditLeaveModal(): void {
        this.isEditLeaveModalVisible = false;
    }

    updateLeave(): void {
        if (!this.editingLeave.dateDebut || !this.editingLeave.idEmploye) {
            alert('La date et l\'employé sont requis.');
            return;
        }

        this.personnelService.updateLeave(this.editingLeave).subscribe({
            next: () => {
                alert('Congé mis à jour avec succès !');
                this.isEditLeaveModalVisible = false;
                this.fetchLeaves();
            },
            error: (err) => {
                console.error('Erreur mise à jour congé:', err);
                alert('Erreur lors de la mise à jour du congé.');
            }
        });
    }

    getLeaveStatutBadgeClass(statut: StatutConge | undefined): string {
        if (!statut) return 'badge-gray';
        switch (statut) {
            case StatutConge.EN_ATTENTE:
                return 'badge-yellow';
            case StatutConge.APPROUVE:
                return 'badge-green';
            case StatutConge.REFUSE:
                return 'badge-red';
            default:
                return 'badge-gray';
        }
    }
}
