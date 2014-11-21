var b   = require('ast-types').builders;
var gen = require('escodegen').generate;
var vm  = require('vm');
var camelCase = require('camel-case');
var fs  = require('fs');
var path = require('path');
var sex = require('s-expression');

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

	function curriedBuilder(name) {
		return b.functionExpression(
			b.identifier(name),
			[b.identifier('$args')],
			b.blockStatement([
				b.returnStatement(builder(name, ['$args']))
			])
		);
	}

	function quasi {
		['unquote', ...rest] => quote(compile)(rest),
		x => x
	}

	function jsLiteral {
		x if x instanceof String => String(x),
		['js!', ...rest]         => jsLiteral(rest),
		[callee]                 => curriedBuilder(callee),
		[callee, ...rest]        => builder(callee, rest),
		x => x
	}

	function mungeName {
		'+' => '$plus',
		'.' => '$dot',
		'*' => '$star',
		'-' => '$minus',
		'var' => '$var',
		x if x.indexOf('-') >= 0 => camelCase(x),
		x => x
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

	function getMacro(name, length) {
		return env[name] && (env[name][length] || env[name][0]);
	}

	function compile {
		e @ Error                 => { throw e; },
		['mac', name, args, body] => {
			var mac = macro(name, compile(args), compile(body));
			var len = mac.length;
			env[name] = env[name] || {};
			env[name][len] = mac;
			return b.emptyStatement();
		},
		['quote', ...rest]        => rest,
		['unquote', ...rest]      => quote(compile)(rest),
		['quasiquote', ...rest]   => quasi(rest),
		['js!', ...rest]          => jsLiteral(rest),
		[m, ...rest] if mac = getMacro(m, rest.length) => mac.apply(null, rest.map(compile)),
		[callee,  ...rest]        => b.callExpression(compile(callee), rest.map(compile)),
		x if x instanceof String  => b.literal(String(x)),
		x                         => b.identifier(mungeName(x))
	}

	sex('(' + fs.readFileSync(path.join(__dirname, '../prelude.cd'), 'utf8') + ')').map(compile);

	return compile;
}

module.exports = compiler;