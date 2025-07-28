import RandExp from 'randexp';

/** @typedef {import('./generateMarkdown').Schema} Schema */

/**
 * Get an example string value based on the schema
 * @param {Schema} schema 
 * @param {(ref: string) => Schema} resolveRef 
 * @returns {string}
 */
const getStringExample = (schema, resolveRef) => {
  const randexp = (pattern) => {
    try {
      const patternSanitizer =
        /(?<=(?<!\\)\{)(\d{3,})(?=\})|(?<=(?<!\\)\{\d*,)(\d{3,})(?=\})|(?<=(?<!\\)\{)(\d{3,})(?=,\d*\})/g
      const safePattern = pattern.replace(patternSanitizer, "100")
      const randexpInstance = new RandExp(safePattern)
      randexpInstance.max = 100
      return randexpInstance.gen()
    } catch {
      return "string"
    }
  }

  const applyStringConstraints = (string, constraints) => {
    const { maxLength, minLength } = constraints
    let constrainedString = string
  
    if (Number.isInteger(maxLength) && maxLength > 0) {
      constrainedString = constrainedString.slice(0, maxLength)
    }
    if (Number.isInteger(minLength) && minLength > 0) {
      let i = 0
      while (constrainedString.length < minLength) {
        constrainedString += constrainedString[i++ % constrainedString.length]
      }
    }
  
    return constrainedString
  }

  const mediaTypeExamples = {
    "application/json": '{"key":"value"}',
    "application/ld+json": '{"name": "John Doe"}',
    "application/x-httpd-php": "<?php echo '<p>Hello World!</p>'; ?>",
    "application/rtf": `{\\rtf1\\adeflang1025\\ansi\\ansicpg1252\\uc1`,
    "application/x-sh": 'echo "Hello World!"',
    "application/xhtml+xml": "<p>content</p>",
    "text/css": ".selector { border: 1px solid red }",
    "text/csv": "value1,value2,value3",
    "text/html": "<p>content</p>",
    "text/calendar": "BEGIN:VCALENDAR",
    "text/javascript": "console.dir('Hello world!');",
    "text/xml": '<person age="30">John Doe</person>',
  }

  const { contentEncoding, contentMediaType, contentSchema } = schema
  const { pattern, format } = schema
  let generatedString = "string";

  if (typeof pattern === "string") {
    generatedString = applyStringConstraints(randexp(pattern), schema)
  } else if (typeof format === "string") {
    switch (format) {
      case "date-time":
        generatedString = "2018-11-13T20:20:39+00:00";
        break;
      case "time":
        generatedString = "20:20:39+00:00";
        break;
      case "date":
        generatedString = "2018-11-13";
        break;
      case "duration":
        generatedString = `P3D`;
        break;
      case "email":
        generatedString = "user@example.com";
        break;
      case "idn-email":
        generatedString = "실례@example.com";
        break;
      case "hostname":
        generatedString = "example.com";
        break;
      case "idn-hostname":
        generatedString = "실례.com";
        break;
      case "ipv4":
        generatedString = `198.51.100.42`;
        break;
      case "ipv6":
        generatedString = "2001:0db8:5b96:0000:0000:426f:8e17:642a";
        break;
      case "uuid":
        generatedString = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
        break;
      case "uri":
        generatedString = "https://example.com/";
        break;
      case "uri-reference":
        generatedString = "path/index.html";
        break;
      case "iri":
        generatedString = "https://실례.com/";
        break;
      case "iri-reference":
        generatedString = "path/실례.html";
        break;
      case "uri-template":
        generatedString = "https://example.com/dictionary/{term:1}/{term}";
        break;
      case "json-pointer":
        generatedString = "/a/b/c";
        break;
      case "relative-json-pointer":
        generatedString = `1/0`;
        break;
      case "regex":
        generatedString = "^[a-z]+$";
        break;
      case "password":
        generatedString = "********";
        break;
    }
  } else if (
    typeof contentSchema === "object" &&
    typeof contentMediaType === "string"
  ) {
    generatedString = getSchemaExample(schema.contentSchema, 0, resolveRef);
    if (contentMediaType.endsWith("json"))
      generatedString = JSON.stringify(generatedString);
    else
      generatedString = generatedString.toString();
  } else if (typeof contentMediaType === "string") {
    generatedString = mediaTypeExamples[contentMediaType] ?? generatedString;
  } else {
    generatedString = applyStringConstraints(generatedString, schema)
  }

  if (contentEncoding === "base64") {
    return btoa(generatedString);
  } else {
    return generatedString;
  }
}

