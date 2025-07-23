import normalizeSchema from "./normalizeSchema.js";

describe('normalizeSchema', () => {
  test('should normalize a schema with a single type', () => {
    const schema = { type: 'string' };
    const result = normalizeSchema(schema, '#', {});
    expect(result.type).toBe('string');
  });

  test('should normalize a schema with an enum', () => {
    const schema = { type: 'string', enum: ['a', 'b', 'c'] };
    const result = normalizeSchema(schema, '#', {});
    expect(result.oneOf).toEqual([{ const: 'a' }, { const: 'b' }, { const: 'c' }]);
  });

  test('should leave a schema with oneOf', () => {
    const schema = { oneOf: [{ const: 'a' }, { const: 'b' }, { const: 'c' }] };
    const result = normalizeSchema(schema, '#', {});
    expect(result.oneOf).toEqual([{ const: 'a' }, { const: 'b' }, { const: 'c' }]);
  });

  test('should handle schema with const', () => {
    const schema = { type: 'string', const: 'value' };
    const result = normalizeSchema(schema, '#', {});
    expect(result.const).toBe('value');
  });

  test('should handle integer', () => {
    const schema = {
      "type": "integer",
      "minimum": 0,
      "maximum": 10
    };
    const result = normalizeSchema(schema, '#', {});
    expect(result).toEqual({
      "type": "integer",
      "minimum": 0,
      "maximum": 10
    });
  });

  test('should normalize a schema with multiple types', () => {
    const schema = { type: ['string', 'number'] };
    const result = normalizeSchema(schema, '#', {});
    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf[0].type).toBe('string');
    expect(result.oneOf[1].type).toBe('number');
  });
});