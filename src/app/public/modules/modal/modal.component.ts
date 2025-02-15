import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  HostListener
} from '@angular/core';

import {
  SkyWindowRefService
} from '@skyux/core';

import {
  SkyModalHostService
} from './modal-host.service';

import {
  SkyModalConfiguration
} from './modal-configuration';

import {
  SkyModalComponentAdapterService
} from './modal-component-adapter.service';

import {
  skyAnimationModalState
} from './modal-state-animation';

let skyModalUniqueIdentifier: number = 0;

@Component({
  selector: 'sky-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    skyAnimationModalState
  ],
  providers: [
    SkyModalComponentAdapterService
  ]
})
export class SkyModalComponent implements AfterViewInit {
  public modalState = 'in';
  public modalContentId: string = 'sky-modal-content-id-' + skyModalUniqueIdentifier.toString();
  public modalHeaderId: string = 'sky-modal-header-id-' + skyModalUniqueIdentifier.toString();

  @Input()
  public set tiledBody(value: boolean) {
    this.config.tiledBody = value;
  }

  public get modalZIndex() {
    return this.hostService.getModalZIndex();
  }

  public get modalFullPage() {
    return this.config.fullPage;
  }

  public get isSmallSize() {
    return !this.modalFullPage && this.isSizeEqual(this.config.size, 'small');
  }

  public get isMediumSize() {
    return !this.modalFullPage && !(this.isSmallSize || this.isLargeSize);
  }

  public get isLargeSize() {
    return !this.modalFullPage && this.isSizeEqual(this.config.size, 'large');
  }

  public get isTiledBody() {
    return this.config.tiledBody;
  }

  @Input()
  public get ariaRole() {
    return this.config.ariaRole || 'dialog';
  }
  public set ariaRole(value: string) {
    this.config.ariaRole = value;
  }

  public get ariaDescribedBy() {
    return this.config.ariaDescribedBy || this.modalContentId;
  }

  public get ariaLabelledBy() {
    return this.config.ariaLabelledBy || this.modalHeaderId;
  }

  public get helpKey() {
    return this.config.helpKey;
  }

  constructor(
    private hostService: SkyModalHostService,
    private config: SkyModalConfiguration,
    private elRef: ElementRef,
    private windowRef: SkyWindowRefService,
    private componentAdapter: SkyModalComponentAdapterService
  ) { }

  @HostListener('document:keydown', ['$event'])
  public onDocumentKeyDown(event: KeyboardEvent) {
    /* istanbul ignore else */
    /* sanity check */
    if (SkyModalHostService.openModalCount > 0) {
      let topModal = SkyModalHostService.topModal;
      if (topModal && topModal === this.hostService) {
        switch (event.which) {
          case 27: { // Esc key pressed
            event.preventDefault();
            this.closeButtonClick();
            break;
          }

          case 9: {  // Tab pressed
            let focusChanged = false;

            let focusElementList = this.componentAdapter.loadFocusElementList(this.elRef);

            if (
              event.shiftKey &&
              (this.componentAdapter.isFocusInFirstItem(event, focusElementList) ||
              this.componentAdapter.isModalFocused(event, this.elRef))) {

              focusChanged = this.componentAdapter.focusLastElement(focusElementList);
            } else if (
              !event.shiftKey && this.componentAdapter.isFocusInLastItem(event, focusElementList)) {
              focusChanged = this.componentAdapter.focusFirstElement(focusElementList);
            }

            if (focusChanged) {
              event.preventDefault();
              event.stopPropagation();
            }
            break;
          }

          default:
            break;
        }
      }

    }
  }

  public ngAfterViewInit() {
    skyModalUniqueIdentifier++;
    this.componentAdapter.handleWindowChange(this.elRef);

    // Adding a timeout to avoid ExpressionChangedAfterItHasBeenCheckedError.
    // https://stackoverflow.com/questions/40562845
    this.windowRef.getWindow().setTimeout(() => {
      this.componentAdapter.modalOpened(this.elRef);
    });
  }

  public helpButtonClick() {
    this.hostService.onOpenHelp(this.helpKey);
  }

  public closeButtonClick() {
    this.hostService.onClose();
  }

  public windowResize() {
    this.componentAdapter.handleWindowChange(this.elRef);
  }

  private isSizeEqual(actualSize: string, size: string) {
    return actualSize && actualSize.toLowerCase() === size;
  }
}
