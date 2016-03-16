%ebnf
%buzz
%%

start: item+ { return $1; };

item
  : foo -> 'foo'
  | bar -> 'bar'
  ;
