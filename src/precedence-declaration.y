%ebnf

%%

Precedence
  : '%precedence' '[' Assoc ',' Priority ']' Body
    { return { associativity: $Assoc, priority: $Priority, body: $Body }; }
  ;

Assoc
  : ('left' | 'right' | 'nonassoc') -> yytext
  ;

Priority
  : number -> Number(yytext)
  ;

Body
  : Token -> [$Token]
  | Body Token -> $Body.concat($Token)
  ;

Token
  : string -> yytext.slice(1, -1)
  | identifier -> yytext
  ;
