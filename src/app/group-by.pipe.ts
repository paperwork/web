import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'groupBy'})
export class GroupByPipe implements PipeTransform {
  transform(collection: Array<any>, property: string = 'created_at'): Array<any> {
    if(!collection) {
      return null;
    }

    const gc = collection.reduce((previous, current)=> {
      let propertyValue = current[property];
      if(current[property] instanceof Date) {
        propertyValue = new Date(propertyValue.getTime());
        propertyValue.setHours(0);
        propertyValue.setMinutes(0);
        propertyValue.setSeconds(0);
        propertyValue.setMilliseconds(0);
      }

      if(!previous[propertyValue]) {
        previous[propertyValue] = [];
      }
      previous[propertyValue].push(current);
      return previous;
    }, {});

    return Object.keys(gc).map(date => ({ [property]: date, items: gc[date] }));
  }
}
