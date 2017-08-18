import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

import 'rxjs/add/observable/of';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/toPromise';

import {IVirtualScrollOptions, ScrollObservableService, SetScrollTopCmd} from 'od-virtualscroll';
import {ConsoleWriterService} from 'od-vsdebug';

import {GiphyService} from './giphy/giphy.service';

@Component({
  selector: 'app-shell',
  styleUrls: ['src/app.component.css'],
  template: `
     <div class="outer-container">
      <div class="inner-container">
        <div class="header">
          <h1>od-virtualscroll</h1>
          <div>
            <div class="formGroup">
              <input class="searchInput" type="text" [formControl]="search" placeholder="Search...">
            </div>
            <div class="formGroup">
              <input type="checkbox" [formControl]="debug"> Attach console writer
            </div>
          </div>
        </div>
        <div class="border-wrapper">
          <od-virtualscroll class="cells-container" [vsData]="data$" [vsOptions]="options$" [vsUserCmd]="scrollTop$" [vsEqualsFunc]="equals">
            <ng-template let-item>
              <giphy-cell [item]="item"></giphy-cell>
            </ng-template>
          </od-virtualscroll>
        <div>
      </div>
    </div>`
})
export class AppComponent implements OnInit, OnDestroy {
  private _prevData: any[];
  private _curData: any[];

  private _subs: Subscription[] = [];

  private _initSearchVal = 'cat';
  search = new FormControl(this._initSearchVal);

  private _initDebugVal = false;
  debug = new FormControl(this._initDebugVal);

  private _numItems: number = 0;

  private _input$ = this.search.valueChanges
    .debounceTime(500)
    .distinctUntilChanged()
    .filter(search => search.length > 0)
    .startWith(this._initSearchVal);

  private _debugSetting$ = this.debug.valueChanges.startWith(this._initDebugVal);

  private _scrollEnd$ = this._scrollObs.scrollWin$.filter(([scrollWin]) => scrollWin.visibleEndRow !== -1 && scrollWin.visibleEndRow === scrollWin.numVirtualRows - 1);

  scrollTop$: Subject<SetScrollTopCmd> = new Subject();

  data$: ConnectableObservable<any[]> = Observable.create((observer: Observer<any[]>) => {
    let curSearch: string;
    let curPagination: {total_count: number, count: number, offset: number};
    let curData: any[] = [];
    const subs: Subscription[] = [];

    const fetchData = (search: string, limit: number, offset: number) => this._giphy.searchBy(search, limit, offset);

    const emitNext = (search: string, lim: number, off: number) => {
      fetchData(search, lim, off).toPromise().then(({data, pagination}) => {
        curPagination = pagination;

        data.forEach((d: any) => curData.push(d));

        this._prevData = this._curData;
        this._curData = curData;

        observer.next(curData);
      }).catch(err => observer.error(err));
    };

    subs.push(this._input$.subscribe(search => {
      curSearch = search;
      curData = []; // reset data

      // Fetch with init pagination
      this.scrollTop$.next(new SetScrollTopCmd(0));
      emitNext(search, 50, 0);
    }));

    subs.push(this._scrollEnd$.subscribe(([scrollWin]) => {
      if(curPagination !== undefined) {
        const nextOffset = curPagination.count + curPagination.offset;
        if(nextOffset - 1 + curPagination.count < curPagination.total_count) {
          emitNext(curSearch, curPagination.count, nextOffset);
        } else if(curPagination.total_count > curPagination.count) {
          // Fetch rest
          emitNext(curSearch, Math.min(curPagination.count, curPagination.total_count - curPagination.offset), curPagination.offset);
        }
      } else {
        observer.error('Duh..');
      }
    }));

    return function unsubscribe() {
      subs.forEach(sub => sub.unsubscribe());
    };
  }).publish();

  options$: Observable<IVirtualScrollOptions> = Observable.of({itemWidth: 202, itemHeight: 202, numAdditionalRows: 1});

  equals = (prevDataIndex: number, curDataIndex: number) => {
    if(prevDataIndex !== curDataIndex) {
      return false;
    } else if(this._prevData !== undefined && this._curData !== undefined && this._prevData.length > prevDataIndex && this._curData.length > curDataIndex) {
      const prev = this._prevData[prevDataIndex];
      const cur = this._curData[curDataIndex];

      if(cur.id === undefined || prev.id === undefined) {
        return false;
      } else {
        return prev.id === cur.id;
      }
    } else {
      return false;
    }
  }

  constructor(private _giphy: GiphyService, private _scrollObs: ScrollObservableService, private _writer: ConsoleWriterService ) {}

  ngOnInit() {
    this._subs.push(this._debugSetting$.subscribe(attachWriter => {
      if(attachWriter) {
        this._writer.attachAll();
      } else {
        this._writer.detachAll();
      }
    }));

    this._subs.push(this.data$.map(data => data.length).subscribe(length => {
      this._numItems = length;
    }));

    this._subs.push(this.data$.connect());
  }

  ngOnDestroy() {
    this._writer.detachAll();
    this._subs.forEach(sub => sub.unsubscribe());
  }
}
