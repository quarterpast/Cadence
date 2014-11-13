var b = require('ast-types').builders;

function quote(fn) {
	return function {
		[a]    => fn(a),
		[...a] => fn(a)
	};
}

function id {
	a => a
}

function quasi {
	['unquote', ...rest] => quote(compile)(rest),
	x => x
}

function jsLiteral {
	x if x instanceof String => String(x),
	['unquote', ...rest]     => quote(compile)(rest),
	['js!', ...rest]         => jsLiteral(rest),
	[callee, ...rest]        => b[callee].apply(b, rest.map(jsLiteral)),
	x => x
}

function compile {
	e @ Error                => { throw e; },
	['quote', ...rest]       => quote(id)(rest),
	['quasiquote', ...rest]  => quasi(rest),
	['js!', ...rest]         => jsLiteral(rest),
	[callee,  ...rest]       => b.callExpression(compile(callee), rest.map(compile)),
	x if x instanceof String => b.literal(String(x)),
	x                        => b.identifier(x)
}

module.exports = compile;