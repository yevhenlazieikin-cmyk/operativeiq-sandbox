const BUILD_NUMBER_KEY = 'build_number';

export interface BuildNumberInterface {
  buildNumber: string;
}

export class BuildDetails {
  private buildNumber: string | undefined;

  public setBuildNumber(value: string): void {
    this.buildNumber = value;
    this.setCookie(BUILD_NUMBER_KEY, value, 400);
  }

  public getBuildNumber(): string {
    return this.getCookie(BUILD_NUMBER_KEY) || '';
  }

  private setCookie(name: string, value: string, days: number) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
  }

  private getCookie(name: string) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }
}
