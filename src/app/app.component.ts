import { ValidationErrors } from '@angular/forms';
import { Component, OnInit, ViewChild, Injectable, ElementRef, AfterViewInit, Input } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerConfig, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, Validator } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent, ColDef, GridReadyEvent, ICellRendererParams, RowNodeTransaction
} from 'ag-grid-community';
import { catchError, EMPTY, finalize, Observable, of, switchMap, tap } from 'rxjs';

import { DeleteButtonRenderComponent } from './render/delete-button-render/delete-button-render.component';
import { HeroService } from './hero.service';
import { Hero } from 'src/model/hero';
import { NameValidationService } from './namevalidation.service';
import { formatDate } from '@angular/common';
import { maxDateValidator } from './maxdatevalidator';
import { ConfirmationDialogService } from './confirmation-dialog.service';

//set init date for NgbDatePicker:(yyyy-mm-dd)
//https://stackblitz.com/edit/angular-64knsp-pxsm3y?file=app%2Fdatepicker-adapter.ts
@Injectable()
export class CustomDateAdapter {
  fromModel(value: string): any {
    if (!value) return null;
    let parts = value.split('-');
    return {
      year: +parts[0],
      month: +parts[1],
      day: +parts[2]
    } as NgbDateStruct;
  }

  toModel(
    date: NgbDateStruct
  ): string | null { // from internal model -> your mode
    return date
      ? date.year +
      '-' +
      ('0' + date.month).slice(-2) +
      '-' +
      ('0' + date.day).slice(-2)
      : null;
  }
}
@Injectable()
export class CustomDateParserFormatter {
  parse(value: string): string | null | NgbDateStruct {
    if (!value) return null;
    let parts = value.split('-');
    return {
      year: +parts[0],
      month: +parts[1],
      day: +parts[2]
    } as NgbDateStruct;
  }
  format(date: NgbDateStruct): string | null {
    return date
      ? date.year +
      '-' +
      ('0' + date.month).slice(-2) +
      '-' +
      ('0' + date.day).slice(-2)
      : null;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomDateAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('birthdayDatepicker')
  private datePicker!: ElementRef;
  title = 'My heroes';
  todayStr: string = this.transDateToDateStr(new Date());
  heroForm!: FormGroup;
  regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
  isAddingHero: boolean = false;

  levelList: string[] = ['0', '1', '2', '3', '4', '5'];

  public components = {
    buttonRenderer: DeleteButtonRenderComponent,
  };

  constructor(private heroService: HeroService,
    private fb: FormBuilder,
    private parserFormatter: NgbDateParserFormatter,
    private ngbDatepickerConfig: NgbDatepickerConfig,
    private nameValidationService: NameValidationService,
    private confirmationDialogService: ConfirmationDialogService) {
    const today = new Date();
    this.ngbDatepickerConfig.maxDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    }
  }

  ngOnInit(): void {
    this.heroForm = this.fb.group({
      name: ['',
        {
          validators: [Validators.required],
          asyncValidators: [this.nameValidationService.heroNameValidator()],
          updateOn: 'blur'//焦點移再驗證
        }
      ],
      level: '0',
      birthday: [this.todayStr, [Validators.pattern(this.regex_date), maxDateValidator()]]
    });
  }

  //取得FormControl名稱
  get name(): FormControl {
    return this.heroForm.get('name') as FormControl;
  }

  get level(): FormControl {
    return this.heroForm.get('level') as FormControl;
  }

  get birthday(): FormControl {
    return this.heroForm.get('birthday') as FormControl;
  }

