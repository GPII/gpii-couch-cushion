"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("gpii-express");
gpii.express.loadTestingSupport();

// Empty "marker" grade for now.  Kept in case we end up needing different start and end sequences, so that we can
// change everything once rather than updating each definition.
fluid.defaults("gpii.couchdb.cushion.tests.caseHolder", {
    gradeNames: ["gpii.express.tests.caseHolder"]
});