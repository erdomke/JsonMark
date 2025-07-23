import getSchemaExample from "./getSchemaExample.js";
import normalizeSchema from "./normalizeSchema.js";
import { isUri } from "./utils.js";

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
function generateMarkdown(schemas, options) {
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

  paragraphs.push(...alternatesDoc);

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

export default generateMarkdown;