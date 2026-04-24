import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SiteInfo } from '../header/site-info.interface';

@Component({
  selector: 'bo-footer',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  public siteInfo = input<SiteInfo | null>(null);

  public footerText = computed(() => {
    const info = this.siteInfo();
    if (!info) {
      return `We 💙 EMS Technology Solutions - © ${new Date().getFullYear()} EMS Technology Solutions, LLC`;
    }

    let text = info.FooterMessage;
    if (info.LastLoginInfo) {
      text += `, Last Login: ${info.LastLoginInfo}`;
    }

    return text;
  });
}
