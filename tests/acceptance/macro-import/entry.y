%lex
%import { DIGIT } from 'macros'
%%
{DIGIT} return 'digit';
/lex

%%

start
  : digit { return 'ok'; }
  ;
