%import Foo1 from 'a'
%import Foo4 from 'b'
%import Foo3 from 'c'
%import Foo2 from 'd'

%ebnf
%%

Start: Items { return $1; };

Items
  : -> []
  | Item+ newline Items -> $1.concat($3)
  ;

Item
  : Foo1 -> 'foo1'
  | Foo2 -> 'foo2'
  | Foo3 -> 'foo3'
  | Foo4 -> 'foo4'
  ;
