%ebnf

%%

Op
  : '%op' '[' Assoc ',' Prec ']' Body
    { return { associativity: $Assoc, precedence: $Prec, body: $Body }; }
  ;

Assoc
  : ('left' | 'right' | 'nonassoc')
    { $$ = yytext; }
  ;

Prec
  : number
    { $$ = Number(yytext); }
  ;

Body
  : Token
    { $$ = [$Token]; }
  | Body Token
    { $$ = $Body.concat($Token); }
  ;

Token
  : string
    { $$ = yytext.slice(1, -1); }
  | identifier
    { $$ = yytext; }
  ;