/**
 * Constrain a numeric example based on a schema
 * @param {number} number 
 * @param {Schema} constraints 
 * @returns {number}
 */
const applyNumberConstraints = (number, constraints = {}) => {
  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum } = constraints
  const { multipleOf } = constraints
  const epsilon = Number.isInteger(number) ? 1 : Number.EPSILON;
  let minValue = typeof minimum === "number" ? minimum : null
  let maxValue = typeof maximum === "number" ? maximum : null
  let constrainedNumber = number

  if (typeof exclusiveMinimum === "number") {
    minValue =
      minValue !== null
        ? Math.max(minValue, exclusiveMinimum + epsilon)
        : exclusiveMinimum + epsilon
  }
  if (typeof exclusiveMaximum === "number") {
    maxValue =
      maxValue !== null
        ? Math.min(maxValue, exclusiveMaximum - epsilon)
        : exclusiveMaximum - epsilon
  }
  if (minValue !== null && minValue > number)
    constrainedNumber = minValue;
  else if (maxValue !== null && maxValue < number)
    constrainedNumber = maxValue;
  
  if (typeof multipleOf === "number" && multipleOf > 0) {
    const remainder = constrainedNumber % multipleOf
    constrainedNumber =
      remainder === 0
        ? constrainedNumber
        : constrainedNumber + multipleOf - remainder
  }

  return constrainedNumber
}

/**
 * Returns an example JSON value for a JSON schema
 * @param {Schema} schema
 * @param {number} [index] Which example to return when there are multiple examples
 * @param {(ref: string) => Schema} resolveRef 
 * @param {string[]} [refPath]
 * @returns {any}
 */
