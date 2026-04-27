import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'lib-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  private readonly loaderService = inject(LoaderService);

  public readonly bars = Array(12).fill(0);
  public readonly isLoading$ = this.loaderService.isLoading$;
}
