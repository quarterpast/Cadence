var repl = require('repl');
var sex = require('s-expression');
var compile = require('./index.js');
var gen = require('escodegen').generate;
var vm = require('vm');

var env = {};

module.exports = function(options) {
	repl.start({
		eval: function(cmd, context, filename, callback) {
			var err, result;
			try {
				console.log(cmd)
				var code = gen(compile(env)(sex(cmd.slice(1, -1))));

				if(options.compile) {
					result = code;
				} else {
					var script = vm.createScript(code, {
						filename: filename,
						displayErrors: false
					});
					result = script.runInContext(context, { displayErrors: false });
				}
			} catch (e) {
				err = e;
			}

			callback(err, result);
		}
	});
};