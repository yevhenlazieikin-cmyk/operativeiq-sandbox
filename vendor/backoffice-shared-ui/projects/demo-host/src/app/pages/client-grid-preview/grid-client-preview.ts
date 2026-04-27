import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  DestroyRef,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, forkJoin, Observable, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { EmsTimeZone } from '../server-grid-preview/grid-preview';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, finalize, map } from 'rxjs/operators';
import { GridModule } from '@backoffice/shared-ui';
import { FilterData, GridCell } from '@backoffice/shared-ui/lib/grid/models';
import { FilterFieldTypeEnum, GridCellType, MobGridTileType } from '@backoffice/shared-ui/lib/grid/enum';

interface Form {
  division: FormControl<number>;
  type: FormControl<any>;
  unit?: FormControl<number>;
  crew?: FormControl<number>;
}

enum searchEnum {
  kitId = 'kitId',
  kitType = 'kitType',
  checkedOutDate = 'checkedOutDate',
  checkedOutBy = 'checkedOutBy',
  seal = 'seal'
}

enum searchSelectKitEnum {
  kitId = 'kitId',
  kitType = 'kitType'
}

enum checkoutKitTypeSearchEnum {
  kitType = 'kitType'
}

enum checkoutKitSearchEnum {
  kitId = 'kitId'
}

