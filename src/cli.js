#!/usr/bin/env node
var compile = require('./index.js');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

if(argv.i || argv._.length === 0) {
	require('./repl.js')({
		compile: argv.c
	});
} else {
	var out = argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout;

	var gen = require('escodegen').generate;
	var sex = require('s-expression');
	var b = require('ast-types').builders;


	var content = fs.readFileSync(argv._[0], 'utf8');
	var lispAst = sex(content);
	var jsAst   = compile({})(lispAst);
	var code    = gen(wrapProgram(jsAst));

	out.write(code);
}

function wrapProgram(a) {
	return b.program([b.expressionStatement(a)]);
}