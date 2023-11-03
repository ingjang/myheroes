import { Injectable } from '@angular/core';
import { Hero } from 'src/model/hero';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {

  constructor() { }

  createDb() {
    const heroes = [
      { id: 12, name: 'Dr. Nice', level: '0', birthday: '2022-10-25' },
      { id: 13, name: 'RubberMan', level: '1', birthday: '2023-02-05' },
      { id: 14, name: 'Dr. IQ', level: '0', birthday: '2021-01-24' },
      { id: 15, name: 'Magma', level: '4', birthday: '2021-05-07' },
      { id: 16, name: 'Tornado', level: '2', birthday: '2023-08-10' }
    ];
    return { heroes };
  }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(heroes: Hero[]): number {
    return heroes.length > 0 ? Math.max(...heroes.map(hero => hero.id)) + 1 : 11;
  }
}
