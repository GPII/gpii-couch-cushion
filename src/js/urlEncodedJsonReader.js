/*

    An extension of `kettle.dataSource.URL` that encodes JSON data using `qs` and adds it to the URL.  Only intended 
    for `read` use.  See the documentation for details:

    https://github.com/GPII/gpii-couch-cushion/blob/master/docs/urlEncodedJsonReader.md

 */
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var Qs = Qs || require("qs");

fluid.registerNamespace("gpii.couchdb.cushion.dataSource.urlEncodedJsonReader");

/**
 *
 * A replacement for the built-in `resolveUrl` invoker included with `kettle.dataSource.URL`, that encodes
 * `directModel` as part of the query string.
 *
 * @param that {Object} The dataSource component itself.
 * @param url {String} The raw URL we will be accessing.
 * @param directModel {Object} The JSON data to be encoded as the query string portion of the URL.
 * @returns {String} The combined URL, including the encoded query data.
 */
gpii.couchdb.cushion.dataSource.urlEncodedJsonReader.resolveUrl = function (that, url, directModel) {
    if (url.indexOf("?") !== -1) {
        fluid.fail("Cannot work with a URL that already includes query data.");
    }
    else if (directModel) {
        return url + "?" + Qs.stringify(directModel, that.options.qsOptions);
    }
    else {
        return url;
    }
};

fluid.defaults("gpii.couchdb.cushion.dataSource.urlEncodedJsonReader", {
    gradeNames: ["kettle.dataSource.URL"],
    writable:   false,
    qsOptions: {
        arrayFormat: "repeat",
        skipNulls:   true
    },
    invokers: {
        resolveUrl: {
            funcName: "gpii.couchdb.cushion.dataSource.urlEncodedJsonReader.resolveUrl",
            args:     ["{that}", "{arguments}.0", "{arguments}.2"] // url, termMap (not used), directModel
        }
    },
    listeners: {
        "onWrite.fail": {
            priority: "first",
            funcName: "fluid.fail",
            args:     ["The urlEncodedJsonReader dataSource can only be used to read content."]
        }
    }
});