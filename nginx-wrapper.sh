#!/bin/sh

ARGDIR=$(dirname "$1")

env | grep -i '^PAPERWORK_' | while read envvar
do
    envvar_key=`echo $envvar | sed 's/PAPERWORK_\([A-Z_]*\)=\(.*\)/\1/'`
    envvar_val=`echo $envvar | sed 's/PAPERWORK_\([A-Z_]*\)=\(.*\)/\2/'`

    envvar_key_formatted=`echo $envvar_key | awk '{   text = $0;
        split(text, words, /[^a-zA-Z]+/);
        for (i=1; i<=length(words); i++) {
            chO = i == 1 ? tolower(substr(words[i],1,1)) : toupper(substr(words[i],1,1));
            res = res chO tolower(substr(words[i],2));
        }
        print res
    }'`

    new_dotenv=`cat $1 | jq --arg key "$envvar_key_formatted" --arg val "$envvar_val" '. + {($key): $val}'`

    [[ -n "$new_dotenv" ]] && echo "$new_dotenv" > $1
done

echo $INDEX_INJECT >> "$ARGDIR/index.html"

nginx -g "daemon off;"
