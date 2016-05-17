# fluid.transforms.transformEach

This package provides `fluid.transforms.transformEach`, which is a `fluid.standardTransformFunction`.  This function
iterates through a map or array and transforms each of its values using [model transformation rules](http://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html).

It provides a single package definition and function, which is intended to be added to the definition of one or more
model transformation rules that will be passed to `fluid.model.transformWithRules`.  It is provided in this package to
assist in manipulating the results returned by CouchDB API endpoints that return arrays of records, such as:

1. A [CouchDB view](https://wiki.apache.org/couchdb/Introduction_to_CouchDB_views).
2. The CouchDB [`_all_docs`](http://docs.couchdb.org/en/stable/api/database/bulk-api.html) endpoint provided for each database.

See the examples below for more details.

# Examples

You can use model transformation rules to add, remove, or change material found anywhere in the original object.  Here
are a couple of practical examples of using the `fluid.transforms.transformEach` method with CouchDB view data.

## Example 1: Stripping CouchDB enclosing structures

Let's assume that you have a deep structure like the following snippet taken from CouchDB view output:

```
{
  "total_rows": 2,
  "offset": 0,
  "rows": [
    {
      "key": [
        "red",
        "cherry"
      ],
      "id": "9FF6EF7A-1E2E-CC8B-A033-86322666907D",
      "value": {
        "name": "cherry",
        "color": "red",
        "_id": "9FF6EF7A-1E2E-CC8B-A033-86322666907D",
        "_rev": "1-a98a66d0e464feea12b11de909075ae9"
      }
    },
    {
      "key": [
        "red",
        "raspberry"
      ],
      "id": "raspberry",
      "value": {
        "name": "raspberry",
        "color": "red",
        "_id": "raspberry",
        "_rev": "1-2647671cd23d0b573d2c5731290ca3d2"
      }
    }
  ]
}
```

The CouchDB view API by default wraps whatever you emit in your `map` function in a `value` element.  If you add the
`include_docs=true` option when calling the same API, you would get output like:

```
{
  "total_rows": 2,
  "offset": 0,
  "rows": [
    {
      "key": [
        "red",
        "cherry"
      ],
      "id": "cherry",
      "value": {
        "name": "cherry",
        "color": "red",
        "_id": "cherry",
        "_rev": "1-a7e42944924a8c3aa4c87e90c90a2011"
      },
      "doc": {
        "name": "cherry",
        "color": "red",
        "_id": "cherry",
        "_rev": "1-a7e42944924a8c3aa4c87e90c90a2011"
      }
    },
    {
      "key": [
        "red",
        "raspberry"
      ],
      "id": "raspberry",
      "value": {
        "name": "raspberry",
        "color": "red",
        "_id": "raspberry",
        "_rev": "1-2647671cd23d0b573d2c5731290ca3d2"
      },
      "doc": {
        "name": "raspberry",
        "color": "red",
        "_id": "raspberry",
        "_rev": "1-2647671cd23d0b573d2c5731290ca3d2"
      }
    }
  ]
}
```

First, Let's assume that you only care about the record data stored in `rows`.  Let's also assume that you want to use
the value of `doc` if available, and the value of `value` if not.  To take care of both these things, you can use rules
like the following:

```
{
  "": {
    transform: {
      type: "fluid.transforms.transformEach",
      inputPath: "rows",
      rules: {
        "": {
          transform: {
            type:   "fluid.transforms.firstValue",
            values: ["doc", "value"]
          }
        }
      }
    }
  }
}
```

If you run `fluid.model.transformWithRules(<EITHER VIEW OUTPUT SNIPPET SHOWN ABOVE>, <RULES SHOWN ABOVE>)`, you will get
output like:

```
[
  {
    "name": "cherry",
    "color": "red",
    "_id": "cherry",
    "_rev": "1-a7e42944924a8c3aa4c87e90c90a2011"
  },
  {
    "name": "raspberry",
    "color": "red",
    "_id": "raspberry",
    "_rev": "1-2647671cd23d0b573d2c5731290ca3d2"
  }
]
```

## Example 2: Generating `bulk_docs` input from an existing CouchDB view

CouchDB provides a [bulk documents API endpoint](https://wiki.apache.org/couchdb/HTTP_Bulk_Document_API#Modify_Multiple_Documents_With_a_Single_Request)
that allows you to add or update multiple documents in a single request.  Let's say that you want to get all the data in
an existing view, modify each record to add a new field, and then end up with output that can be fed into the bulk
documents API.  Again, let's assume that we're starting with view output like:

```
{
  "total_rows": 2,
  "offset": 0,
  "rows": [
    {
      "key": [
        "red",
        "cherry"
      ],
      "id": "9FF6EF7A-1E2E-CC8B-A033-86322666907D",
      "value": {
        "name": "cherry",
        "color": "red",
        "_id": "9FF6EF7A-1E2E-CC8B-A033-86322666907D",
        "_rev": "1-a98a66d0e464feea12b11de909075ae9"
      }
    },
    {
      "key": [
        "red",
        "raspberry"
      ],
      "id": "raspberry",
      "value": {
        "name": "raspberry",
        "color": "red",
        "_id": "raspberry",
        "_rev": "1-2647671cd23d0b573d2c5731290ca3d2"
      }
    }
  ]
}
```

We need to end up with output like the following example taken from the CouchDB docs:

```
{
  "docs": [
    {"_id": "0", "integer": 0, "string": "0"},
    {"_id": "1", "integer": 1, "string": "1"},
    {"_id": "2", "integer": 2, "string": "2"}
  ]
}
```

To generate this from what we have, we could use rules like:

```
{
  "docs": {
    transform: {
      type: "fluid.transforms.transformEach",
      inputPath: "rows",
      rules: {
        "": {
          transform: {
            type:   "fluid.transforms.firstValue",
            values: ["doc", "value"]
          }
        },
        "status": {
          transform: {
            literalValue: "flagged"
          }
        }
      }
    }
  }
}
```

If we run `fluid.model.transformWithRules(<VIEW SNIPPET ABOVE>, <RULES ABOVE>)`, we'll get output like:

```
{
  "docs": [
    {
      "name": "cherry",
      "color": "red",
      "_id": "cherry",
      "_rev": "1-a7e42944924a8c3aa4c87e90c90a2011",
      "status": "flagged"
    },
    {
      "name": "raspberry",
      "color": "red",
      "_id": "raspberry",
      "_rev": "1-2647671cd23d0b573d2c5731290ca3d2",
      "status": "flagged"
    }
  ]
}
```

As the output already contains all the necessary `_id` and `_rev` values, We can upload this output directly to the bulk 
documents API.