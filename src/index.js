var b = require('ast-types').builders;

function quasi {
	['unquote', ...rest] => compile(rest),
	x => x
}

function jsLiteral {
	x if x instanceof String => String(x),
	['unquote', rest]        => compile(rest),
	['unquote', ...rest]     => compile(rest),
	['js!', ...rest]         => jsLiteral(rest),
	[callee, ...rest]        => b[callee].apply(b, rest.map(jsLiteral)),
	x => x
}

function compile {
	e @ Error                => { throw e; },
	['quote', arg]           => arg,
	['quote', ...rest]       => rest,
	['quasiquote', ...rest]  => quasi(rest),
	['js!', ...rest]         => jsLiteral(rest),
	[callee,  ...rest]       => b.callExpression(compile(callee), rest.map(compile)),
	x if x instanceof String => b.literal(String(x)),
	x                        => b.identifier(x)
}

module.exports = compile;