import { type PlateSetUi, schemaToUiPlateSet, uiToSchemaPlateSet } from '../plateSetMapping';

describe('schemaToUiPlateSet', () => {
  it("maps 'standard' → 'standard'", () => {
    expect(schemaToUiPlateSet('standard')).toBe('standard');
  });

  it("maps 'kg-standard' → 'metric'", () => {
    expect(schemaToUiPlateSet('kg-standard')).toBe('metric');
  });
});

describe('uiToSchemaPlateSet', () => {
  it("maps 'standard' → 'standard'", () => {
    expect(uiToSchemaPlateSet('standard')).toBe('standard');
  });

  it("maps 'metric' → 'kg-standard'", () => {
    expect(uiToSchemaPlateSet('metric')).toBe('kg-standard');
  });

  it("maps 'custom' → null (never persisted)", () => {
    expect(uiToSchemaPlateSet('custom')).toBeNull();
  });
});

describe('roundtrip', () => {
  it('schema → UI → schema is identity for persistable values', () => {
    expect(uiToSchemaPlateSet(schemaToUiPlateSet('standard'))).toBe('standard');
    expect(uiToSchemaPlateSet(schemaToUiPlateSet('kg-standard'))).toBe('kg-standard');
  });

  it('UI → schema → UI is identity for persistable values', () => {
    const values: PlateSetUi[] = ['standard', 'metric'];
    for (const ui of values) {
      const schema = uiToSchemaPlateSet(ui);
      expect(schema).not.toBeNull();
      if (schema !== null) {
        expect(schemaToUiPlateSet(schema)).toBe(ui);
      }
    }
  });
});
