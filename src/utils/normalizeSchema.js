import { isUri } from "./utils.js";

/**
 * Normalize the multiple ways that a schema can be identically expressed.
 * @param {Schema | boolean} schema 
 * @param {string} uri The URI for the schema
 * @param {Object<string, Schema>} refMap Reference map that is updated to store the original references for normalized schemas
 * @returns {Schema | boolean}
 */
function normalizeSchema(schema, uri, refMap) {
  if (typeof schema === "boolean")
    return schema;
  if (Object.keys(schema).length === 0)
    return true;
  
  if (typeof schema.$id === "string") {
    if (isUri(uri)) {
      try {
        uri = new URL(schema.$id, uri).href;
      } catch (err) {
        console.error(err);
        throw err;
      }
    } else {
      uri = schema.$id
    }
  } else {
    uri = uri || "#";
  }

  /**
   * @param {{ type: string}[]} list 
   */
  const sortNullsToEnd = (list) => {
    let i = 0;
    let nullType = null;
    while (i < list.length) {
      if (list[i].type === "null") {
        nullType = list.splice(i, 1)[0];
      } else {
        i++;
      }
    }
    if (nullType)
      list.push(nullType);
    return list;
  }

  const types = typeof schema.type === "string" 
    ? [schema.type]
    : (Array.isArray(schema.type) ? schema.type : []);
  let type = schema.const === null
    ? "null"
    : types.length === 1 ? types[0] : "";

  // 2019-09 way to handle tuples
  if (Array.isArray(schema.items)) {
    schema = {...schema};
    schema.prefixItems = schema.items;
    if (typeof schema.additionalItems === "undefined") {
      delete schema.items;
    } else {
      schema.items = schema.additionalItems;
      delete schema.additionalItems;
    }
  }

  // Change single element `enum` to a `const`
  if (Array.isArray(schema.enum) && schema.enum.length === 1) {
    schema = {...schema};
    schema.const = schema.enum[0];
    delete schema.enum;
  }

  const propsToCopy = new Set(Object.keys(schema)
    .filter(key => !['enum', 'oneOf', 'allOf', 'anyOf', 'not', 'type', '$defs'].includes(key)));
  if (types.length > 1)
    types.flatMap(type => typeToCopy[type] ?? [])
      .forEach(prop => propsToCopy.delete(prop));

  let result = cloneSchema(schema, [...propsToCopy], uri, refMap);
  if (result.nullable === false)
    delete result.nullable;
  
  // Deal with draft-07 way to handle anchors
  if (typeof result.$id === "string" && result.$id.startsWith('#')) {
    result.$anchor = result.$id.substring(1);
    delete result.$id;
  }

  // Deal with draft-07 way to handle dependentSchemas and dependentRequired
  if (typeof result.dependencies === "object" && typeof result.dependentSchemas !== "object") {
    const entries = Object.entries(result.dependencies);
    if (entries.length > 0) {
      result.dependentSchemas = Object.fromEntries(entries
        .map(([propName, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return [propName, {
              required: value,
            }];
          } else if (typeof value === "object") {
            return [
              propName, 
              normalizeSchema(value, appendPathToUriHash(uri, `dependencies/${propName}`), refMap)
            ];
          }
        })
      );
    }
    delete result.dependencies;
  } else if (typeof result.dependentRequired === "object") {
    // Merge dependentRequired into dependentSchemas
    if (typeof result.dependentSchemas !== "object") {
      result.dependentSchemas = {};
    }
    Object.entries(result.dependentRequired).forEach(([propName, requiredProps]) => {
      if (Array.isArray(requiredProps) && requiredProps.length > 0) {
        schema = result.dependentSchemas[propName] ?? {};
        schema.required = [...new Set([...(schema.required ?? []), ...requiredProps])];
        result.dependentSchemas[propName] = schema;
      }
    });
    delete result.dependentRequired;
  }

  // Handle draft-06 way to handle content encoding
  if (typeof result.media === "object") {
    if (typeof result.contentEncoding === "undefined") {
      result.contentEncoding = result.media.binaryEncoding;
    }
    if (typeof result.contentMediaType === "undefined") {
      result.contentMediaType = result.media.type;
    }
    delete result.media;
  }

  // Handle draft-05 way to represent id
  if (typeof result.id === "string" && typeof result.$id !== "string") {
    result.$id = result.id;
    delete result.id;
  }

  // Handle draft-05 way to represent exclusive comparisons
  if (typeof result.exclusiveMinimum === "boolean") {
    if (result.exclusiveMinimum) {
      result.exclusiveMinimum = result.minimum;
      delete result.minimum;
    } else {
      delete result.exclusiveMinimum;
    }
  }
  if (typeof result.exclusiveMaximum === "boolean") {
    if (result.exclusiveMaximum) {
      result.exclusiveMaximum = result.maximum;
      delete result.maximum;
    } else {
      delete result.exclusiveMaximum;
    }
  }
  
  let allOf = [];

  const createSchemaForType = (type) => {
    const cloned = cloneSchema(schema, typeToCopy[type] ?? [], uri, refMap);
    cloned.type = type;
    const childSchema = normalizeSchema(cloned, uri, refMap);
    Object.entries(childSchema)
      .forEach(([propName]) => {
        delete result[propName];  
      });
    return childSchema;
  }
  if (types.length > 1) {
    result.oneOf = sortNullsToEnd(types.map(createSchemaForType));
  } else if (type !== "") {
    result.type = type;
    if (type === "null")
      delete result.const;
    else if (result.const !== undefined)
      delete result.type;
  }
  if (Object.keys(result).length > 0)
    allOf.push(result);

  if (Array.isArray(schema.allOf)) {
    allOf.push(...schema.allOf
      .map((value, index) => normalizeSchema(value, appendPathToUriHash(uri, `allOf/${index}`), refMap))
    );
  }

  /**
   * @param {Object<string, any>} schema 
   * @param {string} property 
   * @returns {Object<string, any>}
   */
  const createFlatSchema = (schema, property) => {
    if (!Array.isArray(schema[property]))
      return null;

    if (schema[property].length === 1 && typeof schema[property][0] === "object") {
      return schema[property][0];
    } else {
      const list = schema[property]
        .map((value, index) => normalizeSchema(value, appendPathToUriHash(uri, `${property}/${index}`), refMap));
      let index = list.findIndex(s => Array.isArray(s[property]) && Object.keys(s).length === 1);
      while (index >= 0) {
        list.splice(index, 1, ...list[index][property]);
        index = list.findIndex(s => Array.isArray(s[property]) && Object.keys(s).length === 1);
      }

      const result = {};
      result[property] = sortNullsToEnd(list);
      return result;
    }
  }

  // Handle `anyOf`
  const anyOf = createFlatSchema(schema, "anyOf");
  if (anyOf !== null)
    allOf.push(anyOf);

  // Handle `oneOf`
  let oneOfSchema = createFlatSchema(schema, "oneOf");
  if (Array.isArray(schema.enum)) {
    oneOfSchema = oneOfSchema ?? {};
    oneOfSchema.oneOf = [
      ...(oneOfSchema.oneOf ?? []), 
      ...schema.enum.map(value => ({const: value}))
    ];
  } else if (schema.nullable === true) {
    if (oneOfSchema === null) {
      if (type !== "") {
        allOf.splice(allOf.indexOf(result), 1);
        oneOfSchema = {
          oneOf: [createSchemaForType(type), {type: "null"}]
        };
      } else {
        // TODO: Not sure how to handle this
      }
    } else if (!Array.isArray(oneOfSchema.oneOf)) {
      oneOfSchema = {
        oneOf: [oneOfSchema, {type: "null"}]
      };
    } else if (!oneOfSchema.oneOf.some(s => s.type === "null")) {
      oneOfSchema.oneOf.push({type: "null"});
    }
  }
  if (oneOfSchema !== null) {
    if (typeof result.type === "string"
      && Array.isArray(oneOfSchema.oneOf)
      && oneOfSchema.oneOf.every(s => s.const !== undefined)) {
      const constantTypes = [...new Set(oneOfSchema.oneOf.map(s => typeof s.const))];
      if (constantTypes.length === 1 && constantTypes[0] === result.type) {
        delete result.type;
      }
    }
    allOf.push(oneOfSchema);
  }
  
  allOf = condenseAllOfSchemas(allOf);

  if (allOf.length === 1 && allOf[0] !== result) {
    result = {...result, ...allOf[0]};
  } else if (allOf.length > 1) {
    const annotations = Object.entries(result)
      .filter(([propName]) => schemaAnnotations.includes(propName) || propName.startsWith("x-"));
    annotations
      .forEach(([propName, value]) => {
        allOf.forEach(s => {
          if (s[propName] === value)
            delete s[propName];
        });
      });
    annotations.push(["allOf", allOf]);
    result = Object.fromEntries(annotations);
  }

  if (typeof schema.not === "object") {
    const notSchema = normalizeSchema(schema.not, appendPathToUriHash(uri, 'not'), refMap);
    if (typeof notSchema === "boolean" && Object.keys(schema).length === 1)
      return !notSchema;

    if (notSchema !== false) {
      result = {
        allOf: [result],
        not: notSchema
      };
    }
  }
  
  if (typeof schema.$ref === "string") {
    let ref = schema.$ref;
    if (isUri(uri))
      ref = new URL(ref, uri).href;
    
    if (typeof refMap[ref] === "undefined") {
      refMap[ref] = null;
    }
  }

  refMap[uri] = result;
  if (typeof schema.$anchor === "string")
    refMap[`${uri.split('#')[0]}#${schema.$anchor}`] = result;

  let refsToResolve = Object.entries(refMap)
    .filter(([ref, value]) => ref.startsWith(uri) && value === null);
  while (refsToResolve.length > 0) {
    refsToResolve.forEach(([ref]) => {
      let refPath = ref.substring(uri.length);
      if (refPath.startsWith('#'))
        refPath = refPath.substring(1);
      if (refPath.startsWith('/'))
        refPath = refPath.substring(1);
      const refParts = refPath.split('/');
      let curr = schema;
      for (const part of refParts) {
        if (curr[part] === undefined) {
          curr[part] = {};
        }
        curr = curr[part];
      }
      normalizeSchema(curr, ref, refMap);
    });
    refsToResolve = Object.entries(refMap)
      .filter(([ref, value]) => ref.startsWith(uri)
        && value === null
        && refsToResolve.findIndex(([otherRef]) => otherRef === ref) < 0);
  }
  return result;
}

