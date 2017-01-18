%lex
%import { foo, bar } from 'lib'
/lex

%%

start
  : foo bar { return 'ok'; }
  ;
