import type { MenuEditorDish } from '../components/MenuEditor/MenuEditor';

export type CSVParseResult = {
  dishes: MenuEditorDish[];
  errors: string[];
};

function generateId(): string {
  return `dish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateOptionId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Parse CSV content into menu dishes.
 *
 * Expected CSV format:
 * name,description,price,inStock,option1_name,option1_price,option2_name,option2_price,...
 *
 * - name: Required, dish name
 * - description: Optional, dish description
 * - price: Required, base price in DOT (e.g., "12.50")
 * - inStock: Optional, "true"/"false" or "1"/"0" (defaults to true)
 * - option{N}_name/option{N}_price: Optional pairs for add-on options
 */
export function parseMenuCSV(content: string): CSVParseResult {
  const lines = content.trim().split(/\r?\n/);
  const errors: string[] = [];
  const dishes: MenuEditorDish[] = [];

  if (lines.length === 0) {
    return { dishes: [], errors: ['CSV file is empty'] };
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

  const nameIdx = headers.indexOf('name');
  const descIdx = headers.indexOf('description');
  const priceIdx = headers.indexOf('price');
  const inStockIdx = headers.indexOf('instock');

  if (nameIdx === -1) {
    errors.push('Missing required column: name');
  }
  if (priceIdx === -1) {
    errors.push('Missing required column: price');
  }

  if (errors.length > 0) {
    return { dishes: [], errors };
  }

  // Find option columns (option1_name, option1_price, option2_name, etc.)
  const optionColumns: Array<{ nameIdx: number; priceIdx: number }> = [];
  for (let i = 1; i <= 10; i++) {
    const optNameIdx = headers.indexOf(`option${i}_name`);
    const optPriceIdx = headers.indexOf(`option${i}_price`);
    if (optNameIdx !== -1) {
      optionColumns.push({
        nameIdx: optNameIdx,
        priceIdx: optPriceIdx,
      });
    }
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const name = values[nameIdx]?.trim() ?? '';
    const description = descIdx !== -1 ? (values[descIdx]?.trim() ?? '') : '';
    const priceStr = values[priceIdx]?.trim() ?? '';
    const inStockStr =
      inStockIdx !== -1 ? (values[inStockIdx]?.trim() ?? '') : '';

    if (!name) {
      errors.push(`Row ${i + 1}: Missing dish name`);
      continue;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      errors.push(`Row ${i + 1}: Invalid price "${priceStr}"`);
      continue;
    }

    const inStock =
      inStockStr === '' ||
      inStockStr === '1' ||
      inStockStr.toLowerCase() === 'true' ||
      inStockStr.toLowerCase() === 'yes';

    // Parse options
    const options: MenuEditorDish['options'] = [];
    for (const optCol of optionColumns) {
      const optName = values[optCol.nameIdx]?.trim() ?? '';
      if (!optName) continue;

      const optPriceStr =
        optCol.priceIdx !== -1 ? (values[optCol.priceIdx]?.trim() ?? '0') : '0';
      const optPrice = parseFloat(optPriceStr);

      options.push({
        id: generateOptionId(),
        name: optName,
        price: isNaN(optPrice) ? '0' : optPrice.toString(),
      });
    }

    dishes.push({
      id: generateId(),
      name,
      description,
      basePrice: price.toString(),
      inStock,
      options,
    });
  }

  if (dishes.length === 0 && errors.length === 0) {
    errors.push('No valid dishes found in CSV');
  }

  return { dishes, errors };
}

/**
 * Parse a single CSV line, handling quoted fields and commas within quotes.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Generate a sample CSV template for menu import.
 */
export function generateMenuCSVTemplate(): string {
  return `name,description,price,inStock,option1_name,option1_price,option2_name,option2_price
"Margherita Pizza","Classic tomato and mozzarella",15.00,true,"Extra Cheese",2.00,"Gluten-Free Crust",3.00
"Caesar Salad","Fresh romaine with parmesan",12.50,true,"Add Chicken",4.00,
"Garlic Bread","House-made with herbs",6.00,true,,,`;
}