/**
 * Condenses an array of schemas that are combined with `allOf` into a smaller number of schemas (where possible).
 * @param {Schema[]} schemas
 * @returns {Schema[]}
 */
function condenseAllOfSchemas(schemas) {
  if (schemas.some(s => s === false))
    return [];
  else if (schemas.length === 1)
    return schemas;

  const explicitSchemas = schemas
    .filter(s => typeof s === "object"
      && typeof s.$ref !== "string"
      && Object.keys(s).length > 0
    );
  if (explicitSchemas.length === 0)
    return schemas;

  const refSchemas = schemas
    .filter(s => 
      typeof s === "object"
      && typeof s.$ref === "string"
    );

  /** @type {Object<string, any[]} */
  const combinedProperties = {};
  explicitSchemas.forEach(s => Object.entries(s)
    .forEach(([propName, value]) => {
      combinedProperties[propName] = combinedProperties[propName] ?? [];
      if (propName === "if") {
        combinedProperties[propName].push(value);
        combinedProperties.then = combinedProperties.then ?? [];
        combinedProperties.then.push(s.then);
        combinedProperties.else = combinedProperties.else ?? [];
        combinedProperties.else.push(s.else);
      } else if (propName === "then" || propName === "else") {
        // Already handled
      } else {
        combinedProperties[propName].push(value);
      }
    })
  );

  for (let schemaMap of ["properties", "patternProperties", "dependentSchemas"]) {
    if (Array.isArray(combinedProperties[schemaMap]) 
      && combinedProperties[schemaMap].length > 1) {
      combinedProperties[schemaMap] = [combinedProperties[schemaMap]
        .reverse()
        .reduce((acc, curr) => {
          Object.entries(curr)
            .forEach(([propName, value]) => {
              if (typeof acc[propName] === "object"
                && typeof value === "object") {
                Object.assign(acc[propName], value);
              } else {
                acc[propName] = value
              }
            });
          return acc;
        }, {})
      ];
    }
  }
  for (let distinctArray of ["required", "examples"]) {
    if (Array.isArray(combinedProperties[distinctArray]) 
      && combinedProperties[distinctArray].length > 1) {
      combinedProperties[distinctArray] = [[...new Set(combinedProperties[distinctArray].flat())]];
    }
  }
  for (let distinctString of ["type", "title", "description"]) {
    if (Array.isArray(combinedProperties[distinctString]) 
      && combinedProperties[distinctString].length > 1) {
      combinedProperties[distinctString] = [...new Set(combinedProperties[distinctString])];
    }
  }

  const results = [];
  for (const [propName, values] of Object.entries(combinedProperties)) {
    while (results.length < values.length) {
      results.push({});
    }
    for (let i = 0; i < values.length; i++) {
      results[i][propName] = values[i];
    }
  }
  
  if (results.length === 1
    && Object.keys(results[0]).every(p => schemaAnnotations.includes(p))
    && refSchemas.length === 1) {
    return [Object.assign(refSchemas[0], results[0])];
  } else {
    return [...refSchemas, ...results];
  };
}

