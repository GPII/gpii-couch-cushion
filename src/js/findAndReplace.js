
"use strict";
var fluid = require("infusion");

var jqUnit = require("node-jqunit");

fluid.registerNamespace("gpii.couchdb.cushion.findAndReplace");

gpii.couchdb.cushion.findAndReplace.findRecords = function (that, rawRecords) {
    jqUnit.propEqual()
    /*
     jqUnit.assertLeftHand = function (message, expected, actual) {
     jqUnit.assertDeepEq(message, expected, fluid.filterKeys(actual, fluid.keys(expected)));
     };
     */

    /*
     QUnit.propEqual(actual, expected, processMessage(msg));
     */
    // TODO:  Confirm that returning a promise or value is enough for the chain to continue
};

fluid.defaults("gpii.couchdb.cushion.findAndReplace", {
    gradeNames: ["gpii.couchdb.cushion.dataSource.asymmetric", "gpii.couchdb.cushion.dataSource.asymmetric.noWrapper"],
    // You can pass auth credentials as part of `hostname`...
    hostname:   "localhost",
    port:       5984,
    protocol:   "http",
    readUrl:    {
        expander: {
            funcName: "fluid.stringTemplate",
            args: ["%protocol:%hostname:%port/%db/_all_docs", "{that}.options"]
        }
    },
    listeners: {
        onRead: [
            {
                nameSpace: "findAndReplaceFilter",
                priority:  "after:CouchDB",
                funcName:  "gpii.couchdb.cushion.findAndReplace.findRecords",
                args:      ["{that}", "{arguments}.0"]
            },
            //{
            //    nameSpace: "findAndReplaceReplace",
            //    priority: "after:findAndReplaceFilter"
            //}
        ]
    }
});


gpii.couchdb.cushion.findAndReplace({
    db: "ul",
    fieldsMustMatch: {
        "description": "-Machine translation-"
    }
});