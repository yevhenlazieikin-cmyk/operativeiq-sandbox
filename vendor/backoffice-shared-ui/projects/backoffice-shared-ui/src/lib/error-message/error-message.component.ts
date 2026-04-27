import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'bo-error-message',
  imports: [NgClass],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  public readonly errorMessage = input.required<string>();
  public readonly displayLower = input<string | undefined>('');
}
