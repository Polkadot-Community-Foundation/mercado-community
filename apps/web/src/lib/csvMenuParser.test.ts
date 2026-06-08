import { describe, it, expect } from 'vitest';

import { parseMenuCSV, generateMenuCSVTemplate } from './csvMenuParser';

describe('parseMenuCSV', () => {
  it('parses a simple CSV with required fields', () => {
    const csv = `name,description,price
Burger,Juicy beef burger,15.00
Fries,Crispy fries,5.50`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes).toHaveLength(2);
    expect(result.dishes[0].name).toBe('Burger');
    expect(result.dishes[0].description).toBe('Juicy beef burger');
    expect(result.dishes[0].basePrice).toBe('15');
    expect(result.dishes[0].inStock).toBe(true);
    expect(result.dishes[1].name).toBe('Fries');
  });

  it('parses inStock field correctly', () => {
    const csv = `name,price,inStock
Item1,10.00,true
Item2,10.00,false
Item3,10.00,1
Item4,10.00,0
Item5,10.00,`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes[0].inStock).toBe(true);
    expect(result.dishes[1].inStock).toBe(false);
    expect(result.dishes[2].inStock).toBe(true);
    expect(result.dishes[3].inStock).toBe(false);
    expect(result.dishes[4].inStock).toBe(true); // empty defaults to true
  });

  it('parses options columns', () => {
    const csv = `name,price,option1_name,option1_price,option2_name,option2_price
Pizza,20.00,Extra Cheese,2.00,Pepperoni,3.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes[0].options).toHaveLength(2);
    expect(result.dishes[0].options[0].name).toBe('Extra Cheese');
    expect(result.dishes[0].options[0].price).toBe('2');
    expect(result.dishes[0].options[1].name).toBe('Pepperoni');
    expect(result.dishes[0].options[1].price).toBe('3');
  });

  it('skips empty option names', () => {
    const csv = `name,price,option1_name,option1_price,option2_name,option2_price
Salad,10.00,Dressing,1.00,,`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes[0].options).toHaveLength(1);
    expect(result.dishes[0].options[0].name).toBe('Dressing');
  });

  it('handles quoted fields with commas', () => {
    const csv = `name,description,price
"Combo Deal","Burger, fries, and drink",25.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes[0].name).toBe('Combo Deal');
    expect(result.dishes[0].description).toBe('Burger, fries, and drink');
  });

  it('handles quoted fields with escaped quotes', () => {
    const csv = `name,description,price
"Chef's ""Special""",Great dish,15.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes[0].name).toBe('Chef\'s "Special"');
  });

  it('returns error for missing name column', () => {
    const csv = `description,price
Some desc,10.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toContain('Missing required column: name');
    expect(result.dishes).toHaveLength(0);
  });

  it('returns error for missing price column', () => {
    const csv = `name,description
Burger,Tasty`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toContain('Missing required column: price');
    expect(result.dishes).toHaveLength(0);
  });

  it('returns error for row with missing name', () => {
    const csv = `name,price
Burger,10.00
,15.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Row 3: Missing dish name');
    expect(result.dishes).toHaveLength(1);
  });

  it('returns error for row with invalid price', () => {
    const csv = `name,price
Burger,10.00
Fries,invalid`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Row 3: Invalid price');
    expect(result.dishes).toHaveLength(1);
  });

  it('returns error for empty file', () => {
    const result = parseMenuCSV('');

    // Empty string results in missing column errors since there's no header
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.dishes).toHaveLength(0);
  });

  it('skips empty lines', () => {
    const csv = `name,price
Burger,10.00

Fries,5.00`;

    const result = parseMenuCSV(csv);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes).toHaveLength(2);
  });
});

describe('generateMenuCSVTemplate', () => {
  it('generates a valid CSV template', () => {
    const template = generateMenuCSVTemplate();

    expect(template).toContain('name,description,price,inStock');
    expect(template).toContain('option1_name,option1_price');
    expect(template).toContain('Margherita Pizza');
  });

  it('template can be parsed by parseMenuCSV', () => {
    const template = generateMenuCSVTemplate();
    const result = parseMenuCSV(template);

    expect(result.errors).toHaveLength(0);
    expect(result.dishes.length).toBeGreaterThan(0);
  });
});
