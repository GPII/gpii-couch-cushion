"use strict";
var fluid = require("infusion");

require("gpii-express");
require("gpii-pouch");

// Load the package content to pick up the locatin of `%gpii-couch-cushion` used below.
require("../../../");

fluid.defaults("gpii.couchdb.cushion.tests.harness", {
    gradeNames: ["gpii.express"],
    pouchPort: "3579",
    config: {
        express: {
            port: "{that}.options.pouchPort"
        }
    },
    events: {
        onPouchStarted: null,
        onAllStarted: {
            events: {
                onStarted:      "onStarted",
                onPouchStarted: "onPouchStarted"
            }
        }
    },
    components: {
        pouch: {
            type: "gpii.pouch",
            options: {
                path: "/",
                databases: {
                    "records": { "data": "%gpii-couch-cushion/tests/data/records.json" }
                },
                listeners: {
                    "onStarted.notifyParent": {
                        func: "{gpii.couchdb.cushion.tests.harness}.events.onPouchStarted.fire"
                    }
                }
            }
        }
    }
});
