# `gpii.couchdb.cushion.datasources.urlEncodedJsonReader`

This component extends [`kettle.dataSource.URL`](https://github.com/amb26/kettle/blob/KETTLE-32/docs/DataSources.md),
addingthe ability to request data using a complex query string.  When calling the default `get` invoker, the standard
`directModel` option will be encoded using [Qs](https://github.com/ljharb/qs) and appended to `options.url`.

Within Node, this dataSource is intended for use with the implicit query parsing middleware built into Express.js,
which uses `qs` to parse incoming query strings and make them available under the `request.query` variable.

Although there are currently no client-side dataSources, the unique parts of this grade are written with in-browser
usage in mind as a long-term goal.  Once an in-browser equivalent of `kettle.dataSource.URL` is available, this grade
will be updated to include documentation and tests for in-browser usage.

# Usage Examples

Let's suppose you would like to pass a list of keys to a CouchDB View.  You might use code like the
following:

```
fluid.defaults("my.dataSource", {
    gradeNames: ["gpii.couchdb.cushion.datasources.urlEncodedJsonReader"],
    url: "http://localhost:6789/rest/endpoint"
    invokers: {
        "onRead.log": {
            funcName: "fluid.log",
            priority: "last",
            args: ["OUTPUT:", "{arguments}.0"]
        }
    }
});

var dataSource = my.dataSource();
dataSource.get({ keys: [1, 2, null, undefined]});
```
This example grade makes a request and then logs the results.  Based on the supplied data, the call to the `get`
invoker makes a GET request to the following URL:

`http://localhost:6789/rest/endpoint?keys=1&keys=2`

Note that the `null` and `undefined` options were stripped based on the default options passed to `Qs.stringify` (see below).

Let's look at a more complex example with deeper structures:

```
// See above

dataSource.get({ foo: "bar", baz: { qux: [1, 2] }});
```

In this case, the GET request would use the following URL:

`http://localhost:6789/rest/endpoint?foo=bar&baz%5Bqux%5D=1&baz%5Bqux%5D=2"

Although our default options were able to simplify the first example to avoid using square brackets, the deep variable
`baz.qux` in the second example has to be represented using fuller notation.  See
[the documentation for `qs.stringify`](https://github.com/ljharb/qs#stringifying) for full details.

It is important to note that although `Qs` and Express can preserve deep structure, the final values can only be passed
as strings.  As an example:

```
dataSource.get({ keys: [1, true, "string", null, undefined]});

// The server ends up with string values, as in: { keys: ["1", "true", "string"] }
```

You are expected to convert the received values into booleans, numbers, etc. as required.

# Component Options

This component supports all of the options of `kettle.dataSource.URL`, but is designed to fail if it is ever used to
write content (see below).  In addition, the following unique options are supported:


| Option      | Type       | Description |
| ----------- | ---------- | ----------- |
| `qsOptions` | `{Object}` | The configuration options to be passed to [`qs.stringify`](https://github.com/ljharb/qs#stringifying).  The defaults use multiple values for array data rather than square brackets, and strip null values.   The defaults also only support 5 levels of depth in your object. |

# Component Invokers

This component inherits most of its invokers from `kettle.dataSource.URL`, with the following exceptions.

## `{that}.resolveUrl(url, termMap, directModel)`

* `url`: `String` The raw URL string to be resolved.
* `termMap`: `Object` The unused `termMap` parameter from the underlying invoker, which is allowed here but ignored.
* `directModel`: `Object` A JSON structure that represents the data to be passed as part of the combined URL.
* Returns: `String` A URL that represents the original `url` combined with the encoded data from `directModel`.

## `{that}.write`

Although the write invoker of the underlying grade is not modified, this grade includes an implicit listener for the
`onWrite` event that calls `fluid.fail`.  This is intended to prevent the use of this grade with "writable" `dataSource`
grades.