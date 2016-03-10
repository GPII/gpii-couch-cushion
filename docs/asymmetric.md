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

# `gpii.couchdb.cushion.asymmetricDataSource`

This component is a wrapper around two separate dataSources.  It acts like a single (writable) dataSource, which is
accomplished by:

1. Passing through the supported options to the underlying dataSources.  Where there are conflicting options for the two underlying grades, they are differentiated by adding separate "read" and "write" options.  See "Component Options" below for details.
2. Passing through calls to its `get` and `set` invokers (see below) to the appropriate underlying dataSource.
3. Passing through events from the underlying dataSources.  It fires its own `onRead` and `onWrite` events when the corresponding events are fired by the underlying dataSources.  As each dataSource has an `onError` event, this component fires `onReadError` for read errors, and `onWriteError` for write errors.

## Component Options

The following component configuration options are supported:

| Option              | Type     | Description |
| ------------------- | -------- | ----------- |
| `rules.readPayload` | `Object` | [Model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) that control how the raw data from CouchDb is presented via our `onRead` event. |
| `rules.writePayload` | `Object` | [Model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html) that control how model data is passed to CouchDb when the `set` invoker is called. |

## Component invokers

### `{that}.get(directModel, options/callback)`

* `directModel`: `Object` A JSON structure holding the "coordinates" of the state to be read.  This model is morally equivalent to (the substitutable parts of) a file path or URL.
* `options`: `Object` (Optional) A JSON structure holding configuration options good for just this request. These will be specially interpreted by the particular concrete grade of DataSource
* `callback`: `Function` A callback to be executed when the `get` request completes.
* Returns: `Promise` A promise representing successful or unsuccessful resolution of the read state.  You may also listen to the `onRead` and `onReadError` events to receive the results of this request.

### `{that}.set(directModel, model, options/callback)`

* `directModel`: `Object` A JSON structure holding the "coordinates" of the state to be read.  This model is morally equivalent to (the substitutable parts of) a file path or URL.
* `model`: `Object` The "model" data to be transformed and then stored in CouchDB.
* `options`: `Object` (Optional) A JSON structure holding configuration options good for just this request. These will be specially interpreted by the particular concrete grade of DataSource
* `callback`: `Function` A callback to be executed when the `set` request completes.
* Returns: `Promise` A promise representing resolution of the written state,  which may also optionally resolve to any returned payload from the write process.  You may also listen to the `onWrite` and `onWriteError` events to receive the results of this request.