  public columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'name', cellStyle: { textAlign: 'left' } },
    { field: 'level' },
    {
      field: 'birthday', // Your date field
      cellRenderer: this.customDateFormat.bind(this),

    },
    {
      field: 'Link',
      cellRenderer: (params: ICellRendererParams) => {
        return `<a href="javascript:void(0)">Link</a>`
      }
    },
    {
      field: 'Delete',
      cellRenderer: 'buttonRenderer',
      cellRendererParams: {
        onClick: this.onDeleteBtnClick.bind(this),
        buttonLabel: 'X'
      }
    }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    cellStyle: { textAlign: 'center' }

  };

  // Data that gets displayed in the grid
  public rowData$!: Observable<Hero[]>;

  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  // Example load data from server
  onGridReady(params: GridReadyEvent) {
    this.rowData$ = this.heroService.getHeroes();
  }

  // Example of consuming Grid Event
  // onCellClicked(e: CellClickedEvent): void {
  //   console.log('cellClicked', e);
  // }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }

  //birthday轉換顯示格式
  customDateFormat(params: ICellRendererParams) {
    return new Date(params.value).toISOString();
  }

  //轉Date()為yyyy-mm-dd
  transDateToDateStr(dateObject: Date): string {
    const date = dateObject.getDate() < 10 ? dateObject.getDate().toString().padStart(2, '0') : dateObject.getDate().toString();
    const month = dateObject.getMonth() + 1 < 10 ? (dateObject.getMonth() + 1).toString().padStart(2, '0') : (dateObject.getMonth() + 1).toString();
    const year = dateObject.getFullYear().toString();  //2023

    return year + '-' + month + '-' + date;
  }

  //自訂義Delete Button事件
  onDeleteBtnClick(eventParm: any) {
    //Confirm確認刪除?
    this.confirmationDialogService.confirm('Are you sure?', `Delete this Hero: ${eventParm.rowData.name}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.heroService.deleteHero(eventParm.rowData.id).pipe(
            switchMap(data => {
              //刪除後回傳的data會是空的Object
              if (!data) {
                return this.heroService.getHeroes();
              } else {
                return EMPTY;//直接結束
              }
            }),
            catchError(error => {
              console.log('error: ' + error);
              return of(error);
            })
          ).subscribe(data => {
            this.agGrid.api.setRowData(data);
          })
        }
      })
      .catch(() => console.log(`Just Close`));
  }

  //新增Hero
  addHero(hero: Hero) {
    this.isAddingHero = true;

    this.heroService.addHero(hero)
      .pipe(
        switchMap(data => {
          if (data) {
            return this.heroService.getHeroes();
          } else {
            console.log('empty');
            return EMPTY;
          }
        }),
        catchError(error => {
          console.log('error: ' + error);
          return of(error);
        }),
        finalize(() => {
          this.isAddingHero = false;
        })
      ).subscribe(data => {
        this.heroForm.reset({
          name: '',
          level: '0',
          birthday: this.todayStr
        });
        this.agGrid.api.setRowData(data);
      }
      );
  }


  //heroForm Submit
  onSubmit() {
    if (this.heroForm.valid) {
      const hero = {
        name: this.heroForm.value.name,
        level: this.heroForm.value.level.toString(),
        birthday: this.heroForm.value.birthday
      } as Hero;
      this.isAddingHero = true;
      this.addHero(hero);
    }
    else {
      //取有錯誤的欄位
      const invalid = [];
      const controls = this.heroForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
        const errors = controls[name].errors;
        console.log('errors:', errors);
      }
      console.log('invalid Controls:', invalid.join(','));
      console.log('invalid Form:', this.heroForm.value);
    }
  }

  // transNgbDate2ValidDateFormat(nbgDate: NgbDate) {
  //   let year = nbgDate.year;
  //   let month = nbgDate.month <= 9 ? '0' + nbgDate.month : nbgDate.month;;
  //   let day = nbgDate.day <= 9 ? '0' + nbgDate.day : nbgDate.day;;
  //   return year + "-" + month + "-" + day;
  // }

  // open() {
  //   //Prevent ng-bootstrap modal closure by clicking outside or using ESC key
  //   const modalRef = this.modalService.open(NgbModalContent, { keyboard: false, backdrop: 'static' });//content, {keyboard: false}
  //   modalRef.componentInstance.message = 'World';
  // }
}

//bootstrap module alert
// @Component({
//   selector: 'ngb-modal-content',
//   standalone: true,
//   template: `
// 		<div class="modal-header bg-warning text-white">
// 			<h4 class="modal-title">{{title}}</h4>
// 			<button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
// 		</div>
// 		<div class="modal-body">
// 			<p>{{ message }}!</p>
// 		</div>
// 		<div class="modal-footer">
// 			<button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
// 		</div>
// 	`,
// })
// export class NgbModalContent {
//   @Input() title: string = 'Title';
//   @Input() message: string = '';


//   constructor(public activeModal: NgbActiveModal) { }
// }
