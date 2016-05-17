// Tests for the `urlEncodedJsonReader` dataSource grade.

"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.require("%gpii-couch-cushion");
fluid.require("%gpii-express");

gpii.express.loadTestingSupport();

require("./lib/");
require("./lib/globalFailureHandler");

// Our local test dataSource grade that is aware of our starting URL (loopback)
fluid.defaults("gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.dataSource", {
    gradeNames: ["gpii.couchdb.cushion.dataSource.urlEncodedJsonReader"],
    endpoint: "loopback",
    url: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%endpoint", { baseUrl: "{testEnvironment}.options.baseUrl", endpoint: "{that}.options.endpoint"}]
        }
    }
});

// TODO:  Confirm that writing data fails.

fluid.defaults("gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
    rawModules: [{
        name: "Tests for the `urlEncodedJsonReader` dataSource grade...",
        tests: [
            {
                name: "We should be able to send a JSON payload to the server via the dataSource query string...",
                type: "test",
                sequence: [
                    {
                        func: "{normalDatasource}.get",
                        args: ["{testEnvironment}.options.input.success"]
                    },
                    {
                        listener: "jqUnit.assertDeepEq",
                        event:    "{testEnvironment}.express.loopback.events.onRequestReceived",
                        args:     ["The JSON payload should have been received by the server...", "{testEnvironment}.options.expected.success", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "We should be able to make a request with an empty JSON payload...",
                type: "test",
                sequence: [
                    {
                        func: "{normalDatasource}.get",
                        args: ["{testEnvironment}.options.input.empty"]
                    },
                    {
                        listener: "jqUnit.assertDeepEq",
                        event:    "{testEnvironment}.express.loopback.events.onRequestReceived",
                        args:     ["The JSON payload should have been received by the server...", "{testEnvironment}.options.expected.empty", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "We should be able to omit the payload altogether...",
                type: "test",
                sequence: [
                    {
                        func: "{normalDatasource}.get",
                        args: []
                    },
                    {
                        listener: "jqUnit.assertDeepEq",
                        event:    "{testEnvironment}.express.loopback.events.onRequestReceived",
                        args:     ["The JSON payload should have been received by the server...", "{testEnvironment}.options.expected.empty", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Attempting to use the grade with existing query data should result in an error...",
                type: "test",
                sequence: [
                    {
                        funcName: "kettle.test.pushInstrumentedErrors",
                        args:     ["gpii.test.notifyGlobalError"]
                    },
                    {
                        func: "{existingQueryDataDatasource}.get",
                        args: []
                    },
                    {
                        event:    "{globalErrorHandler}.events.onError",
                        listener: "gpii.test.awaitGlobalError"
                    },
                    {
                        funcName: "kettle.test.popInstrumentedErrors"
                    }
                ]
            },
            {
                name: "Attempting to write data should result in an error...",
                type: "test",
                sequence: [
                    {
                        funcName: "kettle.test.pushInstrumentedErrors",
                        args:     ["gpii.test.notifyGlobalError"]
                    },
                    {
                        func: "{writableDatasource}.set",
                        args: [{}, {}]
                    },
                    {
                        event:    "{globalErrorHandler}.events.onError",
                        listener: "gpii.test.awaitGlobalError"
                    },
                    {
                        funcName: "kettle.test.popInstrumentedErrors"
                    }
                ]
            }
        ]
    }],
    components: {
        normalDatasource: {
            type: "gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.dataSource"
        },
        existingQueryDataDatasource: {
            type: "gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.dataSource",
            options: {
                endpoint: "loopback?foo=bar"
            }
        },
        writableDatasource: {
            type: "gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.dataSource",
            options: {
                writable: true
            }
        }
    }
});

fluid.defaults("gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.environment", {
    gradeNames: ["gpii.test.express.testEnvironment"],
    port: "9595",
    input: {
        empty: {},
        success: {
            topLevelString: "foo",
            topLevelUndefined: undefined,
            topLevelNull: null,
            deep: {
                deepArray: ["quux", 0, false, null],
                deepNull: null,
                deepUndefined: undefined,
                evenDeeper: {
                    deepest: true,
                    deeplyNull: null,
                    deeplyUndefined: undefined
                }
            },
            topLevelArray: [ 0, 1, 2]

        }
    },
    expected: {
        empty: {},
        success: {
            topLevelString: "foo",
            deep: {
                deepArray: ["quux", "0", "false"],
                evenDeeper: {
                    deepest: "true"
                }
            },
            topLevelArray: [ "0", "1", "2"]
        }
    },
    components: {
        express: {
            options: {
                components: {
                    loopback: {
                        type: "gpii.test.couchdb.cushion.loopbackMiddleware"
                    }
                }
            }
        },
        caseHolder: {
            type: "gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.couchdb.cushion.dataSource.urlEncodedJsonReader.environment");