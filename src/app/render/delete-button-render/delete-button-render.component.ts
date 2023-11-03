import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
  selector: 'app-delete-button-render',
  template: `
    <button type="button" class="btn text-danger mb-1" (click)="onClick($event)">{{buttonLabel}}</button>
    `,
  styles: ['button { color:red }']
})
export class DeleteButtonRenderComponent implements ICellRendererAngularComp {
  params!: any;
  buttonLabel!: string;

  agInit(params: any): void {
    this.params = params;
    this.buttonLabel = this.params.buttonLabel || null;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: any) {
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: $event,
        rowData: this.params.node.data
      }
      this.params.onClick(params);

    }
  }
}
