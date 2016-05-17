# The "asymmetric" CouchDB dataSource

The [`kettle.dataSource.CouchDB`](https://github.com/fluid-project/kettle/blob/master/lib/dataSource.js#L399) grade
included with [Kettle](https://github.com/fluid-project/kettle/) is designed to interact directly with the [CouchDB
document REST API](https://wiki.apache.org/couchdb/HTTP_Document_API).  It works for cases in which you know the CouchDB
`_id` of the record up front.  It also stores data wrapped in a `value` element.

This `dataSource` is "asymmetric" because it reads from one type of `dataSource` (the default is
[`kettle.dataSource.URL`](https://github.com/amb26/kettle/blob/KETTLE-32/lib/dataSource.js#L300)), and writes to another
(a plain `kettle.dataSource.CouchDB` grade).

The "asymmetric" CouchDB dataSource provided by this package is designed for cases in which you wish to read from
something other than CouchDB's document API, for example:

1. [A `list` or `show` function](https://wiki.apache.org/couchdb/Formatting_with_Show_and_List) provided by a CouchDB design document.
2. Output from something like [`couchdb-lucene`](https://github.com/rnewson/couchdb-lucene) (which provides Lucene search integration with CouchDB).

# `gpii.couchdb.cushion.dataSource.asymmetric`

This component is a wrapper around two separate dataSources.  It:

1. Passes through the supported options to the underlying dataSources.  Where there are conflicting options for the two underlying grades, they are differentiated by adding separate "read" and "write" options.  See "Component Options" below for details.
2. Passes through calls to its `get` and `set` invokers (see below) to the appropriate underlying dataSource.
3. Passes through events from the underlying dataSources.  It fires its own `onRead` and `onWrite` events when the corresponding events are fired by the underlying dataSources.  As each dataSource has an `onError` event, this component fires `onReadError` for read errors, and `onWriteError` for write errors.

Please note that unlike a standard writable CouchDB `kettle.dataSource`, the `set` invoker does not make use of the
`get` invoker.  Instead, the `setter` component uses its own `get` invoker, which is not exposed.


# How are you meant to use this?

If you only need to read data from a CouchDB view, this component doesn't offer much value versus using a
`kettle.datasource.URL` component.  In fact, this component's' `getter` is just an instance of that grade.  You should
use this grade if you ultimate want to _make changes_ to one or more of the records you look up.

To make this component do something meaningful, you will need to add at least one listener to this component's `onRead`
event that makes whatever changes you want and passes along each new or update record to the `set` invoker.  For an
example, see [the `findAndReplace` component](findAndReplace.md) included in this package.

## Component Options

The following component configuration options are supported:

| Option               | Type     | Description |
| -------------------- | -------- | ----------- |
| `readTermMap`        | `Object` | A map of placeholder variables and their corresponding value in the `directModel` object passed to `get` (see below). |
| `readUrl`            | `String` | The URL used by the `getter` component to read content.  May contain string template variables (see the `get` example below). |
| `rules.readPayload`  | `Object` | [Model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) that control how the raw data from CouchDb is presented via our `onRead` event. |
| `rules.writePayload` | `Object` | [Model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) that control how model data is passed to CouchDb when the `set` invoker is called. |
| `writeTermMap`       | `Object` | A map of placeholder variables and their corresponding value in the `directModel` object passed to `set` (see below). |
| `writeUrl`           | `String` | The URL used by the `setter` component to retrieve the existing record and PUT or POST the updated content.  This is expected to be a CouchDB endpoint like `http://localhost:5984/db/%id`.  May contain string template variables (see the `get` example below). |

## Component invokers

### `{that}.get(directModel, options/callback)`

* `directModel`: `Object` A JSON structure holding the "coordinates" of the state to be read.  This model is morally equivalent to (the substitutable parts of) a file path or URL.
* `options`: `Object` (Optional) A JSON structure holding configuration options good for just this request. These will be specially interpreted by the particular concrete grade of DataSource
* `callback`: `Function` A callback to be executed when the `get` request completes.
* Returns: `Promise` A promise representing successful or unsuccessful resolution of the read state.  You may also listen to the `onRead` and `onReadError` events to receive the results of this request.

This invoker is designed to look up one or more records from a URL, for example a CouchDB view.  The object passed in
`directModel` is used in combination with `readTermMap` to add variable content to the lookup URL.  For example, let's
assume you want to look up all records whose key is equal to `foo`.  Your `options.readUrl` might look something like:

`http://localhost:5984/db/_design/doc/_view/myView?key="%key"`.

Your `options.readTermMap` might look something like:

`{ key: "%key" }`

The `directModel` passed to this invoker might look something like:

`{ key: "foo" }`

This would result in retrieving the URL with the specified key, as in:

`http://localhost:5984/db/_design/doc/_view/myView?key="foo"`

This is the mechanism that lets you supply simple [CouchDB view query parameters](https://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options).
See [KETTLE-41](https://issues.fluidproject.org/browse/KETTLE-41) for the discussion around supporting array variables.

### `{that}.set(directModel, model, options/callback)`

* `directModel`: `Object` A JSON structure holding the "coordinates" of the state to be read.  This model is morally equivalent to (the substitutable parts of) a file path or URL.
* `model`: `Object` The "model" data to be transformed and then stored in CouchDB.
* `options`: `Object` (Optional) A JSON structure holding configuration options good for just this request. These will be specially interpreted by the particular concrete grade of DataSource
* `callback`: `Function` A callback to be executed when the `set` request completes.
* Returns: `Promise` A promise representing resolution of the written state,  which may also optionally resolve to any returned payload from the write process.  You may also listen to the `onWrite` and `onWriteError` events to receive the results of this request.

This invoker is designed to update a single record.  The object passed in `directModel` is used in combination with
`options.writeTermMap` to look up the original record.  The object passed in `model` is used to update the value.  You
can pass the same object twice as long as it contains the variables needed to look up the original record.  See `get`
above for an example.