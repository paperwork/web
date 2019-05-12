import { Note } from '../app/notes/note';
import { forEach } from 'lodash';

const MATCH_FULL: number = 0;
const MATCH_ATTRIBUTE: number = 1;
const MATCH_REGEX: number = 2;
const MATCH_REGEX_OPS: number = 3;
const MATCHES_TOTAL: number = 4;

export class SearchEngine {
  constructor() {
    console.log('Initialized SearchEngine!');
  }

  public filterPredicate(note: Note, filter: string): boolean {
    const filterLineRegex = /\$(title|tags|body|path)=\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/g;

    console.log("FILTERING");
    console.log(filter);
    console.log(note);
    if(typeof filter !== 'string'
    || filter.trim() === '') {
      return true;
    }

    let m;
    while((m = filterLineRegex.exec(filter)) !== null) {
      if(m.index === filterLineRegex.lastIndex) {
        filterLineRegex.lastIndex++;
      }

      if(m.length === MATCHES_TOTAL) {
        const matchFull: string = m[MATCH_FULL];
        const matchAttribute: string = m[MATCH_ATTRIBUTE];
        const matchRegex: string = m[MATCH_REGEX];
        const matchRegexOps: string = m[MATCH_REGEX_OPS];

        const filterRegex = new RegExp(matchRegex, matchRegexOps);

        let noteAttributeValues = note[matchAttribute];
        if(Array.isArray(noteAttributeValues) === false) {
          noteAttributeValues = [noteAttributeValues];
        }
        console.log(noteAttributeValues);

        const foundAttributeValue: any = noteAttributeValues.find((value: any) => {
          const regexResult: Array<string>|null = filterRegex.exec(value);
          console.log(regexResult);
          if(regexResult !== null
          && regexResult.length > 0) {
            return true;
          }

          return false;
        });
        console.log(foundAttributeValue);

        // TODO: Continue work here
        return (typeof foundAttributeValue !== 'undefined');
      }
    }

  }
}
