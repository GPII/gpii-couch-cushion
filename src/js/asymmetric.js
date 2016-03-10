/*

    An "asymmetric" dataSource designed to read from a CouchDB view, list, show, etc. and to write to CouchDB's
    document API. See the documentation for details:

    https://github.com/the-t-in-rtf/gpii-couch-cushion/blob/GPII-1253/docs/asymmetric.md

 */
"use strict";
var fluid = fluid || require("infusion");

require("kettle");

require("./lib/transformEach");

fluid.defaults("gpii.couchdb.cushion.asymmetricDataSource", {
    gradeNames: ["fluid.component"],
    events: {
        onRead:       null,
        onReadError:  null,
        onWrite:      null,
        onWriteError: null
    },
    readTermMap:  {},
    writeTermMap: {
        _id: "%_id"
    },
    components: {
        getter: {
            type: "kettle.dataSource.URL",
            options: {
                gradeNames: "kettle.dataSource.CouchDB",
                writable: false,
                model: {
                    getModel: true
                },
                rules: {
                    // The default rules pull out the inner values from a CouchDB list.  See the docs for examples.
                    readPayload: {
                        "rows": {
                            transform: {
                                type: "fluid.transforms.transformEach",
                                inputPath: "rows",
                                rules: {
                                    "": "value"
                                }
                            }
                        }
                    }
                },
                url:         "{gpii.couchdb.cushion.asymmetricDataSource}.options.readUrl",
                termMap:     "{gpii.couchdb.cushion.asymmetricDataSource}.options.readTermMap",
                listeners: {
                    "onError.notifyParent": {
                        func: "{gpii.couchdb.cushion.asymmetricDataSource}.events.onReadError.fire"
                    },
                    "onRead.notifyParent": {
                        func: "{gpii.couchdb.cushion.asymmetricDataSource}.events.onRead.fire"
                    }
                }
            }
        },
        setter: {
            type: "kettle.dataSource.URL",
            options: {
                gradeNames: "kettle.dataSource.CouchDB",
                writable: true,
                model: {
                    setModel: true
                },
                url:         "{gpii.couchdb.cushion.asymmetricDataSource}.options.writeUrl",
                termMap:     "{gpii.couchdb.cushion.asymmetricDataSource}.options.writeTermMap",
                listeners: {
                    "onError.notifyParent": {
                        func: "{gpii.couchdb.cushion.asymmetricDataSource}.events.onWriteError.fire"
                    },
                    "onWrite.notifyParent": {
                        func: "{gpii.couchdb.cushion.asymmetricDataSource}.events.onWrite.fire"
                    }
                }
            }
        }
    },
    invokers: {
        get: {
            func: "{getter}.get"
            // args: directModel, options/callback
        },
        set: {
            func: "{setter}.set"
            // args: directModel, model, options/callback
        }
    }
});

// A mix-in grade to override the default "value" wrapping for the "write" payload and encode the full record instead.
fluid.defaults("gpii.couchdb.cushion.asymmetricDataSource.noWrapper", {
    components: {
        setter: {
            options: {
                rules: {
                    writePayload: {
                        "": ""
                    },
                    readPayload: {
                        "": ""
                    }
                }
            }
        }
    }
});