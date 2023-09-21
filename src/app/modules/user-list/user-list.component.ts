import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserListService} from "./services/user-list.service";
import {Subscription} from "rxjs";
import {UserModel} from "./models/User.model";
import {Router} from "@angular/router";
import {MessageService} from "../../services/app-message.service";
import {MatDialog} from "@angular/material/dialog";
import {
  CreateUserDialogFormComponent
} from "../../components/create-user-dialog-form/create-user-dialog-form.component";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  subscription = new Subscription();
  list: UserModel[] = [];
  error_message = 'Ошибка сервера';

  constructor(private userService: UserListService,
              private messageService: MessageService,
              public dialog: MatDialog,
              private router: Router) { }

  ngOnInit(): void {
    this.subscription.add(this.userService.getUserList().subscribe({
        next: value => {
          this.list = value;
        },
        error: err => {
          this.messageService.sendMessage({
            message: `${this.error_message}`,
            type: 'error'
          });
          this.router.navigate(['/404']).then();
        },
        complete: () => {
        },
      }
    ));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createUser(user?: UserModel): void {
    const dialogRef = this.dialog.open(CreateUserDialogFormComponent, {
      panelClass: 'request-form-dialog-panel',
      backdropClass: 'request-form-dialog-backdrop',
      data: {
        user: user
      }
    });
    let backdrop = false;
    dialogRef.backdropClick().subscribe(() => {
      backdrop = true;
    })
    dialogRef.afterClosed().subscribe((d) => {
      if (!backdrop) {
      }
    })

    dialogRef.componentInstance.closeDialog.subscribe(() => {
      dialogRef.close();
    });
    dialogRef.componentInstance.saveDialog.subscribe((data: any) => {
      if (data) {
        if (data.edit) {
          this.messageService.sendMessage({
            message: `Пользователь успешно отредактирован`,
            type: 'success'
          });
          this.list.map(user => {
            if (user.id === data.user.id) {
              user.user_type = data.user.type === 1 ? 'Admin' : 'Drive';
              user.username = data.user.username;
              user.first_name = data.user.first_name;
              user.last_name = data.user.last_name;
              user.email = data.user.email;
              user.password = data.user.password;
            }
            return user;
          })
        } else {
          this.messageService.sendMessage({
            message: `Пользователь успешно создан`,
            type: 'success'
          });
          this.list.push(new UserModel(data.user));
        }
      }
      dialogRef.close();
    });
  }

  operation(operator: string, index: number, user?: UserModel): void {
    switch (operator) {
      case 'edit':
        this.createUser(user);
        break;
      case 'delete':
        this.list.splice(index, 1);
        this.messageService.sendMessage({
          message: `Пользователь удалён`,
          type: 'success'
        });
        break;
    }
  }
}
