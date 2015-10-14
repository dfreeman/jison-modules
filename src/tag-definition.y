%ebnf

%%

Tag
  : '%tag' String Tokens
    { return { name: $2, tokens: $3 }; }
  ;

String
  : string
    { $$ = yytext.slice(1, -1); }
  ;

Tokens
  : { $$ = []; }
  | Tokens (String | identifier)
    { $$ = $1; $$.push($2); }
  ;
