import { List, Record } from 'immutable';

export const paramsToQuery = (params = {}): string => {
  return Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
  }).join('&');
};

export const mapContent = <T>(res, entryType): List<T> => {
  let itemsArray: Array<T> = [];
  console.debug('mapContent: res', res);
  if(Array.isArray(res.content) === true) {
    itemsArray = res.content.map((item: Object): T => {
      return new entryType(item);
    });
  } else {
    itemsArray.push(new entryType(res.content));
  }

  return List(itemsArray);
}
