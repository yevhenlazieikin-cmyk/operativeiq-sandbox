import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackofficeSharedUi } from './backoffice-shared-ui';

describe('BackofficeSharedUi', () => {
  let component: BackofficeSharedUi;
  let fixture: ComponentFixture<BackofficeSharedUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackofficeSharedUi]
    }).compileComponents();

    fixture = TestBed.createComponent(BackofficeSharedUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
