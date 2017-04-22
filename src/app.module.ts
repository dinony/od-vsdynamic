import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';

import {VirtualScrollModule} from 'od-virtualscroll';
import {VirtualScrollDebugModule} from 'od-vsdebug';

import {GiphyModule} from './giphy/giphy.module';

import {AppComponent} from './app.component';
import {TileComponent} from './tile.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, TileComponent],
  imports: [
    BrowserModule,
    HttpModule,
    ReactiveFormsModule,

    VirtualScrollModule,
    VirtualScrollDebugModule,

    GiphyModule
  ]
})
export class AppModule {}
