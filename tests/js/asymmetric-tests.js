"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

var jqUnit = require("node-jqunit");

require("../../");
require("./lib/");

require("gpii-express");
gpii.express.loadTestingSupport();

require("gpii-pouchdb");
gpii.pouch.loadTestingSupport();

fluid.registerNamespace("gpii.tests.couchdb.cushion.dataSource.asymmetric");
gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput = function (message, output, expected) {
    debugger;
    // Compare everything but "rows"
    jqUnit.assertLeftHand(message + " (overall comparison)", fluid.filterKeys(expected, ["rows"], true), fluid.filterKeys(output, ["rows"], true));

    if (expected.rows) {
        jqUnit.assertEquals(message + " (number of rows)", expected.rows.length, output.rows.length);

        // We have to perform a deep inspection because assertLeftHand will not work with an array on its own...
        for (var a = 0; a < expected.rows.length; a++) {
            jqUnit.assertLeftHand(message + " (row " + a + ")", expected.rows[a], output.rows[a]);
        }
    }
};

fluid.defaults("gpii.tests.couchdb.cushion.dataSource.asymmetric.base", {
    gradeNames: ["gpii.couchdb.cushion.dataSource.asymmetric"],
    readEndpoint: "records/_design/lookup/_view/byColor?startkey=%5B%22%color%22%2C%20%22aaa%22%5D&endkey=%5B%22%color%22%2C%20%22zzz%22%5D",
    writeEndpoint: "records",
    readTermMap: {
        color: "%color"
    },
    readUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%readEndpoint", {
                baseUrl: "{testEnvironment}.options.baseUrl",
                readEndpoint: "{gpii.tests.couchdb.cushion.dataSource.asymmetric.base}.options.readEndpoint"
            }]
        }
    },
    writeUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            // `%_id` will be replaced by a variable coming from our `directModel`.
            args: ["%baseUrl%writeEndpoint/%_id", {
                baseUrl: "{testEnvironment}.options.baseUrl",
                writeEndpoint: "{gpii.tests.couchdb.cushion.dataSource.asymmetric.base}.options.writeEndpoint"
            }]
        }
    }
});

// A grade to test the "no wrapper" mix-in grade.
fluid.defaults("gpii.tests.couchdb.cushion.dataSource.asymmetric.unwrapped", {
    gradeNames: ["gpii.tests.couchdb.cushion.dataSource.asymmetric.base", "gpii.couchdb.cushion.dataSource.asymmetric.noWrapper"]
});

// A grade to confirm that the default "value" wrapper is preserved.
fluid.defaults("gpii.tests.couchdb.cushion.dataSource.asymmetric.wrapped", {
    gradeNames: ["gpii.tests.couchdb.cushion.dataSource.asymmetric.base"],
    readEndpoint: "records/_design/lookup/_view/wrapped" // Custom view to only show "wrapped" records
});

// A grade that can only hope to fail.
fluid.defaults("gpii.tests.couchdb.cushion.dataSource.asymmetric.bornToLose", {
    gradeNames: ["gpii.tests.couchdb.cushion.dataSource.asymmetric.base"],
    readUrl: "http://not.found/bad/path/",
    writeUrl: "http://not.found/bad/path/"
});

