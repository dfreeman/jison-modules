%%

\s+ // ignore whitespace

// Literals
'%tag'  return '%tag';

// Strings
'"'.*?'"' return 'string';
"'".*?"'" return 'string';

// Identifiers
[a-zA-Z_][a-zA-Z0-9_]* return 'identifier';
