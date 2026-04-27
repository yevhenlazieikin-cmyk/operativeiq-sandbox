import { Pipe, PipeTransform } from '@angular/core';
import { MainRow, MobTileOptions } from '../models';

@Pipe({
  name: 'setClassFromTemplatePipe',
  standalone: false
})
export class SetClassFromTemplatePipe implements PipeTransform {
  public transform(
    event: any,
    desktopProps?: { row: any; cell: MainRow; subItem: any } | null,
    mobileProps?: { query: string; options: MobTileOptions; rowKey?: string } | null
  ): any {
    // const { row, cell, subItem } = desktopProps ?? {};
    // const { query, options, rowKey } = mobileProps ?? {};

    const classList: any = {}; // TODO set type or escape warning

    if ((desktopProps?.row && desktopProps.cell) || (desktopProps?.cell && desktopProps.subItem)) {
      if (desktopProps.cell.classList) {
        desktopProps.cell.classList.forEach((item: string) => {
          classList[item] = true;
        });
      }

      if (!desktopProps.cell.classCondition) {
        return classList;
      }

      Object.keys(desktopProps.cell.classCondition).forEach(key => {
        classList[key] = desktopProps.cell.classCondition![key](desktopProps.row, desktopProps.subItem, desktopProps.cell.key);
      });
    } else if (mobileProps?.query && mobileProps.options) {
      // @ts-expect-error can show ts error
      if (mobileProps.options[mobileProps.query].classList) {
        // @ts-expect-error can show ts error
        mobileProps.options[mobileProps.query].classList.forEach((el: string) => {
          classList[el] = true;
        });
      }
      // @ts-expect-error can show ts error
      if (mobileProps.options[mobileProps.query]?.length) {
        // @ts-expect-error can show ts error
        mobileProps.options[mobileProps.query].forEach((item: any) => {
          if (item.classCondition && item.key === mobileProps.rowKey) {
            Object.keys(item.classCondition).forEach(key => {
              classList[key] = item.classCondition[key](mobileProps.options.row, mobileProps.options.row, mobileProps.rowKey);
            });
          }

          if (item.classList && item.key === mobileProps.rowKey) {
            item.classList.forEach((el: string) => {
              classList[el] = true;
            });
          }
        });
        // @ts-expect-error can show ts error
      } else if (!mobileProps.options[mobileProps.query]?.classCondition) {
        return classList;
      } else {
        // @ts-expect-error can show ts error
        Object.keys(mobileProps.options[mobileProps.query]?.classCondition).forEach(key => {
          // @ts-expect-error can show ts error
          classList[key] = mobileProps.options[mobileProps.query].classCondition[key](mobileProps.options.row);
        });
      }
    }

    return classList;
  }
}
