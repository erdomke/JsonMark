import getSchemaExample from './getSchemaExample';
import normalizeSchema from './normalizeSchema';

describe("getSchemaExample", () => {
  const sample = (schema) => {
    const refMap = {};
    const normalized = normalizeSchema(schema, "#", refMap);
    return getSchemaExample(normalized, 0, ref => refMap[ref] ?? null);
  }

  it("should return appropriate example for primitive types + format", function () {
    expect(sample({ type: "string" })).toStrictEqual("string")
    expect(sample({ type: "string", pattern: "^abc$" })).toStrictEqual("abc")
    expect(sample({ type: "string", format: "email" })).toStrictEqual(
      "user@example.com"
    )
    expect(sample({ type: "string", format: "idn-email" })).toStrictEqual(
      "실례@example.com"
    )
    expect(sample({ type: "string", format: "hostname" })).toStrictEqual(
      "example.com"
    )
    expect(sample({ type: "string", format: "idn-hostname" })).toStrictEqual(
      "실례.com"
    )
    expect(sample({ type: "string", format: "ipv4" })).toStrictEqual(
      "198.51.100.42"
    )
    expect(sample({ type: "string", format: "ipv6" })).toStrictEqual(
      "2001:0db8:5b96:0000:0000:426f:8e17:642a"
    )
    expect(sample({ type: "string", format: "uri" })).toStrictEqual(
      "https://example.com/"
    )
    expect(sample({ type: "string", format: "uri-reference" })).toStrictEqual(
      "path/index.html"
    )
    expect(sample({ type: "string", format: "iri" })).toStrictEqual(
      "https://실례.com/"
    )
    expect(sample({ type: "string", format: "iri-reference" })).toStrictEqual(
      "path/실례.html"
    )
    expect(sample({ type: "string", format: "uuid" })).toStrictEqual(
      "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    )
    expect(sample({ type: "string", format: "uri-template" })).toStrictEqual(
      "https://example.com/dictionary/{term:1}/{term}"
    )
    expect(sample({ type: "string", format: "json-pointer" })).toStrictEqual(
      "/a/b/c"
    )
    expect(
      sample({ type: "string", format: "relative-json-pointer" })
    ).toStrictEqual("1/0")
    expect(sample({ type: "string", format: "date-time" })).toStrictEqual("2018-11-13T20:20:39+00:00")
    expect(sample({ type: "string", format: "date" })).toStrictEqual("2018-11-13")
    expect(sample({ type: "string", format: "time" })).toStrictEqual("20:20:39+00:00")
    expect(sample({ type: "string", format: "duration" })).toStrictEqual("P3D")
    expect(sample({ type: "string", format: "password" })).toStrictEqual(
      "********"
    )
    expect(sample({ type: "string", format: "regex" })).toStrictEqual(
      "^[a-z]+$"
    )
    expect(sample({ type: "number" })).toStrictEqual(0)
    expect(sample({ type: "number", format: "float" })).toStrictEqual(0.1)
    expect(sample({ type: "number", format: "double" })).toStrictEqual(0.1)
    expect(sample({ type: "integer" })).toStrictEqual(0)
    expect(sample({ type: "integer", format: "int32" })).toStrictEqual(0)
    expect(sample({ type: "integer", format: "int64" })).toStrictEqual(0)
    expect(sample({ type: "boolean" })).toStrictEqual(true)
    expect(sample({ type: "null" })).toStrictEqual(null)
  })

  it("should return appropriate example given contentEncoding", function () {
    expect(sample({ type: "string", contentEncoding: "7bit" })).toStrictEqual(
      "string"
    )
    expect(
      sample({
        type: "string",
        format: "idn-email",
        contentEncoding: "8bit",
      })
    ).toStrictEqual("실례@example.com")
    expect(
      sample({
        type: "string",
        format: "uri-template",
        contentEncoding: "base64",
      })
    ).toStrictEqual(
      "aHR0cHM6Ly9leGFtcGxlLmNvbS9kaWN0aW9uYXJ5L3t0ZXJtOjF9L3t0ZXJtfQ=="
    )
  })

  it("should return appropriate example given contentMediaType", function () {
    expect(
      sample({ type: "string", contentMediaType: "text/plain" })
    ).toStrictEqual("string")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/css",
      })
    ).toStrictEqual(".selector { border: 1px solid red }")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/csv",
      })
    ).toStrictEqual("value1,value2,value3")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/html",
      })
    ).toStrictEqual("<p>content</p>")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/calendar",
      })
    ).toStrictEqual("BEGIN:VCALENDAR")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/javascript",
      })
    ).toStrictEqual("console.dir('Hello world!');")
    expect(
      sample({
        type: "string",
        contentMediaType: "text/xml",
      })
    ).toStrictEqual('<person age="30">John Doe</person>')
    expect(
      sample({
        type: "string",
        contentMediaType: "text/cql", // unknown mime type
      })
    ).toStrictEqual("string")
    expect(
      sample({
        type: "string",
        contentMediaType: "application/json",
      })
    ).toStrictEqual('{"key":"value"}')
    expect(
      sample({
        type: "string",
        contentMediaType: "application/ld+json",
      })
    ).toStrictEqual('{"name": "John Doe"}')
    expect(
      sample({
        type: "string",
        contentMediaType: "application/x-httpd-php",
      })
    ).toStrictEqual("<?php echo '<p>Hello World!</p>'; ?>")
    expect(
      sample({
        type: "string",
        contentMediaType: "application/rtf",
      })
    ).toStrictEqual(String.raw`{\rtf1\adeflang1025\ansi\ansicpg1252\uc1`)
    expect(
      sample({
        type: "string",
        contentMediaType: "application/x-sh",
      })
    ).toStrictEqual('echo "Hello World!"')
    expect(
      sample({
        type: "string",
        contentMediaType: "application/xhtml+xml",
      })
    ).toStrictEqual("<p>content</p>")
  })

  it("should strip parameters from contentMediaType and recognizes it", function () {
    expect(sample({
      type: "string",
      contentMediaType: "text/css",
    })).toStrictEqual(
      ".selector { border: 1px solid red }"
    )
  })

  it("should handle combination of format + contentMediaType", function () {
    expect(sample({
      type: "string",
      format: "hostname",
      contentMediaType: "text/css",
    })).toStrictEqual("example.com")
  })

  it("should handle contentSchema defined as type=object", function () {
    expect(sample({
      type: "string",
      contentMediaType: "application/json",
      contentSchema: {
        type: "object",
        properties: {
          a: { const: "b" },
        },
      },
    })).toStrictEqual('{"a":"b"}')
  })

  it("should handle contentSchema defined as type=string", function () {
    expect(sample({
      type: "string",
      contentMediaType: "text/plain",
      contentSchema: {
        type: "string",
      },
    })).toStrictEqual("string")
  })

  it("should handle contentSchema defined as type=number", function () {
    expect(sample({
      type: "string",
      contentMediaType: "text/plain",
      contentSchema: {
        type: "number",
      },
    })).toStrictEqual("0")
  })

  it("should handle type keyword defined as list of types", function () {
    const expected = {}

    expect(sample({ type: ["object", "string"] })).toEqual(expected)
  })

  it("should handle primitive types defined as list of types", function () {
    const expected = "string"

    expect(sample({ type: ["string", "number"] })).toEqual(expected)
  })

  it("should handle nullable primitive types defined as list of types", function () {
    expect(sample({ type: ["string", "null"] })).toStrictEqual("string")
    expect(sample({ type: ["null", "string"] })).toStrictEqual("string")
    expect(sample({ type: ["number", "null"] })).toStrictEqual(0)
    expect(sample({ type: ["null", "number"] })).toStrictEqual(0)
    expect(sample({ type: ["integer", "null"] })).toStrictEqual(0)
    expect(sample({ type: ["null", "integer"] })).toStrictEqual(0)
    expect(sample({ type: ["boolean", "null"] })).toStrictEqual(true)
    expect(sample({ type: ["null", "boolean"] })).toStrictEqual(true)
    expect(sample({ type: ["null"] })).toStrictEqual(null)
  })

  it("should return const value", function () {
    const expected = 3

    expect(sample({ const: 3 })).toStrictEqual(expected)
  })

  it("handles Immutable.js objects for nested schemas", function () {
    const expected = {
      json: {
        a: "string",
      },
    }

    expect(sample({
      type: "object",
      properties: {
        json: {
          type: "object",
          example: {
            a: "string",
          },
          properties: {
            a: {
              type: "string",
            },
          },
        },
      },
    })).toEqual(
      expected
    )
  })

  it("should return first enum value if only enum is provided", function () {
    const expected = "probe"
    expect(sample({
      enum: ["probe"],
    })).toEqual(
      expected
    )
  })

  it("combine first oneOf or anyOf with schema's definitions", function () {
    let definition = {
      type: "object",
      anyOf: [
        {
          type: "object",
          properties: {
            test2: {
              type: "string",
              example: "anyOf",
            },
            test: {
              type: "string",
              example: "anyOf",
            },
          },
        },
      ],
      properties: {
        test: {
          type: "string",
          example: "schema",
        },
      },
    }

    let expected = {
      test: "schema",
      test2: "anyOf",
    }

    expect(sample(definition)).toEqual(
      expected
    )

    definition = {
      type: "object",
      oneOf: [
        {
          type: "object",
          properties: {
            test2: {
              type: "string",
              example: "oneOf",
            },
            test: {
              type: "string",
              example: "oneOf",
            },
          },
        },
      ],
      properties: {
        test: {
          type: "string",
          example: "schema",
        },
      },
    }

    expected = {
      test: "schema",
      test2: "oneOf",
    }

    expect(sample(definition)).toEqual(
      expected
    )
  })

  it("regex pattern test", function () {
    const definition = {
      type: "object",
      properties: {
        macAddress: {
          type: "string",
          pattern: "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$",
        },
      },
    }
    const resp = sample(definition)

    expect(
      new RegExp("^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", "g").test(
        resp.macAddress
      )
    ).toBe(true)
  })

  it("returns object without deprecated fields for parameter", function () {
    const definition = {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
        deprecatedProperty: {
          deprecated: true,
          type: "string",
        },
      },
      xml: {
        name: "animals",
      },
    }

    const expected = {
      id: 0,
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("returns example value for date-time property", () => {
    const definition = {
      type: "string",
      format: "date-time",
    }

    const expected = "2018-11-13T20:20:39+00:00"

    expect(sample(definition)).toContain(expected)
  })

  it("returns example value for date property", () => {
    const definition = {
      type: "string",
      format: "date",
    }

    const expected = "2018-11-13"

    expect(sample(definition)).toEqual(expected)
  })

  it("returns a UUID for a string with format=uuid", () => {
    const definition = {
      type: "string",
      format: "uuid",
    }

    const expected = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

    expect(sample(definition)).toEqual(expected)
  })

  it("returns a hostname for a string with format=hostname", () => {
    const definition = {
      type: "string",
      format: "hostname",
    }

    const expected = "example.com"

    expect(sample(definition)).toEqual(expected)
  })

  it("returns an IPv4 address for a string with format=ipv4", () => {
    const definition = {
      type: "string",
      format: "ipv4",
    }

    const expected = "198.51.100.42"

    expect(sample(definition)).toEqual(expected)
  })

  it("returns an IPv6 address for a string with format=ipv6", () => {
    const definition = {
      type: "string",
      format: "ipv6",
    }

    const expected = "2001:0db8:5b96:0000:0000:426f:8e17:642a"

    expect(sample(definition)).toEqual(expected)
  })

  describe("for array type", () => {
    it("returns array with sample of array type", () => {
      const definition = {
        type: "array",
        items: {
          type: "integer",
        },
      }

      const expected = [0]

      expect(sample(definition)).toEqual(expected)
    })

    it("returns string for example for array that has example of type string", () => {
      const definition = {
        type: "array",
        items: {
          type: "string",
        },
        example: "dog",
      }

      const expected = "dog"

      expect(sample(definition)).toEqual(expected)
    })

    it("returns array of examples for array that has examples", () => {
      const definition = {
        type: "array",
        items: {
          type: "string",
        },
        example: ["dog", "cat"],
      }

      const expected = ["dog", "cat"]

      expect(sample(definition)).toEqual(expected)
    })

    it("returns array of samples for oneOf with objects", function () {
      const definition = {
        type: "array",
        items: {
          oneOf: [
            {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
              },
            },
            {
              type: "object",
              properties: {
                id: {
                  type: "string",
                },
              },
            },
          ],
        },
      }

      const expected = [{ name: "string" }, { id: "string" }]

      expect(sample(definition)).toStrictEqual(expected)
    })

    it("returns null for a null example", () => {
      const definition = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            nullable: true,
            example: null,
          },
        },
      }

      const expected = {
        foo: null,
      }

      expect(sample(definition)).toEqual(expected)
    })

    it("returns null for a null object-level example", () => {
      const definition = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            nullable: true,
          },
        },
        example: {
          foo: null,
        },
      }

      const expected = {
        foo: null,
      }

      expect(sample(definition)).toEqual(expected)
    })
  })

  describe("discriminator mapping example", () => {
    /*it("returns an example where discriminated field is equal to mapping value", () => {
      const definition = {
        type: "array",
        items: {
          oneOf: [
            {
              required: ["type"],
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["TYPE1", "TYPE2"],
                },
              },
              discriminator: {
                propertyName: "type",
                mapping: {
                  TYPE1: "#/components/schemas/FirstDto",
                  TYPE2: "#/components/schemas/SecondDto",
                },
              },
              $$ref:
                "examples/swagger-config.yaml#/components/schemas/FirstDto",
            },
            {
              required: ["type"],
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["TYPE1", "TYPE2"],
                },
              },
              discriminator: {
                propertyName: "type",
                mapping: {
                  TYPE1: "#/components/schemas/FirstDto",
                  TYPE2: "#/components/schemas/SecondDto",
                },
              },
              $$ref:
                "examples/swagger-config.yaml#/components/schemas/SecondDto",
            },
          ],
        },
      }

      const expected = [
        {
          type: "TYPE1",
        },
        {
          type: "TYPE2",
        },
      ]

      expect(sample(definition)).toEqual(expected)
    })*/

    it("should not throw if expected $$ref is missing, and should fallback to default behavior", () => {
      const definition = {
        type: "array",
        items: {
          oneOf: [
            {
              required: ["type"],
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["TYPE1", "TYPE2"],
                },
              },
              discriminator: {
                propertyName: "type",
                mapping: {
                  TYPE1: "#/components/schemas/FirstDto",
                  TYPE2: "#/components/schemas/SecondDto",
                },
              },
            },
            {
              required: ["type"],
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["TYPE1", "TYPE2"],
                },
              },
              discriminator: {
                propertyName: "type",
                mapping: {
                  TYPE1: "#/components/schemas/FirstDto",
                  TYPE2: "#/components/schemas/SecondDto",
                },
              },
            },
          ],
        },
      }

      expect(() => {
        sample(definition)
      }).not.toThrow()
    })
  })

  it("should merge properties with anyOf", () => {
    const definition = {
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
      },
      anyOf: [
        {
          type: "object",
          properties: {
            bar: {
              type: "boolean",
            },
          },
        },
      ],
    }

    const expected = {
      foo: "string",
      bar: true,
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should merge array item properties with anyOf", () => {
    const definition = {
      type: "array",
      items: {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
        anyOf: [
          {
            type: "object",
            properties: {
              bar: {
                type: "boolean",
              },
            },
          },
        ],
      },
    }

    const expected = [
      {
        foo: "string",
        bar: true,
      },
    ]

    expect(sample(definition)).toEqual(expected)
  })

  it("should merge properties with oneOf", () => {
    const definition = {
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
      },
      oneOf: [
        {
          type: "object",
          properties: {
            bar: {
              type: "boolean",
            },
          },
        },
      ],
    }

    const expected = {
      foo: "string",
      bar: true,
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should merge array item properties with oneOf", () => {
    const definition = {
      type: "array",
      items: {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
        oneOf: [
          {
            type: "object",
            properties: {
              bar: {
                type: "boolean",
              },
            },
          },
        ],
      },
    }

    const expected = [
      {
        foo: "string",
        bar: true,
      },
    ]

    expect(sample(definition)).toEqual(expected)
  })

  it("should merge items with anyOf", () => {
    const definition = {
      type: "array",
      anyOf: [
        {
          type: "array",
          items: {
            type: "boolean",
          },
        },
      ],
    }

    const expected = [true]

    expect(sample(definition)).toEqual(expected)
  })

  it("should merge items with oneOf", () => {
    const definition = {
      type: "array",
      oneOf: [
        {
          type: "array",
          items: {
            type: "boolean",
          },
        },
      ],
    }

    const expected = [true]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle additionalProperties", () => {
    const definition = {
      type: "object",
      additionalProperties: {
        type: "string",
      },
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
      additionalProp1: "string",
      additionalProp2: "string",
      additionalProp3: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle additionalProperties with x-additionalPropertiesName", () => {
    const definition = {
      type: "object",
      additionalProperties: {
        type: "string",
        "x-additionalPropertiesName": "bar",
      },
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
      bar1: "string",
      bar2: "string",
      bar3: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle additionalProperties=true", () => {
    const definition = {
      type: "object",
      additionalProperties: true,
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
      additionalProp1: {},
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle additionalProperties=false", () => {
    const definition = {
      type: "object",
      additionalProperties: false,
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should ignore minProperties if cannot extend object", () => {
    const definition = {
      type: "object",
      minProperties: 2,
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minProperties in conjunction with additionalProperties", () => {
    const definition = {
      type: "object",
      minProperties: 2,
      additionalProperties: {
        type: "string",
      },
    }

    const expected = {
      additionalProp1: "string",
      additionalProp2: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minProperties in conjunction with properties and additionalProperties", () => {
    const definition = {
      type: "object",
      minProperties: 2,
      additionalProperties: true,
      properties: {
        foo: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
      additionalProp1: {},
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minProperties in conjunction with additionalProperties and anyOf", () => {
    const definition = {
      type: "object",
      minProperties: 2,
      additionalProperties: true,
      anyOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
          },
        },
      ],
    }

    const expected = {
      foo: "string",
      additionalProp1: {},
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxProperties", () => {
    const definition = {
      type: "object",
      maxProperties: 1,
      properties: {
        foo: {
          type: "string",
        },
        swaggerUi: {
          type: "string",
        },
      },
    }

    const expected = {
      foo: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxProperties in conjunction with additionalProperties", () => {
    const definition = {
      type: "object",
      maxProperties: 1,
      additionalProperties: true,
    }

    const expected = {
      additionalProp1: {},
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxProperties in conjunction with anyOf", () => {
    const definition = {
      type: "object",
      maxProperties: 1,
      anyOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            swaggerUi: {
              type: "string",
            },
          },
        },
      ],
    }

    const expected = {
      foo: "string",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle handle maxProperties in conjunction with required", () => {
    const definition = {
      type: "object",
      maxProperties: 1,
      required: ["swaggerUi"],
      properties: {
        foo: {
          type: "string",
        },
        swaggerUi: {
          type: "string",
          example: "<3",
        },
      },
    }

    const expected = {
      swaggerUi: "<3",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle handle maxProperties in conjunction with anyOf required", () => {
    const definition = {
      type: "object",
      maxProperties: 1,
      required: ["swaggerUi"],
      anyOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            swaggerUi: {
              type: "string",
              example: "<3",
            },
          },
        },
      ],
    }

    const expected = {
      swaggerUi: "<3",
    }

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minItems", () => {
    const definition = {
      type: "array",
      minItems: 2,
      items: {
        type: "string",
      },
    }

    const expected = ["string", "string"]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxItems", () => {
    const definition = {
      type: "array",
      minItems: 4,
      maxItems: 7,
      items: {
        type: "string",
      },
    }

    const expected = sample(definition).length

    expect(expected).toBeGreaterThanOrEqual(4)
    expect(expected).toBeLessThanOrEqual(7)
  })

  it("should handle uniqueItems", () => {
    const definition = {
      type: "array",
      minItems: 2,
      uniqueItems: true,
      items: {
        type: "string",
      },
    }

    const expected = ["string"]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minItems with example", () => {
    const definition = {
      type: "array",
      minItems: 2,
      items: {
        type: "string",
        example: "some",
      },
    }

    const expected = ["some", "some"]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minItems in conjunction with oneOf", () => {
    const definition = {
      type: "array",
      minItems: 4,
      items: {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      },
    }

    const expected = ["string", 0, "string", 0]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxItems in conjunction with multiple oneOf", () => {
    const definition = {
      type: "array",
      maxItems: 1,
      items: {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      },
    }

    const expected = ["string"]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle contains", () => {
    const definition = {
      type: "array",
      contains: {
        type: "number",
      },
    }

    const expected = [0]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minContains", () => {
    const definition = {
      type: "array",
      minContains: 3,
      contains: {
        type: "number",
      },
    }

    const expected = [0, 0, 0]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minContains with minItems", () => {
    const definition = {
      type: "array",
      minContains: 3,
      minItems: 4,
      contains: {
        type: "number",
      },
      items: {
        type: "string",
      },
    }

    const expected = [0, 0, 0, "string"]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxContains", () => {
    const definition = {
      type: "array",
      maxContains: 3,
      contains: {
        type: "number",
      },
    }

    const expected = [0]

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle minimum for number", () => {
    const definition = {
      type: "number",
      minimum: 5,
    }

    const expected = 5

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle exclusiveMinimum for number", () => {
    const definition = {
      type: "number",
      exclusiveMinimum: 5,
    }
    const expected = 6

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maximum for number", () => {
    const definition = {
      type: "number",
      maximum: -1,
    }

    const expected = -1

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle exclusiveMaximum for number", () => {
    const definition = {
      type: "number",
      exclusiveMaximum: -1,
    }

    const expected = -2

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle multipleOf for number", () => {
    const definition = {
      type: "number",
      minimum: 22,
      multipleOf: 3,
    }

    const expected = 24

    expect(sample(definition)).toStrictEqual(expected)
  })

  it("should handle minimum for integer", () => {
    const definition = {
      type: "integer",
      minimum: 5,
    }

    const expected = 5

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle exclusiveMinimum for integer", () => {
    const definition = {
      type: "integer",
      exclusiveMinimum: 5,
    }
    const expected = 6

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maximum for integer", () => {
    const definition = {
      type: "integer",
      maximum: -1,
    }

    const expected = -1

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle exclusiveMaximum for integer", () => {
    const definition = {
      type: "integer",
      exclusiveMaximum: -1,
    }

    const expected = -2

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle multipleOf for integer", () => {
    const definition = {
      type: "integer",
      minimum: 22,
      multipleOf: 3,
    }

    const expected = 24

    expect(sample(definition)).toStrictEqual(expected)
  })

  it("should handle minLength", () => {
    const definition = {
      type: "string",
      minLength: 7,
    }

    const expected = "strings"

    expect(sample(definition)).toEqual(expected)
  })

  it("should handle maxLength", () => {
    const definition = {
      type: "string",
      maxLength: 3,
    }

    const expected = "str"

    expect(sample(definition)).toEqual(expected)
  })
});