/*

    A `fluid.standardOutputTransformFunction` to transform each element of an array or map using standard transformation
    rules. See the documentation for details:

    https://github.com/the-t-in-rtf/gpii-couch-cushion/blob/GPII-1253/docs/transformEach.md

    TODO:  Discuss submitting this as a PR to be added to: https://github.com/fluid-project/infusion/blob/master/src/framework/core/js/ModelTransformationTransforms.js

 */
"use strict";
var fluid = fluid || require("infusion");

fluid.defaults("fluid.transforms.transformEach", {
    gradeNames: "fluid.standardTransformFunction"
});

/**
 *
 * @param valuesToTransform {Object}  The array or map of raw values.
 * @param transformSpec {Object} The transform configuration passed to us by the `StandardTransformFunction` infrastructure.
 * @returns {Object} The transformed array or map.
 *
 */
fluid.transforms.transformEach = function (valuesToTransform, transformSpec) {
    var transformedArray = Array.isArray(valuesToTransform) ? [] : {};
    fluid.each(valuesToTransform, function (valueToTransform, key) {
        transformedArray[key] = fluid.model.transformWithRules(valueToTransform, transformSpec.rules, transformSpec.options);
    });

    return transformedArray;
};