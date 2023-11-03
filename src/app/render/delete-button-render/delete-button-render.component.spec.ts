import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteButtonRenderComponent } from './delete-button-render.component';

describe('DeleteButtonRenderComponent', () => {
  let component: DeleteButtonRenderComponent;
  let fixture: ComponentFixture<DeleteButtonRenderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteButtonRenderComponent]
    });
    fixture = TestBed.createComponent(DeleteButtonRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
