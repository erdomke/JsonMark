const RandExp = require('randexp');

// TODO: Handle dynamic references

/**
 * @typedef {Object<string, any>} Schema
 */

/**
 * @param {Object<string, Schema>} schemas A map of URIs and schemas
 * @param {Object} [options]
 * @param {number} [options.headingLevel] The heading level to use for the root schemas.
 * @param {boolean} [options.includeSourceLink] Whether to include a link to the source schema.
 * @param {"single"|"multiple"|"one-to-one"} [options.output] Whether to include a link to the source schema.
 * @param {string} [options.rootPath] The root path
 * @returns {{fileName: string, markdown: string}[]}
 */
function processSchema(schemas, options) {
  try {
    /** @type {Object<string, Schema>} */
    const refMap = {};
    Object.entries(schemas)
      .forEach(([uri, schema]) => {
        normalizeSchema(schema, uri, refMap)
        Object.entries(refMap)
          .forEach(([, schema]) => {
            if (schema && typeof schema.$src !== 'string') {
              schema.$src = uri;
            }
          });
      });
    const getFragmentPath = (ref) => {
      let [, fragment] = ref.split('#');
      if (!fragment)
        return [];
      if (fragment.startsWith('/'))
        fragment = fragment.substring(1);
      return fragment.split('/');
    }

    options = options ?? {};
    const heading = '#'.repeat(options.headingLevel ?? 1);
    const markdownSections = Object.entries(refMap)
      .filter(([ref, schema]) => schema !== null 
        && !/#.*\/(oneOf|anyOf|not|allOf|properties|patternProperties|dependencies|dependentSchemas|additionalProperties|unevaluatedProperties|items|unevaluatedItems|contains|contentSchema|prefixItems)\b/.test(ref)
        && (ref === '#' || !schema.type || schema.type === "object"))
      .map(([ref, schema]) => ({
        ref, 
        name: createNameFromRef(ref),
        schema
      }))
      .sort((a, b) => {
        const compare = getFragmentPath(a.ref).length - getFragmentPath(b.ref).length;
        return compare === 0 
          ? a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}) 
          : compare;
      })
      .map(({ref, name, schema}) => {
        console.log(`Processing schema: ${ref}`);
        return {
          original: ref.split('#')[0],
          fileName: getFileNameFromRef(schema.$src, ref, options.rootPath),
          markdown: `${heading} ${name}\n\n${schemaToMarkdown(schema, (r) => {
            if (isUri(ref))
              r = new URL(r, ref).href;
            return refMap[r] ?? null;
          }, {root: true})}`
        };
      });
  
    if (options.output === "single") {
      return [
        {
          fileName: markdownSections[0].fileName,
          markdown: markdownSections.map(({markdown}) => markdown).join('\n\n')
        }
      ]
    } else if (options.output === "multiple") {
      return markdownSections.map(({fileName, markdown}) => ({fileName, markdown}));
    } else {
      /** @type {Object<string, {fileName: string, markdown: string}>} */
      const result = {};
      markdownSections.forEach(({original, fileName, markdown}) => {
        if (result[original]) {
          result[original].markdown += '\n\n' + markdown;
        } else {
          result[original] = { fileName, markdown };
        }
      });
      return Object.values(result);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * @param {string} src The source URI or path
 * @param {string} ref
 * @param {string} rootPath
 */
function getFileNameFromRef(src, ref, rootPath) {
  const invalidChars = ["\u0022","\u003C","\u003E","|","\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000B","\f","\r","\u000E","\u000F","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001A","\u001B","\u001C","\u001D","\u001E","\u001F",":","*","?","\\","/"]
  
  const [path, fragment] = ref.split('#');
  const finalParts = [];
  if (path || src) {
    let name;
    if (src) {
      if (rootPath)
        name = src.substring(rootPath.length)
      else if (path.indexOf('\\') < 0)
        name = src.split('/').pop();
      else
        name = src.split('\\').pop();
    } else {
      name = path.split('/').pop();
    }
    while (name.startsWith('/') || name.startsWith('\\'))
      name = name.substring(1);
    if (name.endsWith('.json'))
      name = name.substring(0, name.length - 5);
    finalParts.push(name);
  }
  if (fragment) {
    let name = createNameFromRef(ref);
    for (let i = 0; i < name.length; i++) {
      if (invalidChars.includes(name[i])) {
        name = name.slice(0, i) + '-' + name.slice(i + 1);
      }
    }
    finalParts.push(name);
  }
  finalParts.push('md');
  return finalParts.join('.');
}

/**
 * Indicates if documentation is only a reference to a type (surrounded by `<code>` tags).
 * @param {string} doc The Markdown documentation
 * @returns {boolean}
 */
const isTypeReferenceOnly = (doc) => doc.startsWith("<code>") && (doc.length - doc.indexOf("</code>")) === 7;

/**
 * Construct paragraphs from a list of oneOf or anyOf schemas.
 * @param {Schema[]} arr List of oneOf or anyOf schemas.
 * @param {string} label The heading to use (generally "One of" or "Any of").
 * @param {(ref: string) => Schema} resolveRef
 * @param {boolean} root
 * @returns {string[]} Markdown paragraphs.
 */
const alternatesToParagraphs = (arr, label, resolveRef, root) => {
  if (Array.isArray(arr)) {
    const doc = arr.map(s => schemaToMarkdown(s, resolveRef, {}));
    if (doc.length > 1
      && doc[doc.length - 1] === "<code>null</code>"
      && doc[doc.length - 2].startsWith("<code>")) {
      doc.pop();
      doc[doc.length - 1] = doc[doc.length - 1].replace(/<\/code>/, ' | null</code>');
    };

    if (doc.length === 1) {
      return doc;
    } else if (doc.length < 6 && doc.every(isTypeReferenceOnly)) {
      const type = `<code>${doc.map(d => d.slice(6, -7)).join(' | ')}</code>`;
      return [type];
    } else {
      return [`_${label}_:`, arrayToMarkdown(doc)];
    }
  } else {
    return [];
  }
}

/**
 * Creates Markdown documentation for a JSON schema
 * @param {Schema} schema
 * @param {(ref: string) => Schema} resolveRef
 * @param {{root?: boolean, required?: boolean, ifDefined?: Schema}} options
 * @returns {string}
 */
function schemaToMarkdown(schema, resolveRef, options) {
  const alternatesDoc = [
    ...alternatesToParagraphs(schema.oneOf, 'One of', resolveRef, options.root), 
    ...alternatesToParagraphs(schema.anyOf, 'Any of', resolveRef, options.root)
  ];

  let firstLine = [];
  let paragraphs = [];
  if (typeof schema.$ref === 'string') {
    const schemaType = resolveRef(schema.$ref)?.type;
    if (schemaType === 'string'
      || schemaType === 'number' || schemaType === 'integer' 
      || schemaType === 'boolean' || schemaType === 'null') {
      return schemaToMarkdown(resolveRef(schema.$ref), resolveRef, {});
    } else {
      const name = createNameFromRef(schema.$ref);
      firstLine.push(`<code><a href="#${name}">${name}</a></code>`);
    }
  } else if (schema.const !== undefined) {
    firstLine.push(`<code>${JSON.stringify(schema.const).replaceAll(/</g, "&lt;")}</code>`);
  } else if (typeof schema.type === 'string') {
    if (typeof schema.format === 'string')
      firstLine.push(`<code>${schema.type} /\\*${schema.format}\\*/</code>`);
    else
      firstLine.push(`<code>${schema.type}</code>`);
  } else if (alternatesDoc.length === 1 && isTypeReferenceOnly(alternatesDoc[0])) {
    firstLine.push(alternatesDoc[0]);
    alternatesDoc.pop();
  }

  if (options?.required === true || schema.required === true)
    firstLine.push(' (_Required_)');
  if (schema.deprecated === true)
    firstLine.push(` (_Deprecated_)`);
  if (schema.readOnly === true)
    firstLine.push(` (_Read-only_)`);
  else if (schema.writeOnly === true)
    firstLine.push(` (_Write-only_)`);

  if (typeof schema.title === 'string') {
    firstLine.push(schema.title);
    paragraphs.push(firstLine.join(' '));
    firstLine.splice(0, firstLine.length);
  }

  if (typeof schema.description === 'string' && schema.description !== schema.title) {
    if (paragraphs.length === 0) {
      firstLine.push(schema.description);
      paragraphs.push(firstLine.join(' '));
      firstLine.splice(0, firstLine.length);
    } else {
      paragraphs.push(schema.description);
    }
  }

  if (firstLine.length > 0) {
    paragraphs.push(firstLine.join(' '));
  }

  if (options.root === true) {
    const example = getSchemaExample(schema, 0, resolveRef);
    if (typeof example === 'object' || Array.isArray(example)) {
      paragraphs.push('_Example_:');
      paragraphs.push('```json\n' + JSON.stringify(example, null, 2) + '\n```');
    }
  }

  if (Array.isArray(schema.allOf)) {
    const doc = schema.allOf.map(s => schemaToMarkdown(s, resolveRef, {}));
    const simpleDoc = doc.filter(isTypeReferenceOnly);
    if (simpleDoc.length > 1 || (simpleDoc.length > 0 && doc.length > simpleDoc.length)) {
      paragraphs.push(`_All of_: ${simpleDoc.join(', ')}`);
    } else if (simpleDoc.length === 1) {
      paragraphs.push(simpleDoc[0]);
    }
    doc
      .filter(doc => !isTypeReferenceOnly(doc))
      .forEach(doc => paragraphs.push(doc));
  }
  
  if (schema.default !== undefined)
    paragraphs.push(`Default value: \`${JSON.stringify(schema.default)}\``);

  paragraphs.push(...alternatesDoc);

  const primitiveValidations = [
    getRangeValidation('Value',
      schema.minimum ?? schema.exclusiveMinimum,
      Number.isFinite(schema.exclusiveMinimum),
      schema.maximum ?? schema.exclusiveMaximum,
      Number.isFinite(schema.exclusiveMaximum)
    ),
    Number.isFinite(schema.multipleOf) ? `Value is multiple of \`${schema.multipleOf}\`` : null,
    getRangeValidation('String length', schema.minLength, false, schema.maxLength, false),
    schema.pattern ? `String matches pattern \`${schema.pattern}\`` : null,
    schema.contentEncoding ? `String encoding is \`${schema.contentEncoding}\`` : null,
    schema.contentMediaType ? `String media type is \`${schema.contentMediaType}\`` : null,
    schema.contentEncoding && typeof schema.contentSchema === 'object'
      ? `String content matches schema: ${schemaToMarkdown(schema.contentSchema, resolveRef, {})}`
      : null
  ]
    .filter(v => v !== null);
  if (primitiveValidations.length > 0)
    paragraphs.push(primitiveValidations.map(v => `- ${v}`).join('\n'));

  const propertyValidations = propertyValidationsToMarkdown(schema, resolveRef);
  if (propertyValidations.length > 0) {
    if (propertyValidations.length > 1 || propertyValidations[0].startsWith('**'))
      paragraphs.push('_Properties_:');
    paragraphs.push(arrayToMarkdown(propertyValidations));
  }

  const itemValidations = itemValidationsToMarkdown(schema, resolveRef);
  const arrayTypeMd = '<code>array</code>';
  if (paragraphs.length > 0 && paragraphs[0].startsWith(arrayTypeMd)) {
    // Simplify array documentation
    let index = 0;
    while (index < itemValidations.length) {
      const match = /^_All items_: <code>(?<type>.*)<\/code>/.exec(itemValidations[index]);
      if (match) {
        const arrayType = match.groups.type.indexOf(' ') >= 0
          ? `Array&lt;${match.groups.type}&gt;`
          : `${match.groups.type}[]`;
        paragraphs[0] = `<code>${arrayType}</code>${paragraphs[0].substring(arrayTypeMd.length)}`;
        if (match[0] === itemValidations[index]) {
          itemValidations.splice(index, 1);
        }
        break;
      }
      index++;
    }
  }
  if (itemValidations.length > 0) {
    if (itemValidations.length > 1 || itemValidations[0].startsWith('**'))
      paragraphs.push('_Items_:');
    paragraphs.push(arrayToMarkdown(itemValidations));
  }

  if (paragraphs.length === 2
    && paragraphs[0].startsWith('<code>object</code>')) {
    // Simplify array documentation
    const match = /^- _All properties_: <code>(?<type>.*)<\/code>$/.exec(paragraphs[1]);
    if (match) {
      paragraphs[0] = `<code>Object&lt;string, ${match.groups.type}&gt;</code>${paragraphs[0].substring(19)}`;
      paragraphs.splice(1, 1);
    }
  }

  if (typeof options.ifDefined === 'object') {
    const ifDefinedDoc = schemaToMarkdown(options.ifDefined, resolveRef, {});
    if (ifDefinedDoc)
      paragraphs.push(`If property is defined, then… ${ifDefinedDoc}`);
  }

  if (typeof schema.not === 'object') {
    paragraphs.push(`It must not be true that… ${schemaToMarkdown(schema.not, resolveRef, {})}`);
  }

  if (typeof schema.if === 'object'
    && (typeof schema.then === 'object' || typeof schema.else === 'object')) {
    paragraphs.push(`If… ${schemaToMarkdown(schema.if, resolveRef, {})}`);
    if (typeof schema.then === 'object')
      paragraphs.push(`Then… ${schemaToMarkdown(schema.then, resolveRef, {})}`);
    if (typeof schema.else === 'object')
      paragraphs.push(`Else… ${schemaToMarkdown(schema.else, resolveRef, {})}`);
  }

  return paragraphs.map(p => p.trimEnd()).join('\n\n');
}

/**
 * Creates Markdown documentation for JSON object property validations
 * @param {Schema} schema Schema to document
 * @param {(ref: string) => Schema} resolveRef Callback for resolving references to schemas
 * @returns {string[]} Markdown paragraphs describing the properties and validations
 */
function propertyValidationsToMarkdown(schema, resolveRef) {
  const required = Array.isArray(schema.required) ? schema.required : [];
  const allProperties = new Set([...required]);
  for (let schemaProp of ['properties', 'dependentSchemas']) {
    if (typeof schema[schemaProp] === 'object')
      Object.keys(schema[schemaProp]).forEach(p => allProperties.add(p));
  }
  
  const dependentSchemas = typeof schema.dependentSchemas === 'object'
    ? schema.dependentSchemas
    : {};
  const validations = [...allProperties]
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
    .map(propName => {
      const propSchema = (typeof schema.properties === 'object' ? schema.properties[propName] : null) ?? {};
      const options = {
        required: required.includes(propName)
      }
      
      if (typeof dependentSchemas[propName] === 'object')
        options.ifDefined = dependentSchemas[propName];

      if (isAnySchema(propSchema)) {
        return `**${propName}**: <code>any</code> ${schemaToMarkdown({}, resolveRef, options)}`;
      } else if (propSchema === false) {
        return `**${propName}**: (_Not allowed_)`;
      } else if (typeof propSchema === 'object') {
        return `**${propName}**: ${schemaToMarkdown(propSchema, resolveRef, options)}`;
      }
    });
  if (typeof schema.patternProperties === 'object') {
    Object.entries(schema.patternProperties)
      .sort(([a], [b]) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
      .forEach(([pattern, propSchema]) => {
        if (isAnySchema(propSchema)) {
          validations.push(`_Property name matches_ \`${pattern}\`: <code>any</code>`);
        } else if (propSchema === false) {
          validations.push(`_Property name matches_ \`${pattern}\`: (_Not allowed_)`);
        } else if (typeof propSchema === 'object') {
          validations.push(`_Property name matches_ \`${pattern}\`: ${schemaToMarkdown(propSchema, resolveRef, {})}`);
        }
      });
  }
  const hasProperties = validations.length > 0;
  if (typeof schema.propertyNames === 'object') {
    const propNamesDoc = schemaToMarkdown(schema.propertyNames, resolveRef, {});
    if (propNamesDoc) {
      validations.push(`_Property names_: ${propNamesDoc}`);
    }
  }

  let additionalProps = schema.additionalProperties
    ?? schema.unevaluatedProperties;
  if (additionalProps === undefined && schema.type === 'object') {
    if (Array.isArray(schema.allOf)
      && schema.allOf
        .some(s => s.properties !== undefined
          || s.patternProperties !== undefined
          || s.additionalProperties !== undefined
          || s.unevaluatedProperties !== undefined
        )) {
      additionalProps = false;
    } else {
      additionalProps = true;
    }
  };
  const additionalLabel = schema["x-additionalPropertiesName"]
    ?? (hasProperties ? 'Additional properties' : 'All properties');
  if (isAnySchema(additionalProps)) {
    validations.push(`_${additionalLabel}_: <code>any</code>`);
  } else if (typeof additionalProps === 'object') {
    validations.push(`_${additionalLabel}_: ${schemaToMarkdown(additionalProps, resolveRef, {})}`);
  }

  const propCount = getRangeValidation('Property count', schema.minProperties, false, schema.maxProperties, false);
  if (propCount !== null)
    validations.push(`${propCount}`);

  return validations;
}

/**
 * Checks if a schema is an "any" schema, meaning it allows any value.
 * @param {Schema | boolean} schema 
 */
function isAnySchema(schema) {
  return schema === true
    || (typeof schema === 'object' && Object.keys(schema).length === 0);
}

/**
 * Creates Markdown documentation for JSON array items
 * @param {Schema} schema
 * @param {(ref: string) => Schema} resolveRef
 * @returns {string[]}
 */
function itemValidationsToMarkdown(schema, resolveRef) {
  const validations = [];

  if (Array.isArray(schema.prefixItems)) {
    schema.prefixItems.forEach((itemSchema, index) => {
      if (isAnySchema(itemSchema)) {
        validations.push(`**${index}**: <code>any</code>`);
      } else if (itemSchema === false) {
        validations.push(`**${index}**: (_Not allowed_)`);
      } else if (typeof itemSchema === 'object') {
        validations.push(`**${index}**: ${schemaToMarkdown(itemSchema, resolveRef, {})}`);
      }
    });
  }

  const itemsSchema = schema.items
    ?? schema.unevaluatedItems
    ?? (schema.type === 'array' ? true : false);
  const additionalLabel = validations.length > 0
    ? 'Additional items'
    : 'All items';
  if (isAnySchema(itemsSchema)) {
    validations.push(`_${additionalLabel}_: <code>any</code>`);
  } else if (typeof itemsSchema === 'object') {
    validations.push(`_${additionalLabel}_: ${schemaToMarkdown(itemsSchema, resolveRef, {})}`);
  }

  if (typeof schema.contains === "object") {
    let message = '';
    if (Number.isInteger(schema.minContains)
      && Number.isInteger(schema.maxContains)) {
      message = ` between ${schema.minContains} and ${schema.maxContains}`;
    } else if (Number.isInteger(schema.minContains)) {
      message = ` at least ${schema.minContains}`;
    } else if (Number.isInteger(schema.maxContains)) {
      message = ` at most ${schema.maxContains}`;
    }

    validations.push(`_Contains_${message} ${schemaToMarkdown(schema.contains, resolveRef, {})}`);
  }

  const itemCount = getRangeValidation('Item count', schema.minItems, false, schema.maxItems, false);
  if (itemCount !== null)
    validations.push(`${itemCount}`);

  if (schema.uniqueItems === true)
    validations.push('Items must be unique');
  
  return validations;
}

/**
 * Convert an array of Markdown paragraphs to a Markdown list.
 * @param {string[]} array 
 */
function arrayToMarkdown(array) {
  return array.map(item => item
    .split('\n')
    .map((line, index) => ((index === 0 ? '- ' : '  ') + line).trimEnd())
    .join('\n')
  ).join('\n');
}

/**
 * Describe a validation involve a minimum and/or maximum count
 * @param {string} label 
 * @param {number | null} min 
 * @param {boolean} minExclusive 
 * @param {number | null} max 
 * @param {boolean} maxExclusive
 * @returns {string | null} A Markdown string describing the validation, or null if no validation is specified.
 */
function getRangeValidation (label, min, minExclusive, max, maxExclusive) {
  if (Number.isFinite(min) && Number.isFinite(max)) {
    if (min === max) {
      return `_${label}_ = \`${min}\``;
    } else {
      return `\`${min}\` ${minExclusive ? "<" : "≤"} _${label}_ ${maxExclusive ? "<" : "≤"} \`${max}\``;
    }
  } else if (Number.isFinite(min)) {
    return `_${label}_ ${minExclusive ? ">" : "≥"} \`${min}\``;
  } else if (Number.isFinite(max)) {
    return `_${label}_ ${maxExclusive ? "<" : "≤"} \`${max}\``;
  } else {
    return null;
  }
}

/**
 * Create a name from a JSON schema reference.
 * @param {string} ref 
 * @returns {string}
 */
function createNameFromRef(ref) {
  const [filePath, fragment] = ref.split('#');
  if (filePath && !fragment) {
    if (filePath.indexOf('\\') < 0)
      return filePath.split('/').pop();
    else
      return filePath.split('\\').pop();
  }
  const keywords = new Set(['oneOf','anyOf','not','allOf','properties','patternProperties','dependentSchemas','additionalProperties','unevaluatedProperties','items','unevaluatedItems','contains','contentSchema','prefixItems']);
  const keywordsToRemove = new Set(['oneOf','anyOf','allOf','properties','patternProperties','prefixItems']);
  let path = fragment.split('/');

  let first = true;
  let index = path.findIndex((part) => keywords.has(part));
  while (index >= 0) {
    if (first) {
      first = false;
      path.splice(0, index - 1);
      index = 1;
    }

    if (keywordsToRemove.has(path[index])) {
      path.splice(index, 1);
      index--;
    }

    index = path.findIndex((part, i) => i > index && keywords.has(part));
  }
  if (first)
    return path.pop();
  return path.map(p => /\d+/.exec(p) ? '_' + p : p).join('.');
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

/**
 * @param {string} uri 
 * @returns {boolean}
 */
const isUri = (uri) => uri && /^(https?|ftp|file):\//.test(uri);

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
    
    if (typeof refMap[ref] === "undefined")
      refMap[ref] = null;
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
      .filter(([ref, value]) => ref.startsWith(uri) && value === null);
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

const schemaAnnotations = ["title", "description", "default", "example", "examples", "deprecated", "readOnly", "writeOnly", "$comment", "format", "x-additionalPropertiesName"];
const typeToCopy = {
  "number": ["multipleOf", "minimum", "exclusiveMinimum", "maximum", "exclusiveMaximum"],
  "integer": ["multipleOf", "minimum", "exclusiveMinimum", "maximum", "exclusiveMaximum"],
  "string": ["minLength", "maxLength", "pattern", "contentMediaType", "contentEncoding", "contentSchema"],
  "object": ["properties", "patternProperties", "additionalProperties", "unevaluatedProperties", "required", "dependentRequired", "dependentSchemas", "propertyNames", "minProperties", "maxProperties"],
  "array": ["items", "prefixItems", "contains", "minContains", "maxContains", "minItems", "maxItems", "uniqueItems", "unevaluatedItems"]
}

function getDistinctTypes(strings) {
  if ('any' in strings)
    return ['any'];
  return [...new Set(strings)].sort();
}

/**
 * Get an example string value based on the schema
 * @param {Schema} schema 
 * @param {(ref: string) => Schema} resolveRef 
 * @returns {string}
 */
const getStringExample = (schema, resolveRef) => {
  /**
   * Generate a string that matches a regular expression
   * @param {string} pattern 
   * @returns {string}
   */
  const randexp = (pattern) => {
    try {
      /**
       * Applying maximum value (100) to numbers from regex patterns to avoid ReDoS:
       * 1. {x}
       * 2. {x,}
       * 3. {,y}
       * 4. {x,y}
       */
      const patternSanitizer =
        /(?<=(?<!\\)\{)(\d{3,})(?=\})|(?<=(?<!\\)\{\d*,)(\d{3,})(?=\})|(?<=(?<!\\)\{)(\d{3,})(?=,\d*\})/g
      const safePattern = pattern.replace(patternSanitizer, "100")
      const randexpInstance = new RandExp(safePattern)
      randexpInstance.max = 100
      return randexpInstance.gen()
    } catch {
      // invalid regex should not cause a crash (regex syntax varies across languages)
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
  if (schema.example !== undefined) // Legacy from OpenAPI 2.0
    return schema.example;

  if (typeof schema.$ref === "string") {
    if (refPath.includes(schema.$ref))
      return {};
    const resolved = resolveRef(schema.$ref);
    if (resolved) {
      return getSchemaExample(resolved, index, resolveRef, [...refPath, schema.$ref]);
    } else {
      //throw new Error(`Could not resolve reference: ${schema.$ref}`);
      return {};
    }
  }


  if (Array.isArray(schema.oneOf))
    return getSchemaExample(schema.oneOf[index % schema.oneOf.length], 0, resolveRef, refPath);
  if (Array.isArray(schema.anyOf))
    return getSchemaExample(schema.anyOf[index % schema.anyOf.length], 0, resolveRef, refPath);

  if (Array.isArray(schema.allOf)) {
    const startExample = getSchemaExample(schema.allOf[0], 0, resolveRef, refPath);
    if (typeof startExample === "object") {
      for (let i = 1; i < schema.allOf.length; i++) {
        Object.assign(startExample, getSchemaExample(schema.allOf[i], 0, resolveRef, refPath));
      }
    }
    return startExample;
  }

  if (schema.type === "null")
    return null;
  if (schema.type === "boolean")
    return true;
  if (schema.type === "integer")
    return applyNumberConstraints(0, schema);
  if (schema.type === "number") {
    const isFloat = !Number.isInteger(schema.multipleOf ?? 1) || schema.format === 'float' || schema.format === 'double';
    return applyNumberConstraints(isFloat ? 0.1 : 0, schema);
  }

  if (schema.type === "string")
    return getStringExample(schema, resolveRef);

  if (schema.type === "array") {
    const result = [];
    if (Array.isArray(schema.prefixItems)) {
      for (const item of schema.prefixItems) {
        result.push(getSchemaExample(item, result.length, resolveRef, refPath));
      }
    }

    if (typeof schema.contains === 'object') {
      let minContains = schema.minContains || 1; // default to 1 if not specified or 0
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
      return [...new Set(result)];
    return result;
  } else if (schema.type === "object"
    || (schema.type === undefined && typeof schema.properties === 'object')) {
    const result = {};
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
      // https://github.com/swagger-api/swagger-ui/pull/10006
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
    
    return result;
  }

  return {};
}

module.exports = { processSchema, normalizeSchema, getSchemaExample };
