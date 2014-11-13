var b   = require('ast-types').builders;
var gen = require('escodegen').generate;
var vm  = require('vm');

function quote(fn) {
	return function {
		[a]    => fn(a),
		[...a] => fn(a)
	};
}

function id {
	a => a
}

function compiler(env) {
	function builder(name, args) {
		return b.callExpression(
			b.memberExpression(b.identifier('$jsbuilder'), b.identifier(name), false),
			args.map(compile)
		);
	}

	function quasi {
		['unquote', ...rest] => quote(compile)(rest),
		x => x
	}

	function jsLiteral {
		x if x instanceof String => String(x),
		['js!', ...rest]         => jsLiteral(rest),
		[callee, ...rest]        => builder(callee, rest),
		x => x
	}

	function mungeName {
		'+' => '$plus',
		x   => x
	}

	function macro(name, args, body) {
		var fn = b.expressionStatement(b.functionExpression(
			b.identifier(mungeName(name)),
			args.map(b.identifier),
			b.blockStatement([
				b.returnStatement(body)
			])
		));

		return vm.runInNewContext(gen(fn), {
			$jsbuilder: b
		});
	}

	function compile {
		e @ Error                 => { throw e; },
		['mac', name, args, body] => { env[name] = macro(name, compile(args), compile(body)); return b.emptyStatement(); },
		['quote', ...rest]        => rest,
		['unquote', ...rest]      => quote(compile)(rest),
		['quasiquote', ...rest]   => quasi(rest),
		['js!', ...rest]          => jsLiteral(rest),
		[m, ...rest] if env[m]    => env[m].apply(null, rest.map(compile)),
		[callee,  ...rest]        => b.callExpression(compile(callee), rest.map(compile)),
		x if x instanceof String  => b.literal(String(x)),
		x                         => b.identifier(x)
	}

	return compile;
}

module.exports = compiler;