@Component({
  selector: 'app-client-server-grid-preview',
  templateUrl: 'grid-client-preview.html',
  styleUrls: ['grid-client-preview.scss'],
  imports: [CommonModule, GridModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientGridPreviewComponent implements OnInit, OnDestroy {
  @ViewChild('menuTempl', { static: true }) public menuTempl!: TemplateRef<any>;
  @ViewChild('contextMenu') public contextMenu!: ElementRef;
  @ViewChild('dueBackTemplRef') public dueBackTemplRef!: TemplateRef<any>;
  @ViewChild('appBarCodeSearch', { static: false }) public appBarCodeSearch!: any; // BarCodeSearchComponent;

  public checkedOutKits = [];
  mock = [
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: '1 page',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '2 page',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: 'New Kit T',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: 'New Kit T',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: 'New Kit T',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: 'New Kit T',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DааcccccccаааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-40b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввvdfvdfvdfvівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '67aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsddfvdfvdwsedwedwcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DаааааDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a1ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Attаааввівуцауцa'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e361a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C Asdcsdcsdcdscsdc B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7437e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '691a7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 65,
      kitType: "Atta'ch Kit",
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7a15-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 73,
      kitType: 'C A B kit - track id 2',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69qa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 146,
      kitType: 'Olga_test',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7fd7e661a7b5'
    },
    {
      kitTypeId: 232,
      kitType: '568878',
      kitId: 'fff1',
      checkedOutDate: '09/11/2025 08:07:07 PM EET',
      checkedOutBy: 'Hyrych, Anna',
      seal: '1111',
      sealRequired: true,
      missingKit: false,
      uniqueId: 'z9aa7ac5-4512-49b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8216,
        kitFk: 2295,
        kitId: 'fff1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 76,
        toUnitId: 472,
        checkOutDate: '2025-09-11T13:07:07.103',
        checkOutPeformedBy: 3970,
        lastModificationTime: '2025-09-11T13:07:07.103',
        lastModifiedBy: 3970,
        checkOutLoadId: '9574eff2-38c2-410b-bbd0-b5d271c9c643',
        createdBy: 3970,
        modifiedBy: 3970,
        createdTime: '2025-09-11T13:07:07.103',
        uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7b5'
      },
      originalCheckoutDate: '09/11/2025 08:07:07 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bz'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'r9aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '69aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      kitId: 'dk3',
      checkedOutDate: '06/02/2025 11:55:29 PM EET',
      checkedOutBy: 'Martin, Laura',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-4fbd-7f37e661a7b5',
      checkOut: {
        id: 7849,
        kitFk: 1885,
        kitId: 'dk3',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 137,
        toUnitId: 704,
        checkOutDate: '2025-06-02T16:55:29.75',
        checkOutPeformedBy: 1625,
        lastModificationTime: '2025-06-02T16:55:29.75',
        lastModifiedBy: 1625,
        checkOutLoadId: '7f74e3d6-676e-4c2f-803a-6e597b54bb72',
        createdBy: 1625,
        modifiedBy: 1625,
        createdTime: '2025-06-02T16:55:29.75',
        uniqueId: 'defe9199-0b82-4ced-b4bb-da5bbc0565dd'
      },
      originalCheckoutDate: '06/02/2025 11:55:29 PM'
    },
    {
      kitTypeId: 255,
      kitType: 'New Kit T',
      kitId: 'kt1',
      checkedOutDate: '08/05/2025 09:58:03 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: '',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-59b1-afbd-7f37e661a7b5',
      checkOut: {
        id: 8022,
        kitFk: 2279,
        kitId: 'kt1',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 249,
        toUnitId: 704,
        checkOutDate: '2025-08-05T14:58:03.407',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T14:58:03.407',
        lastModifiedBy: 1633,
        checkOutLoadId: '42d3a7a8-413b-41e0-9936-d9e4f9e07be4',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T14:58:03.407',
        uniqueId: 'fefa3c5b-ca94-41b4-b4c9-61b375a1368f'
      },
      originalCheckoutDate: '08/05/2025 09:58:03 PM'
    },
    {
      kitTypeId: 214,
      kitType: '67899',
      kitId: 'bpvmf2',
      checkedOutDate: '08/05/2025 10:19:09 PM EET',
      checkedOutBy: 'Kuhivchak, Diana',
      seal: 'seal',
      sealRequired: true,
      missingKit: false,
      uniqueId: '69aa7ac5-4512-49b1-afb6-7f37e661a7b5',
      checkOut: {
        id: 8025,
        kitFk: 2229,
        kitId: 'bpvmf2',
        originalQuantity: 1,
        currentQuantity: 1,
        fromRoomId: 92,
        toUnitId: 704,
        checkOutDate: '2025-08-05T15:19:09.937',
        checkOutPeformedBy: 1633,
        lastModificationTime: '2025-08-05T15:19:09.937',
        lastModifiedBy: 1633,
        checkOutLoadId: '9851de0e-4553-4fb0-9629-57302cd8dc46',
        createdBy: 1633,
        modifiedBy: 1633,
        createdTime: '2025-08-05T15:19:09.937',
        uniqueId: '3bf9dfb6-f1dd-48fd-86ea-9c4c394f280a'
      },
      originalCheckoutDate: '08/05/2025 10:19:09 PM'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '19aa7ac5-4512-49b1-afbd-7f37e661a7bd'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '29aa7ac5-4512-49b1-afbd-7f37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '39aa7ac5-4512-49b1-afbd-7f37e66ta7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '49aa7ac5-4512-49b1-afbd-7f37e6b1a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '59aa7ac5-4512-49b1-afbd-vf37e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '79aa7ac5-4512-49b1-afbd-7f38e661a7b5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '89aa7ac5-4512-49b1-afbd-7f37e661a7t5'
    },
    {
      kitTypeId: 186,
      kitType: '<DDK>',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: '99aa7ac5-4512-49b1-a1bd-7f37e661a7b5'
    },
    {
      kitTypeId: 169,
      kitType: '66',
      missingKit: true,
      sealRequired: false,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'k9aa7ac5-4512-49b1-2fbd-7f37e661a7b5'
    },
    {
      kitTypeId: 62,
      kitType: 'aspirin',
      missingKit: true,
      sealRequired: true,
      originalCheckoutDate: '',
      checkedOutDate: '',
      uniqueId: 'j9aa7ac5-4512-49b1-3fbd-7f37e661a7b5'
    }
  ] as any;

  public allCheckedOutKits = [];
  public form!: FormGroup<Form>;
  public desktop!: boolean;
  public title = 'Check Out/In';
  public subtitle = 'Kits';
  public submitFormEvent: Subject<any> = new Subject<any>();
  public divisionKey = 'rfid-division';
  // public numericParser = numericParser;
  public search = '';
  // public checkOutKitType = CheckOutKitType;
  public crew!: any;
  public isEntityFound$ = new BehaviorSubject<{ isFound: boolean } | null>(null);
  public clickDisabled = false;
  public searchEnum = searchEnum;
  public divisions$!: Observable<{ id: number; value: string }[]>;
  public allowAssetsForFleetOnlyUnits!: boolean;
  public timeZone!: EmsTimeZone;
  public defaultTimeZone!: EmsTimeZone;
  public dateFormat!: string;
  public types$ = of([
    {
      id: 1,
      value: 'Unit'
    },
    {
      id: 2,
      value: 'Crew'
    }
  ]);
  public crews$ = new BehaviorSubject<{ id: number; value: string }[]>([]);

  public units!: { id: number; value: string }[];
  public crews!: { id: number; value: string }[];

  public filtersApplied$ = new BehaviorSubject<boolean>(false);
  public selectKiTypeDialogRef!: any; // MatDialogRef<BaseSelectEntityDialogComponent<any>, BaseSelectEntityContext<any>>;
  public selectKitDialogRef!: any; // MatDialogRef<BaseSelectEntityDialogComponent<any>, BaseSelectEntityContext<any>>;
  public currentKitType: any | null = null;
  public currentKit = null;
  public doubleClick = false;
  public searchCompareProp = 'uniqueId';
  public orderEvent: Subject<any> = new Subject<any>();
  public selectOptions = [
    {
      value: 'save',
      id: 'save'
    },
    {
      value: 'apply',
      id: 'apply'
    },
    {
      value: 'discard',
      id: 'discard'
    },
    {
      value: 'submit',
      id: 'submit'
    },
    {
      value: 'sort',
      id: 'sort'
    },
    {
      value: 'default',
      id: 'default'
    }
  ];
  public kitsFilterData: FilterData = {
    filterHeader: 'Filter Kits',
    sortOptions: {
      default: {
        key: 'kitId,kitType',
        direction: 'asc,desc' //multiple sorting directions: direction[index] equals to of the key[index], if there less directions than keys are passed, all keys without direction would have the last direction
      }
    },
    inputs: [
      {
        label: 'Kit Name/Description',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitType',
        hasSorting: true,
        dataType: 'string',
        style: { width: '18%', color: 'red' }
      },
      {
        label: 'Kit ID',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitId',
        hasSorting: true,
        placeholder: 'Some Placeholder',
        dataType: 'string',
        style: { width: '18%' }
      },
      {
        label: 'Checked Out',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'checkedOutDate',
        hasSorting: true,
        dataType: 'string',
        customSortHeading: 'originalCheckoutDate',
        customSortDataType: 'date',
        style: { width: '18%' }
      },
      {
        label: 'Supervisor',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'checkedOutBy',
        hasSorting: true,
        dataType: 'string',
        style: { width: '18%' }
      },
      {
        label: 'Seal',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'seal',
        hasSorting: true,
        dataType: 'string',
        style: { width: '18%' }
      },
      {
        label: 'Multi Select',
        type: FilterFieldTypeEnum.Select,
        multiple: true,
        options: this.selectOptions,
        value: '',
        name: 'actionMenu',
        hasSorting: false,
        dataType: 'string',
        style: { width: '18%' }
      }
    ],
    mobSearch: ''
  };
  public kitsCellSchema: GridCell = {
    mainRow: [
      {
        type: GridCellType.readonlyText,
        key: 'kitType',
        classList: ['semi-bold-font'],
        mobView: {
          type: MobGridTileType.mainTitle
        }
      },
      {
        type: GridCellType.conditionalType,
        key: 'kitId',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeCondition: row => !row.missingKit,
        conditionTypes: {
          trueCondition: GridCellType.readonlyText,
          falseCondition: GridCellType.editText
        },
        classCondition: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          'field-error': row => row.failed,
          'field-success': row => row.success,
          'semi-bold-font': row => !row.missingKit && !this.desktop
        },
        searchCB: (row, _, e) => this.searchKit(row, e),
        disableCondition: () => this.clickDisabled,
        condition: () => true,
        placeholder: 'Search by Kit ID',
        iconName: 'search',
        mobView: {
          type: MobGridTileType.subTitle,
          order: 1,
          conditionTypes: {
            trueCondition: MobGridTileType.subTitle,
            falseCondition: MobGridTileType.editableRow
          }
        }
      },
      {
        type: GridCellType.readonlyText,
        key: 'checkedOutDate',
        classCondition: {
          'empty-item': row => !row?.checkedOutDate
        },
        mobView: {
          type: MobGridTileType.labelValue,
          mobDef: 'Checked Out',
          order: 1
        }
      },
      {
        type: GridCellType.readonlyText,
        key: 'checkedOutBy',
        classCondition: {
          'empty-item': row => !row?.checkedOutBy
        },
        mobView: {
          type: MobGridTileType.labelValue,
          mobDef: 'Supervisor',
          order: 2
        }
      },
      {
        type: GridCellType.readonlyText,
        key: 'seal',
        classCondition: {
          'empty-item': row => !row?.seal
        },
        mobView: {
          type: MobGridTileType.labelValue,
          mobDef: 'Seal',
          order: 3
        }
      },
      {
        type: GridCellType.customView,
        key: 'actionMenu',
        style: {
          position: 'relative'
        },
        mobView: {
          type: MobGridTileType.rightAlignText
        }
      }
    ]
  };
  public selectKitFilterData: FilterData = {
    filterHeader: 'Filter Kits',
    sortOptions: {
      default: {
        key: 'kitType',
        direction: 'asc'
      }
    },
    inputs: [
      {
        label: 'Kit ID',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitId',
        hasSorting: true,
        dataType: 'string',
        style: { width: '50%' }
      },
      {
        label: 'Kit',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitType',
        hasSorting: true,
        dataType: 'string',
        style: { width: '50%' }
      }
    ],
    mobSearch: ''
  };
  public selectKitCellSchema: GridCell = {
    mainRow: [
      {
        type: GridCellType.checkboxText,
        key: 'kitId',
        mobView: {
          type: MobGridTileType.subTitle,
          order: 1,
          mobDef: 'Kit ID'
        },
        changeCB: () => {}
      },
      {
        type: GridCellType.readonlyText,
        key: 'kitType',
        classList: ['semi-bold-font'],
        mobView: {
          type: MobGridTileType.mainTitle,
          order: 2,
          mobDef: 'Kit'
        }
      }
    ]
  };
  public kitTypeFilterData: FilterData = {
    filterHeader: 'Filter Kit Types',
    sortOptions: {
      default: {
        key: 'kitType',
        direction: 'asc'
      }
    },
    inputs: [
      {
        label: 'Kit Type',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitType',
        hasSorting: true,
        dataType: 'string',
        style: { width: '100%' }
      }
    ],
    mobSearch: ''
  };
  public kitTypeCellSchema: GridCell = {
    onClick: {
      onClickCB: item => this.onItemClicked('kitType', item),
      condition: () => true,
      allRowClickable: true
    },
    mainRow: [
      {
        type: GridCellType.readonlyText,
        key: 'kitType',
        classList: ['semi-bold-font'],
        mobView: {
          type: MobGridTileType.mainTitle
        }
      }
    ]
  };
  public kitFilterData: FilterData = {
    filterHeader: 'Filter Kits',
    sortOptions: {
      default: {
        key: 'kitId',
        direction: 'asc'
      }
    },
    inputs: [
      {
        label: 'Kit',
        type: FilterFieldTypeEnum.Input,
        value: '',
        name: 'kitId',
        hasSorting: true,
        dataType: 'string',
        style: { width: '100%' }
      }
    ],
    mobSearch: ''
  };
  public kitCellSchema: GridCell = {
    onClick: {
      onClickCB: item => this.onItemClicked('kit', item),
      condition: () => true,
      allRowClickable: true
    },
    mainRow: [
      {
        type: GridCellType.readonlyText,
        key: 'kitId',
        classList: ['semi-bold-font'],
        mobView: {
          type: MobGridTileType.mainTitle
        }
      }
    ]
  };

  private readonly _destroy$ = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dialog = inject(MatDialog);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private _divisions!: { id: number; value: string }[];
  private readonly _crews!: { id: number; value: string }[];
  public kitIdValue = '';

  private readonly kitTransferCheckedInSubscription!: Subscription;
  private readonly kitTransferErrorSubscription!: Subscription;

  public ngOnInit(): void {
    const kitMenuCell = this.kitsCellSchema.mainRow.find(item => item.key === 'actionMenu');
    if (kitMenuCell) {
      kitMenuCell.content = this.menuTempl;
    }

    this.timeZone = this.defaultTimeZone;

    this.checkedOutKits = this.mock;
  }

  public ngOnDestroy(): void {
    this.kitTransferCheckedInSubscription?.unsubscribe();
    this.kitTransferErrorSubscription?.unsubscribe();
  }

  public searchKit(row: any, e = null): void {
    // @ts-expect-error for testing
    e?.target?.blur();
    if (!row.kitId || !row.kitTypeId) {
      return;
    }

    row.kitId = '';
  }

  public onFiltersChanged(data: FilterData): void {
    const filtersApplied = data.inputs.some(filter => !filter.value);
    this.filtersApplied$.next(filtersApplied);
  }

  public onItemClicked(type: 'kit' | 'kitType', item: any): void {
    if (type === 'kitType') {
      this.selectKiTypeDialogRef.close();
      this.currentKitType = item;
    }
    if (type === 'kit') {
      this.selectKitDialogRef.close();
      this.currentKit = item;
    }
  }

  private _createForm(): void {
    // @ts-expect-error some error
    this.form = this._fb.group({
      division: new FormControl(null, [Validators.required]),
      type: new FormControl({ value: null, disabled: true }, [Validators.required])
    }) as FormGroup<Form>;
  }

  private _getDivisions(): void {
    // @ts-expect-error some error
    this.divisions$ = this._queryHelperService.getCrewDivisionsObservable(this.crew).pipe(
      map((data: any) => data.map((division: any) => ({ id: division.id, value: division.divisionName }))),
      tap((data: any) => {
        this._divisions = data;
        if (data.length === 1) {
          this.form.controls.division.setValue(data[0].id);
        } else {
          this._setFormValue('division');
        }
      })
    );
  }

  private _setFormValue(field: string): void {
    if (field === 'division' && this._divisions.length) {
      const division = this._divisions.find(item => item.id === window.history.state.data?.formData.division);
      // @ts-expect-error some error
      if (division && !this.form.get('division').value) {
        // @ts-expect-error some error
        this.form.get('division').setValue(division.id);
      }
    }

    if (field === 'unit' && this.units.length) {
      const unit = this.units.find(item => item.id === window.history.state.data?.formData.unit);
      // @ts-expect-error some error
      if (unit && !this.form.get('unit').value) {
        // @ts-expect-error some error
        this.form.get('unit').setValue(unit.id);
      }
    }

    if (field === 'crew' && this._crews.length) {
      const crew = this._crews.find(item => item.id === window.history.state.data?.formData.crew);
      // @ts-expect-error some error
      if (crew && !this.form.get('crew').value) {
        // @ts-expect-error some error
        this.form.get('crew').setValue(crew.id);
      }
    }
  }

  public setFocusOnSearchField(): void {
    this.doubleClick = false;
    this.appBarCodeSearch?.setFocus();
  }

  private generateUniqueId(): string {
    return Math.random().toString(16).slice(7);
  }

  public addNewPartRowCB = (i: number, row: any) => this.addRow(i, row);

  public addRow(id: any, row: any) {
    console.log(id, row);
  }
}
