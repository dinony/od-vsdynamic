import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';

import {Observable} from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class GiphyService {
  private _apiKey = 'dc6zaTOxFJmzC';
  private _apiUrl = 'https://api.giphy.com/v1/gifs';

  constructor(private _http: Http) {}

  private _getApiUrl = (endpoint: string) => `${this._apiUrl}/${endpoint}?api_key=${this._apiKey}`;

  private _getSearchUrl = (query: string, limit=100, offset=0) => `${this._getApiUrl('search')}&q=${query}&limit=${limit}&offset=${offset}`;

  private _getData(res: Response) {
    const body = res.json();
    return body || {};
  }

  private _handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }

  searchBy = (query='cat', limit=10, offset=0) => this._http.get(this._getSearchUrl(query, limit, offset)).map(this._getData).catch(this._handleError);
}
