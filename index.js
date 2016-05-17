"use strict";
var fluid = require("infusion");

require("./src/js/asymmetric");
require("./src/js/urlEncodedJsonReader");

fluid.module.register("gpii-couch-cushion", __dirname, require);

