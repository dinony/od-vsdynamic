import {Component, HostListener, Input, OnChanges, SimpleChange} from '@angular/core';

@Component({
  selector: 'giphy-cell',
  styles: [`
    .cell {
      box-sizing: border-box;
      display: inline-block;
      height: 202px;
      margin-right: -5px;
      position: relative;
      width: 202px;
    }

    img {
      height: 202px;
      object-fit: cover;
      width: 202px;
    }
  `],
  template: `
    <div class="cell">
      <a target="_blank" [href]="itemIn.url">
        <img [src]="imgSrc">
      </a>
    </div>
  `,
})
export class CellComponent implements OnChanges {
  @Input('item') itemIn: any;
  imgSrc: string;

  private _setDefaultImgSrc = () => { this.imgSrc = this.itemIn.images.fixed_width_still.url; };
  private _setHoverImgSrc = () => { this.imgSrc = this.itemIn.images.downsized.url; };

  @HostListener('mouseover') onMouseOver() {
    this._setHoverImgSrc();
  }

  @HostListener('mouseout') onMouseOut() {
    this._setDefaultImgSrc();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if(changes.itemIn) {
      this._setDefaultImgSrc();
    }
  }
}
