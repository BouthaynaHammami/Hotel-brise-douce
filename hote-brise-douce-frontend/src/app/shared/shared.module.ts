import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UpdateProfileComponent } from './components/update-profile/update-profile.component';

@NgModule({
    declarations: [UpdateProfileComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, UpdateProfileComponent]
})
export class SharedModule { }
