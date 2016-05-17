// A convenience script to start up a copy of the test harness for manual QA.
var fluid = require("infusion");
fluid.setLogging(true);

var gpii = fluid.registerNamespace("gpii");

require("./lib/test-harness");

gpii.couchdb.cushion.tests.harness({
    pouchPort:  "9599"
});