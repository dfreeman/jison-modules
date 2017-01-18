%%

\s+ // ignore whitespace

// Literals
'%import' return '%import';
'%export' return '%export';
'{'       return '{';
'}'       return '}';
','       return ',';
'from'    return 'from';
'as'      return 'as';
'default' return 'default';

// Strings
'"'.*?'"' return 'string';
"'".*?"'" return 'string';
// TODO bother with handling escape sequences?

// Identifiers
[a-zA-Z_][a-zA-Z0-9_]* return 'id';
