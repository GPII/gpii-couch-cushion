/*

    An "asymmetric" dataSource designed to read from a CouchDB view, list, show, etc. and to write to CouchDB's
    document API. See the documentation for details:

    https://github.com/GPII/gpii-couch-cushion/blob/master/docs/asymmetric.md

 */
// TODO:  Discuss with Antranig how best to break this down properly into a writable and read-only grade.
"use strict";
var fluid = fluid || require("infusion");

fluid.require("%kettle");

require("./lib/transformEach");

// TODO:  Update this to pass in "reader" grades so that we can easily use either a raw `kettle.dataSource.URL` or our own `urlEncodedJsonReader`.

fluid.defaults("gpii.couchdb.cushion.dataSource.asymmetric", {
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
                url:         "{gpii.couchdb.cushion.dataSource.asymmetric}.options.readUrl",
                termMap:     "{gpii.couchdb.cushion.dataSource.asymmetric}.options.readTermMap",
                listeners: {
                    "onError.notifyParent": {
                        func: "{gpii.couchdb.cushion.dataSource.asymmetric}.events.onReadError.fire"
                    },
                    "onRead.notifyParent": {
                        func: "{gpii.couchdb.cushion.dataSource.asymmetric}.events.onRead.fire"
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
                url:         "{gpii.couchdb.cushion.dataSource.asymmetric}.options.writeUrl",
                termMap:     "{gpii.couchdb.cushion.dataSource.asymmetric}.options.writeTermMap",
                listeners: {
                    "onError.notifyParent": {
                        func: "{gpii.couchdb.cushion.dataSource.asymmetric}.events.onWriteError.fire"
                    },
                    "onWrite.notifyParent": {
                        func: "{gpii.couchdb.cushion.dataSource.asymmetric}.events.onWrite.fire"
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
fluid.defaults("gpii.couchdb.cushion.dataSource.asymmetric.noWrapper", {
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