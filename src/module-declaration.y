%ebnf

%%

Start
  : (Import | Export)
    { return $1; }
  ;

Export
  : '%export' 'default' id
    -> { type: 'Export', bindings: [{ source: $id, binding: 'default' }] }
  | '%export' 'lex' NamedBindings
    -> { type: 'Export', lexical: true, bindings: $NamedBindings }
  | '%export' NamedBindings
    -> { type: 'Export', bindings: $NamedBindings }
  ;

Import
  : '%import' String
    -> { type: 'Import', bindings: [], module: $String }
  | '%import' Bindings 'from' String
    -> { type: 'Import', bindings: $Bindings, module: $String }
  | '%import' 'lex' NamedBindings 'from' String
    -> { type: 'Import', lexical: true, bindings: $NamedBindings, module: $String }
  ;

Bindings
  : Default
  | NamedBindings
  | Default ',' NamedBindings -> $Default.concat($NamedBindings)
  ;

Default
  : id -> [{ source: 'default', binding: $id }]
  ;

NamedBindings
  : '{' Specifiers '}' -> $Specifiers
  ;

Specifiers
  : Specifier -> [$Specifier]
  | Specifier ',' Specifiers -> [$Specifier].concat($Specifiers);
  ;

Specifier
  : Identifier 'as' Identifier -> { source: $1, binding: $3 }
  | Identifier -> { source: $1, binding: $1 }
  ;

Identifier
  : id
  | String
  ;

String
  : string -> yytext.slice(1, -1)
  ;
