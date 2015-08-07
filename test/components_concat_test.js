'use strict';

var grunt = require('grunt');
var dirCompare = require('dir-compare');
var fs = require('fs');
var path = require('path');

exports.components_concat = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },

    defaultOptionsTest: function(test) {
        test.expect(1);

        var jsMatch = dirCompare.compareSync("defaultOptionsOutput/js/", "test/expected/js/", { compareContent: true });
        var cssMatch = dirCompare.compareSync("defaultOptionsOutput/css/", "test/expected/css/", { compareContent: true });
        var txtMatch = dirCompare.compareSync("defaultOptionsOutput/txt/", "test/expected/txt", { compareContent: true });

        test.equal(jsMatch.same && cssMatch.same && txtMatch.same, true,
            "The result of plugin run with default options must match the expected one");
        test.done();
    },

    customOutputFolderTest: function(test) {
        test.expect(1);

        var jsMatch = dirCompare.compareSync("customOutputFolder/js_output/", "test/expected/js/", { compareContent: true });
        var cssMatch = dirCompare.compareSync("customOutputFolder/css_output/", "test/expected/css/", { compareContent: true });
        var txtMatch = dirCompare.compareSync("customOutputFolder/txt_output/", "test/expected/txt/", { compareContent: true });

        test.equal(jsMatch.same && cssMatch.same && txtMatch.same, true,
            "The result of plugin run with custom output folder option must match the expected one");
        test.done();
    },

    excludeFoldersTest: function(test) {
        test.expect(1);

        var jsMatch = dirCompare.compareSync("excludeFoldersOutput/js/", "test/expected/js/", { compareContent: true });
        var cssMatch = dirCompare.compareSync("excludeFoldersOutput/css/", "test/expected/css/", { compareContent: true });
        var txtMatch = dirCompare.compareSync("excludeFoldersOutput/txt/", "test/expected/excludeTXT", { compareContent: true });

        test.equal(jsMatch.same && cssMatch.same && txtMatch.same, true,
            "The result of plugin run with source files exclude option must match the expected one");
        test.done();
    },

    minifyOptionTest: function(test) {
        test.expect(1);

        var jsMatch = dirCompare.compareSync("minifyOptionOutput/js/", "test/expected/uglifiedJS/", { compareContent: true });
        var cssMatch = dirCompare.compareSync("minifyOptionOutput/css/", "test/expected/minifiedCSS/", { compareContent: true });
        var txtMatch = dirCompare.compareSync("minifyOptionOutput/txt/", "test/expected/txt", { compareContent: true });

        test.equal(jsMatch.same && cssMatch.same && txtMatch.same, true,
            "The result of plugin run with minify option must match the expected one");
        test.done();
    }
};
