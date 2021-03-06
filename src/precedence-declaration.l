%%

\s+ // ignore whitespace

// Precedence
'-'?\d+ return 'number';

// Literals
'%precedence' return '%precedence';
'['           return '[';
']'           return ']';
','           return ',';
'left'        return 'left';
'right'       return 'right';
'nonassoc'    return 'nonassoc';

// Strings
'"'.*?'"' return 'string';
"'".*?"'" return 'string';

// Identifiers
[a-zA-Z_][a-zA-Z0-9_]* return 'identifier';
