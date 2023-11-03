import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const currentDate = new Date(new Date().toLocaleDateString());
    // 設定輸入日期和目前日期的時間部分為相同(只比較日期部分)
    inputDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    if (inputDate <= currentDate) {
      return null;
    } else {
      return { maxDate: true };
    }
  };
}
