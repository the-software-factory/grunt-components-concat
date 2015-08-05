'use strict';

var grunt = require('grunt');
var dirCompare = require('dir-compare');

exports.components_concat = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  test: function(test) {
    test.expect(1);

    var jsMatch = dirCompare.compareSync("build/js/", "test/expected/js/", { compareContent: true });
    var cssMatch = dirCompare.compareSync("build/css/", "test/expected/css/", { compareContent: true });

    test.equal(jsMatch.same, cssMatch.same, "Grunt result must match the expected one");

    test.done();
  }
};
