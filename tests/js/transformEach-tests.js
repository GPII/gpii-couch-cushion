/*
    Tests for the `transformEach` function defined in this package.
 */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");

require("../../src/js/lib/transformEach");

fluid.registerNamespace("gpii.couch.cushion.tests.transformEach");

gpii.couch.cushion.tests.transformEach.runSingleTest = function (testDefinition) {
    jqUnit.test(testDefinition.message, function(){
        var output = fluid.model.transformWithRules(testDefinition.input, testDefinition.rules);
        jqUnit.assertDeepEq(testDefinition.message, testDefinition.expected, output);
    });
};

fluid.defaults("gpii.couch.cushion.tests.transformEach.testRunner", {
    gradeNames: ["fluid.component"],
    rules: {
        "": {
            transform: {
                type: "fluid.transforms.transformEach",
                inputPath: "",
                rules: {
                    inserted: {
                        literalValue: true
                    },
                    preserved: "preserved"
                }
            }
        }
    },
    nestedRules: {
        "": {
            transform: {
                type: "fluid.transforms.transformEach",
                inputPath: "",
                rules: {
                    innerArray: {
                        transform: {
                            type: "fluid.transforms.transformEach",
                            inputPath: "innerArray",
                            rules: {
                                inserted: {
                                    literalValue: true
                                },
                                preserved: "preserved"
                            }
                        }
                    }
                }
            }
        }
    },
    tests: [
        {
            message:  "An array should be transformed as expected...",
            input:    [{}, {}, { preserved: true}],
            rules:    "{that}.options.rules",
            expected: [{ inserted: true}, { inserted: true}, { inserted: true, preserved: true}]
        },
        {
            message:  "An empty array should remain empty...",
            input:    [],
            rules:    "{that}.options.rules",
            expected: []
        },
        {
            message:  "An object should be transformed as expected...",
            input:    { one: {}, two: {}, three: { preserved: true}},
            rules:    "{that}.options.rules",
            expected: { one: { inserted: true}, two: { inserted: true}, three: { inserted: true, preserved: true}}
        },
        {
            message:  "An empty object should remain empty...",
            input:    {},
            rules:    "{that}.options.rules",
            expected: {}
        },
        {
            message:  "Nested transforms should work as expected...",
            input:    [{ innerArray: [{}, { preserved: true}]}, { innerArray: [{}]}, { innerArray: []}, {}],
            rules:    "{that}.options.nestedRules",
            expected: [{ innerArray: [{ inserted: true}, { inserted: true, preserved: true}]}, { innerArray: [{ inserted: true}]}, { innerArray: []}, {}]
        }
    ],
    listeners: {
        "onCreate.registerModule": {
            "funcName": "jqUnit.module",
            args: ["Testing the `transformEach` transformation function..."]
        },
        "onCreate.runTests": {
            funcName: "fluid.each",
            args:     ["{that}.options.tests", gpii.couch.cushion.tests.transformEach.runSingleTest]
        }
    }
});

gpii.couch.cushion.tests.transformEach.testRunner();