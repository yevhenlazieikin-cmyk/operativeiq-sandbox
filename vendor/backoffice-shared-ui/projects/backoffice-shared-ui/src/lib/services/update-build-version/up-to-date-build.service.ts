import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { BuildDetailsService } from '@backoffice/shared-ui/lib/services/update-build-version/build-details.service';
import { BuildNumberInterface } from '@backoffice/shared-ui/lib/services/update-build-version/build-details';

@Injectable({ providedIn: 'root' })
export class UpToDateBuildService {
  private readonly buildNumberAtStartup: string;
  private readonly buildDetailsService = inject(BuildDetailsService);
  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.buildNumberAtStartup = this.buildDetailsService.buildDetails.getBuildNumber();
  }

  public pollForBuildNumber(src = 'assets/build-details.json') {
    const httpOptions = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache'
      })
    };

    return this.httpClient.get<BuildNumberInterface>(src, httpOptions).pipe(
      map(response => {
        const newBuildNumber = response.buildNumber;

        if (this.buildNumberAtStartup === '' && this.buildDetailsService.buildDetails.getBuildNumber() === '') {
          this.buildDetailsService.buildDetails.setBuildNumber(newBuildNumber);

          return null;
        }

        return this.buildDetailsService.buildDetails.getBuildNumber() === newBuildNumber ? null : newBuildNumber;
      })
    );
  }
}
