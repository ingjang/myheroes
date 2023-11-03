import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, catchError } from 'rxjs/operators';
import { HeroService } from './hero.service';

@Injectable({
  providedIn: 'root'
})
export class NameValidationService {

  constructor(private heroService: HeroService) { }

  heroNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const heroName = control.value;
      if (!heroName)
        return of(null)
      else {
        return this.heroService.getHeroes()
          .pipe(
            debounceTime(300),
            map(heroes => {
              const hero = heroes.find(h => h.name.toLocaleLowerCase() === heroName.toLocaleLowerCase());
              return hero ? { 'HeroNameExists': true } : null;
            }),
            catchError(() => of(null))
          );
      }
    };
  }
}
