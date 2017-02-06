var expect = require('expect.js');
var compiler = require('./lib/index.js');

describe('compiler', function() {
	describe('quote', function() {
		it('should return the tail of the list', function() {
			var compile = compiler({});
			expect(compile(['quote', 'a', 5, ['b']])).to.eql(['a', 5, ['b']]);
		});
	});
});