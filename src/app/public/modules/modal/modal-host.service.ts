import {
  EventEmitter,
  Injectable
} from '@angular/core';

// Need to add the following to classes which contain static methods.
// See: https://github.com/ng-packagr/ng-packagr/issues/641
// @dynamic
@Injectable()
export class SkyModalHostService {

  public static get openModalCount(): number {
    return SkyModalHostService.modalHosts.length;
  }

  public static get fullPageModalCount(): number {
    let fullPageModals = SkyModalHostService.modalHosts.filter(modal => modal.fullPage);
    return fullPageModals.length;
  }

  private static get BASE_Z_INDEX(): number {
    return 1040;
  }

  public static get backdropZIndex(): number {
    return SkyModalHostService.BASE_Z_INDEX + SkyModalHostService.modalHosts.length * 10;
  }

  public static get topModal(): SkyModalHostService {
    return SkyModalHostService.modalHosts[SkyModalHostService.modalHosts.length - 1];
  }

  private static modalHosts: SkyModalHostService[] = [];

  public close = new EventEmitter<void>();
  public fullPage = false;
  public openHelp = new EventEmitter<any>();

  constructor() {
    SkyModalHostService.modalHosts.push(this);
  }

  public getModalZIndex(): number {
    let zIndex = SkyModalHostService.BASE_Z_INDEX + 1;
    zIndex += (SkyModalHostService.modalHosts.indexOf(this) + 1) * 10;
    return zIndex;
  }

  public onClose(): void {
    this.close.emit();
  }

  public onOpenHelp(helpKey?: string) {
    this.openHelp.emit(helpKey);
  }

  public destroy(): void {
    SkyModalHostService.modalHosts.splice(SkyModalHostService.modalHosts.indexOf(this), 1);
  }
}