function getSchemaExample(schema, index, resolveRef, refPath) {
  index = index ?? 0;
  refPath = refPath ?? []

  if (schema.const !== undefined)
    return schema.const;
  if (schema.default !== undefined)
    return schema.default;
  if (Array.isArray(schema.examples))
    return schema.examples[Math.min(index, schema.examples.length - 1)];
  if (schema.example !== undefined)
    return schema.example;

  if (typeof schema.$ref === "string") {
    if (refPath.includes(schema.$ref))
      return {};
    const resolved = resolveRef(schema.$ref);
    if (resolved) {
      return getSchemaExample(resolved, index, resolveRef, [...refPath, schema.$ref]);
    } else {
      return {};
    }
  }

  if (Array.isArray(schema.allOf)) {
    const startExample = getSchemaExample(schema.allOf[0], 0, resolveRef, refPath);
    if (typeof startExample === "object") {
      for (let i = 1; i < schema.allOf.length; i++) {
        Object.assign(startExample, getSchemaExample(schema.allOf[i], 0, resolveRef, refPath));
      }
    }
    return startExample;
  }

  let result;
  if (schema.type === "null") {
    result = null;
  } else if (schema.type === "boolean") {
    result = true;
  } else if (schema.type === "integer") {
    result = applyNumberConstraints(0, schema);
  } else if (schema.type === "number") {
    const isFloat = !Number.isInteger(schema.multipleOf ?? 1) || schema.format === 'float' || schema.format === 'double';
    result = applyNumberConstraints(isFloat ? 0.1 : 0, schema);
  } else if (schema.type === "string") {
    result = getStringExample(schema, resolveRef);
  } else if (schema.type === "array") {
    result = [];
    if (Array.isArray(schema.prefixItems)) {
      for (const item of schema.prefixItems) {
        result.push(getSchemaExample(item, result.length, resolveRef, refPath));
      }
    }

    if (typeof schema.contains === 'object') {
      let minContains = schema.minContains || 1;
      for (let i = 0; i < minContains; i++) {
        result.push(getSchemaExample(schema.contains, result.length, resolveRef, refPath));
      }
    }

    let itemsSchema = schema.items ?? schema.unevaluatedItems ?? {};
    let minItems = schema.minItems || (itemsSchema.oneOf?.length ?? itemsSchema.anyOf?.length ?? 1);
    for (let i = result.length; i < minItems; i++) {
      result.push(getSchemaExample(itemsSchema, result.length, resolveRef, refPath));
    }

    if (Number.isInteger(schema.maxItems) && result.length > schema.maxItems)
      result.splice(schema.maxItems);
    if (schema.uniqueItems === true)
      result = [...new Set(result)];
  } else if (schema.type === "object"
    || (schema.type === undefined && typeof schema.properties === 'object')) {
    result = {};
    let propertiesAdded = 0;

    if (typeof schema.properties === 'object') {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.deprecated !== true) {
          result[propName] = getSchemaExample(propSchema, 0, resolveRef, refPath);
          propertiesAdded++;
        }
      }
    }
    const requiredProperties = schema.required ?? [];
    requiredProperties
      .filter(prop => !result.hasOwnProperty(prop))
      .forEach(propName => {
        result[propName] = {};
        propertiesAdded++;
      });

    if (typeof schema.patternProperties === 'object') {
      for (const [key, value] of Object.entries(schema.patternProperties)) {
        result[`/${key}/`] = getSchemaExample(value, 0, resolveRef, refPath);
        propertiesAdded++;
      }
    }

    let addlPropSchema = schema.additionalProperties ?? schema.unevaluatedProperties;
    let propCount = schema.minProperties ?? 3;
    if (addlPropSchema === true) {
      addlPropSchema = {};
      propCount = 1;
    }

    if (typeof addlPropSchema === 'object') {
      let addlPropName = addlPropSchema['x-additionalPropertiesName'];
      if (!addlPropName) {
        if (typeof schema.propertyNames === 'object' && schema.propertyNames.pattern)
          addlPropName = `/${schema.propertyNames.pattern}/`;
        else
          addlPropName = 'additionalProp';
      }
      result[addlPropName + "1"] = getSchemaExample(addlPropSchema, 0, resolveRef, refPath);
      propertiesAdded++;

      const minProperties = schema.minProperties ?? 1;
      const maxProperties = schema.maxProperties ?? 1000;
      const toAdd = Math.min(Math.max(propCount - 1, minProperties - propertiesAdded), maxProperties - propertiesAdded);
      for (let i = 0; i < toAdd; i++) {
        result[`${addlPropName}${i + 2}`] = getSchemaExample(addlPropSchema, i + 1, resolveRef, refPath);
        propertiesAdded++;
      }
    }

    if (Number.isInteger(schema.maxProperties) && propertiesAdded > schema.maxProperties) {
      const keysToRemove = Object.keys(result)
        .filter(propName => !requiredProperties.includes(propName))
        .reverse();
      keysToRemove.splice(propertiesAdded - schema.maxProperties);
      for (let key of keysToRemove) {
        delete result[key];
      }
    }
  }

  /**
   * @param {Schema[]} array 
   */
  const mergeAlternates = array => {
    const example = getSchemaExample(array[index % schema.oneOf.length], 0, resolveRef, refPath);
    if (typeof result === "object"
      && result !== null
      && typeof example === "object"
      && example !== null) {
      return { ...result, ...example };
    } else {
      return example;
    }
  }
  if (Array.isArray(schema.oneOf)) {
    result = mergeAlternates(schema.oneOf);
  } else if (Array.isArray(schema.anyOf)) {
    result = mergeAlternates(schema.anyOf);
  }

  if (result === undefined) {
    result = {};
  }

  return result;
}

export default getSchemaExample;
