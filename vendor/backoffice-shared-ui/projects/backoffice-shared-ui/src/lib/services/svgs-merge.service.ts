import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { svgs } from '../../../assets/images/icon';

@Injectable({
  providedIn: 'root'
})
export class SvgsMergeService {
  private readonly _svgs = new BehaviorSubject<Record<string, string>>(svgs);

  public get svgs() {
    return this._svgs.value;
  }

  public set svgs(additionalSvgs: Record<string, string>) {
    this._svgs.next({ ...this._svgs.value, ...additionalSvgs });
  }
}