fluid.defaults("gpii.tests.couchdb.cushion.dataSource.asymmetric.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder"],
    rawModules: [{
        name: "Testing the 'asymmetric' dataSource...",
        tests: [
            {
                name: "The default 'value' wrapper should be able to read existing data...",
                type: "test",
                sequence: [
                    {
                        func: "{wrapped}.get"
                    },
                    {
                        listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
                        event: "{wrapped}.events.onRead",
                        args: ["Data read from the 'value' wrapper should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.wrapped.initialRead"] // message, output, expected
                    }
                ]
            },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            // {
            //     name: "The default 'value' wrapper should be able to insert a new record...",
            //     type: "test",
            //     sequence: [
            //         {
            //             func: "{wrapped}.set",
            //             args: [{_id: "foo"}, {_id: "foo", foo: "bar"}]
            //         },
            //         {
            //             listener: "fluid.identity",
            //             event:    "{wrapped}.events.onWrite"
            //         },
            //         {
            //             func: "{wrapped}.get"
            //         },
            //         {
            //             listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
            //             event: "{wrapped}.events.onRead",
            //             args: ["Data read after writing a 'wrapped' record should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.wrapped.readAfterInsert"] // message, output, expected
            //         }
            //     ]
            // },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The default 'value' wrapper should be able to update an existing record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{wrapped}.set",
            //            args: [{ _id: "wrapped"}, { foo: "bar", updated: true }]
            //        },
            //         {
            //             listener: "fluid.identity",
            //             event: "{wrapped}.events.onWrite"
            //         },
            //        {
            //            func: "{wrapped}.get"
            //        },
            //        {
            //            listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
            //            event:    "{wrapped}.events.onRead",
            //            args:     ["Data read after writing with the default grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.wrapped.readAfterUpdate"] // message, output, expected
            //        }
            //    ]
            //},
            {
                name: "The `noWrapper` grade should be able to read existing records...",
                type: "test",
                sequence: [
                    {
                        func: "{unwrapped}.get",
                        args: [{color: "red"}]
                    },
                    {
                        listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
                        event: "{unwrapped}.events.onRead",
                        args: ["Data read from the `noWrapper` grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.unwrapped.initialRead"] // message, output, expected
                    }
                ]
            },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            // {
            //     name: "The `noWrapper` grade should be able to insert a new record...",
            //     type: "test",
            //     sequence: [
            //         {
            //             func: "{unwrapped}.set",
            //             args: [null, {_id: "tomato", name: "tomato", color: "red"}]
            //         },
            //         {
            //             listener: "fluid.identity",
            //             event: "{unwrapped}.events.onWrite"
            //         },
            //         {
            //             func: "{unwrapped}.get",
            //             args: [{color: "red"}]
            //         },
            //         {
            //             listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
            //             event: "{unwrapped}.events.onRead",
            //             args: ["Data read after a writing with the `noWrapper` grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.unwrapped.readAfterInsert"] // message, output, expected
            //         }
            //     ]
            // },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The `noWrapper` grade should be able to update an existing record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{unwrapped}.set",
            //            args: [{ _id: "cherry" }, { name: "cherry", color: "red", flavor: "sweet" }] // directModel (used for lookup?), model (to be set?), options/callback (not used by me)
            //        },
            //         {
            //             listener: "fluid.identity",
            //             event: "{unwrapped}.events.onWrite"
            //         },
            //        {
            //            func: "{unwrapped}.get",
            //            args: [{ color: "red" }]
            //        },
            //        {
            //            listener: "gpii.tests.couchdb.cushion.dataSource.asymmetric.checkOutput",
            //            event:    "{unwrapped}.events.onRead",
            //            args:     ["Data should be updated as expected...", "{arguments}.0", "{testEnvironment}.options.expected.unwrapped.readAfterUpdate"] // message, output, expected
            //        }
            //    ]
            //},
            {
                name: "Read and write failures should result in the correct events firing...",
                type: "test",
                sequence: [
                    {
                        func: "{bornToLose}.get"
                    },
                    {
                        listener: "jqUnit.assert",
                        event: "{bornToLose}.events.onReadError",
                        args: ["A read failure should result in 'onReadError' firing..."]
                    },
                    {
                        func: "{bornToLose}.set"
                    },
                    {
                        listener: "jqUnit.assert",
                        event: "{bornToLose}.events.onWriteError",
                        args: ["A write failure should result in 'onWriteError' firing..."]
                    }
                ]
            }
        ]
    }],
    components: {
        bornToLose: {
            type: "gpii.tests.couchdb.cushion.dataSource.asymmetric.bornToLose"
        },
        unwrapped: {
            type: "gpii.tests.couchdb.cushion.dataSource.asymmetric.unwrapped"
        },
        wrapped: {
            type: "gpii.tests.couchdb.cushion.dataSource.asymmetric.wrapped"
        }
    }
});

fluid.defaults("gpii.tests.couch.cushion.dataSource.assymetric.environment", {
    gradeNames: ["gpii.test.pouch.environment"],
    port: "9595",
    pouchConfig: {
        databases: {
            records: {
                data: "%gpii-couch-cushion/tests/data/records.json"
            }
        }
    },
    expected: {
        unwrapped: {
            initialRead: {
                rows: [{"name": "cherry", "color": "red"}, {"name": "raspberry", "color": "red"}, {
                    "name": "strawberry",
                    "color": "red"
                }]
            },
            insert: {},
            update: {},
            readAfterInsert: {
                rows: [{"name": "cherry", "color": "red"}, {"name": "raspberry", "color": "red"}, {
                    "name": "strawberry",
                    "color": "red"
                }, {"name": "tomato", "color": "red"}]
            },
            readAfterUpdate: {
                rows: [{"name": "cherry", "color": "red", "flavor": "sweet"}, {
                    "name": "raspberry",
                    "color": "red"
                }, {"name": "strawberry", "color": "red"}]
            }
        },
        wrapped: {
            insert: {},
            update: {},
            initialRead: {
                rows: [{"_id": "wrapped", "value": {"foo": "bar"}}]
            },
            readAfterInsert: {
                rows: [
                    {"_id": "wrapped", "value": {"foo": "bar"}},
                    {value: {"foo": "bar"}}
                ]
            },
            readAfterUpdate: {
                rows: [{"_id": "wrapped", "value": {"foo": "updated"}}]
            }
        }
    },
    components: {
        caseHolder: {
            type: "gpii.tests.couchdb.cushion.dataSource.asymmetric.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.couch.cushion.dataSource.assymetric.environment");