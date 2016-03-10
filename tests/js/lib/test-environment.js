// The common test harness wired up as a `fluid.test.testEnvironment` instance.  You are expected to extend this and
// supply a specific test case holder component.
var fluid = require("infusion");

require("./test-harness");

var kettle = require("kettle");
kettle.loadTestingSupport();

fluid.defaults("gpii.couchdb.cushion.tests.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    pouchPort:  "9599",
    baseUrl: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["http://localhost:%port/", { port: "{that}.options.pouchPort"}]
        }
    },
    events: {
        constructServer: null,
        onHarnessDone:   null,
        onHarnessReady:  null,
        onStarted: {
            events: {
                onHarnessReady: "onHarnessReady"
            }
        }
    },
    components: {
        harness: {
            type:          "gpii.couchdb.cushion.tests.harness",
            createOnEvent: "constructServer",
            options: {
                pouchPort: "{testEnvironment}.options.pouchPort",
                listeners: {
                    "onAllStarted.notifyParent": {
                        func: "{testEnvironment}.events.onHarnessReady.fire"
                    }
                }
            }
        }
    }
});
