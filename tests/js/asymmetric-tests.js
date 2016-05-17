"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var jqUnit = require("node-jqunit");

require("../../");
require("./lib/");

// TODO:  Update to use the common grades in %gpii-pouchdb

fluid.registerNamespace("gpii.couchdb.cushion.tests.dataSource.asymmetric");
gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput = function (message, output, expected) {
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

fluid.defaults("gpii.couchdb.cushion.tests.dataSource.asymmetric.base", {
    gradeNames: ["gpii.couchdb.cushion.dataSource.asymmetric"],
    endpoint: "_design/lookup/_view/byColor?startkey=%5B%22%color%22%2C%20%22aaa%22%5D&endkey=%5B%22%color%22%2C%20%22zzz%22%5D",
    readTermMap: {
        color: "%color"
    },
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["http://localhost:%port/records/", { port: "{testEnvironment}.options.pouchPort"}]
        }
    },
    readUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%baseUrl%endpoint", { baseUrl: "{gpii.couchdb.cushion.tests.dataSource.asymmetric.base}.options.baseUrl", endpoint: "{gpii.couchdb.cushion.tests.dataSource.asymmetric.base}.options.endpoint"}]
        }
    },
    writeUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            // `%_id` will be replaced by a variable coming from our `directModel`.
            args: ["%baseUrl%_id", { baseUrl: "{gpii.couchdb.cushion.tests.dataSource.asymmetric.base}.options.baseUrl" }]
        }
    }
});

// A grade to test the "no wrapper" mix-in grade.
fluid.defaults("gpii.couchdb.cushion.tests.dataSource.asymmetric.unwrapped", {
    gradeNames: ["gpii.couchdb.cushion.tests.dataSource.asymmetric.base", "gpii.couchdb.cushion.dataSource.asymmetric.noWrapper"]
});

// A grade to confirm that the default "value" wrapper is preserved.
fluid.defaults("gpii.couchdb.cushion.tests.dataSource.asymmetric.wrapped", {
    gradeNames: ["gpii.couchdb.cushion.tests.dataSource.asymmetric.base"],
    endpoint:   "_design/lookup/_view/wrapped" // Custom view to only show "wrapped" records
});

// A grade that can only hope to fail.
fluid.defaults("gpii.couchdb.cushion.tests.dataSource.asymmetric.bornToLose", {
    gradeNames: ["gpii.couchdb.cushion.tests.dataSource.asymmetric.base"],
    readUrl:    "http://not.found/bad/path/",
    writeUrl:   "http://not.found/bad/path/"
});

fluid.defaults("gpii.couchdb.cushion.tests.dataSource.asymmetric.caseHolder", {
    gradeNames: ["gpii.couchdb.cushion.tests.caseHolder"],
    rawModules: [{
        tests: [
            {
                name: "The default 'value' wrapper should be able to read existing data...",
                type: "test",
                sequence: [
                    {
                        func: "{wrapped}.get"
                    },
                    {
                        listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
                        event:    "{wrapped}.events.onRead",
                        args:     ["Data read from the 'value' wrapper should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.wrapped.initialRead"] // message, output, expected
                    }
                ]
            },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The default 'value' wrapper should be able to insert a new record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{wrapped}.set",
            //            args: [null, { _id: "foo", foo: "bar"}]
            //        },
            //        {
            //            listener: "fluid.identity",
            //            event:    "{wrapped}.events.onWrite"
            //        },
            //        {
            //            func: "{wrapped}.get"
            //        },
            //        {
            //            listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
            //            event:    "{wrapped}.events.onRead",
            //            args:     ["Data read after writing with the default grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.wrapped.readAfterInsert"] // message, output, expected
            //        }
            //    ]
            //},
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The default 'value' wrapper should be able to update an existing record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{wrapped}.set",
            //            args: [{ _id: "wrapped"}, { foo: "bar", updated: true }]
            //        },
            //        {
            //            listener: "fluid.identity",
            //            event:    "{wrapped}.events.onWrite"
            //        },
            //        {
            //            func: "{wrapped}.get"
            //        },
            //        {
            //            listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
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
                        args: [{ color: "red" }]
                    },
                    {
                        listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
                        event:    "{unwrapped}.events.onRead",
                        args:     ["Data read from the `noWrapper` grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.unwrapped.initialRead"] // message, output, expected
                    }
                ]
            },
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The `noWrapper` grade should be able to insert a new record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{unwrapped}.set",
            //            args: [null, { _id: "tomato", name: "tomato", color: "red"}]
            //        },
            //        {
            //            listener: "fluid.identity",
            //            event:    "{unwrapped}.events.onWrite"
            //        },
            //        {
            //            func: "{unwrapped}.get",
            //            args: [{ color: "red" }]
            //        },
            //        {
            //            listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
            //            event:    "{unwrapped}.events.onRead",
            //            args:     ["Data read after a writing with the `noWrapper` grade should be as expected...", "{arguments}.0", "{testEnvironment}.options.expected.unwrapped.readAfterInsert"] // message, output, expected
            //        }
            //    ]
            //},
            // TODO:  The model data is empty and as a result "inserts" and "updates" never work.  Review with Antranig
            //{
            //    name: "The `noWrapper` grade should be able to update an existing record...",
            //    type: "test",
            //    sequence: [
            //        {
            //            func: "{unwrapped}.set",
            //            args: [{ _id: "cherry" }, { name: "cherry", color: "red", flavor: "sweet" }] // directModel (used for lookup?), model (to be set?), options/callback (not used by me)
            //        },
            //        {
            //            listener: "fluid.identity",
            //            event:    "{unwrapped}.events.onWrite"
            //        },
            //        {
            //            func: "{unwrapped}.get",
            //            args: [{ color: "red" }]
            //        },
            //        {
            //            listener: "gpii.couchdb.cushion.tests.dataSource.asymmetric.checkOutput",
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
            type: "gpii.couchdb.cushion.tests.dataSource.asymmetric.bornToLose"
        },
        unwrapped: {
            type: "gpii.couchdb.cushion.tests.dataSource.asymmetric.unwrapped"
        },
        wrapped: {
            type: "gpii.couchdb.cushion.tests.dataSource.asymmetric.wrapped"
        }
    }
});

gpii.couchdb.cushion.tests.environment({
    pouchPort: "9595",
    expected: {
        unwrapped: {
            initialRead: {
                rows: [{ "name": "cherry", "color": "red" }, { "name": "raspberry", "color": "red"}, { "name": "strawberry", "color": "red" }]
            },
            readAfterInsert: {
                rows: [{ "name": "cherry", "color": "red" }, { "name": "raspberry", "color": "red"}, { "name": "strawberry", "color": "red" }, { "name": "tomato", "color": "red" }]
            },
            readAfterUpdate: {
                rows: [{ "name": "cherry", "color": "red", "flavor": "sweet" }, { "name": "raspberry", "color": "red"}, { "name": "strawberry", "color": "red" }]
            }
        },
        wrapped: {
            initialRead: {
                rows: [{ "_id": "wrapped", "value": { "foo": "bar"} }]
            },
            readAfterInsert: {
                rows: [
                    { "_id": "wrapped", "value": { "foo": "bar"} },
                    { value: { "foo": "bar"} }
                ]
            },
            readAfterUpdate: {
                rows: [{ "_id": "wrapped", "value": { "foo": "updated"} }]
            }
        }
    },
    components: {
        caseHolder: {
            type: "gpii.couchdb.cushion.tests.dataSource.asymmetric.caseHolder"
        }
    }
});