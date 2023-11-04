import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private modalService: NgbModal) { }

  open(message: string, title = 'Message') {

    const modalRef = this.modalService.open(MessageDialogComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;

    return modalRef.result;
  }
}
