@{%
	const moo= require('moo');

	const keywords = {
	    'command': ['show', 'unshow', 'use', 'init', 'reset', 'set', 'remove', 'is', 'rewind', 'save', 'load'],
	    'object': ['grid', 'hint', 'value', 'it', 'unsolved', 'debug', 'input', 'color'],
	    'qualifier' : ['solved', 'stuck', 'correct', 'history', 'count', 'on', 'off', 'saved'],
	    'strategy_word' : ['brute', 'force', 'only', 'choice', 'naked', 'twins', 'shared']
	}

	const lexer = moo.compile({
	  word: {match: /[a-zA-Z]+/, type: moo.keywords(keywords)},
	  ws : /[ \t]/,
	  eq : '=',
	  number : /[0-9]+/,
	  newline : {match :'\n', lineBreaks:true}
	})
%}


@lexer lexer

start ->  commands {% id %}

commands -> command {% (t) => [t[0]] %}
		| command %newline:+ commands
			{% (t) => [t[0], ... t[2]]%}

command -> %command __ %object _
			{% (t) => ({
				verb: t[0].value, 
				object: t[2].value
			}) %}

		| %command __ %object __ %number _ %eq _ %number _
			{% (t) => ({
				verb: t[0].value,
				object:  t[2].value,
				cellIdx: parseInt(t[4].value),
				operator:  t[6].value, 
				value: parseInt(t[8].value) 
			}) %}

		| %command __ %object __ numbers _
			{% (t) => ({
				verb: t[0].value, 
				object : t[2].value, 
				numbers : t[4]
			}) %}

		| %command __ %object __ %qualifier _
			{% (t) => ({
				verb : t[0].value, 
				object : t[2].value, 
				qualifier : t[4].value 
			}) %}

		| %command __ strategy _
			{% (t) => ({
				verb : t[0].value, 
				strategy : t[2] 
			}) %}

numbers -> %number {% id %}
		| %number _ numbers {% (t) => t.join('') %}

strategy -> %strategy_word {% id %}
		| %strategy_word __ strategy {% (t) => t.join("") %} 


__ -> %ws:+

_ -> %ws:*