/**
 * Clone a schema, only maintaining the specified properties. Normalize relevant copied properties.
 * @param {Schema} schema 
 * @param {string[]} propsToCopy List of properties to copy from the schema
 * @param {string} uri 
 * @param {Object<string, Schema>} refMap 
 * @returns {string}
 */
function cloneSchema(schema, propsToCopy, uri, refMap) {
  return Object.fromEntries(Object.entries(schema)
    .filter(([key]) => propsToCopy.includes(key))
    .map(([key, value]) => {
      if (key === "properties" || key === "patternProperties" || key === "dependentSchemas" || key === "$defs") {
        const newProps = Object.fromEntries(Object.entries(value)
          .map(([propKey, propValue]) => {
            return [propKey, normalizeSchema(propValue, appendPathToUriHash(uri, `${key}/${propKey}`), refMap)];
          }));
        return [key, newProps];
      } else if (typeof value === "object" 
          && (
            key === "additionalProperties" 
            || key === "unevaluatedProperties" 
            || key === "items" 
            || key === "unevaluatedItems"
            || key === "contains"
            || key === "contentSchema"
          )
      ) {
        return [key, normalizeSchema(value, appendPathToUriHash(uri, key), refMap)];
      } if (Array.isArray(value) && key === "prefixItems") {
        return [key, value.map((value, index) => normalizeSchema(value, appendPathToUriHash(uri, `${key}/${index}`), refMap))];
      } else {
        return [key, value];
      }
    })
  );
}

/**
 * Append a path to a URI hash.
 * @param {string} uri
 * @param {string} path 
 * @returns {string}
 */
const appendPathToUriHash = (uri, path) => {
  if (path.startsWith('/'))
    path = path.substring(1);
  return uri.indexOf('#') < 0 ? `${uri}#/${path}` : `${uri}/${path}`;
}

const schemaAnnotations = ["title", "description", "default", "example", "examples", "deprecated", "readOnly", "writeOnly", "$comment", "format", "x-additionalPropertiesName"];
const typeToCopy = {
  "number": ["multipleOf", "minimum", "exclusiveMinimum", "maximum", "exclusiveMaximum"],
  "integer": ["multipleOf", "minimum", "exclusiveMinimum", "maximum", "exclusiveMaximum"],
  "string": ["minLength", "maxLength", "pattern", "contentMediaType", "contentEncoding", "contentSchema"],
  "object": ["properties", "patternProperties", "additionalProperties", "unevaluatedProperties", "required", "dependentRequired", "dependentSchemas", "propertyNames", "minProperties", "maxProperties"],
  "array": ["items", "prefixItems", "contains", "minContains", "maxContains", "minItems", "maxItems", "uniqueItems", "unevaluatedItems"]
}

export default normalizeSchema;