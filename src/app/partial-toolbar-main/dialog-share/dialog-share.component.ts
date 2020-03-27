import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { User } from '../../users/user';
import { TNoteAccess, TNoteAccessPermissions } from '../../notes/note';
import { List } from 'immutable';


@Component({
  selector: 'dialog-share',
  templateUrl: './dialog-share.component.html',
  styleUrls: ['./dialog-share.component.scss']
})
export class DialogShareComponent implements OnInit, OnDestroy {
  userAutocomplete = new FormControl();
  availableUsers: List<User>;
  filteredUsers: Observable<List<User>>;

  constructor(
    public dialogRef: MatDialogRef<DialogShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit() {
    this.updateAvailableUsers(this.data.access);

    this.filteredUsers = this.userAutocomplete.valueChanges.pipe(
      startWith(''),
      map(value => this.filterUsers(value))
    );
  }

  ngOnDestroy() {
  }

  private filterUsers(value: string): List<User> {
    const filterValue = value.toLowerCase();

    return this.availableUsers.filter((user: User) => {
      return user.name.first_name.toLowerCase().indexOf(filterValue) >= 0
      || user.name.last_name.toLowerCase().indexOf(filterValue) >= 0
      || user.email.toLowerCase().indexOf(filterValue) >= 0;
     });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  updateAvailableUsers(access: TNoteAccess) {
    const addedGids: Array<string> = Object.keys(access);

    this.availableUsers = this.data.users.filter((user: User) => {
      return addedGids.indexOf(user.gid) === -1;
    });
  }

  addUser(selectedUserGid: string): boolean {
    const selectedUser: User|null = this.data.users.find((user: User) => {
      return user.gid === selectedUserGid
    });

    if(selectedUser === null) {
      console.error("Selected user was not found. That's weird.");
      return false;
    }

    this.data.access[selectedUserGid] = {
      user: {
        email: selectedUser.email,
        name: selectedUser.name
      },
      can_read: true,
      can_write: true,
      can_share: false,
      can_leave: true,
      can_change_permissions: false
    };

    this.updateAvailableUsers(this.data.access);
    this.userAutocomplete.setValue('');
    return true;
  }

  removeUser(selectedUserGid: string) {
    delete this.data.access[selectedUserGid];

    this.updateAvailableUsers(this.data.access);

    return true;
  }

  public isRemoveAvailable(accessUserGid: string, access: TNoteAccess): boolean {
    if(Object.keys(this.data.access).length === 1) {
      return false;
    }

    if(this.data.myAccess.can_change_permissions !== true
    || (accessUserGid === this.data.myGid
        && access.can_leave !== true)) {
      return false;
    }

    return true;
  }

  public isCanChangePermissionsAvailable(accessUserGid: string, access: TNoteAccess): boolean {
    if(this.data.myAccess.can_change_permissions !== true) {
      return false;
    }

    const accessWithPermissionChangeTrue: Array<{}> = Object.values(this.data.access).filter((permission: TNoteAccessPermissions): boolean => {
      return permission.can_change_permissions === true
    });

    if(accessWithPermissionChangeTrue.length === 1 && access.can_change_permissions === true) {
      return false;
    }

    return true;
  }
}
