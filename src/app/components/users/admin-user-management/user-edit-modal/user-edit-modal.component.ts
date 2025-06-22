import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserRole } from '../../../../models/user.model';
import { UserService } from '../../../../services/user.service';

export interface UserEditData {
  user: User;
}

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss']
})
export class UserEditModalComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  user: User;

  userRoles = [
    { value: UserRole.ADMIN, label: 'Administrator' },
    { value: UserRole.EDITOR, label: 'Editor' },
    { value: UserRole.WRITER, label: 'Writer' },
    { value: UserRole.READER, label: 'Reader' }
  ];

  // Role ID mapping based on the backend response
  roleIdMapping: { [key: string]: string } = {
    '68569868a2f65688c5e0c95c': 'admin',    // Admin role ID
    '68569868a2f65688c5e0c965': 'reader',   // Reader role ID
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditData
  ) {
    this.user = data.user;
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    const roleValue = this.getRoleValue(this.user.role);
    this.userForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      role: roleValue
    });
  }

  getRoleValue(role: any): string {
    if (!role) return '';
    if (typeof role === 'string') {
      return this.roleIdMapping[role] || 'reader';
    }
    return role.code || '';
  }

  getRoleId(roleCode: string): string {
    // Reverse mapping to get role ID from role code
    for (const [id, code] of Object.entries(this.roleIdMapping)) {
      if (code === roleCode) {
        return id;
      }
    }
    return this.roleIdMapping['68569868a2f65688c5e0c965']; // Default to reader
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user._id) {
      this.loading = true;
      const formValue = this.userForm.value;
      
      const updateData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        role: this.getRoleId(formValue.role)
      };

      this.userService.updateUser(this.user._id, updateData).subscribe({
        next: (updatedUser: User) => {
          this.loading = false;
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(updatedUser);
        },
        error: (error: any) => {
          this.loading = false;
          this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 