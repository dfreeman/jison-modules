%import 'skipWhitespace'

%lex
%%
'hello' return 'hello';
/lex

%%

start: hello;
