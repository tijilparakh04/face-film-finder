
/**
 * A simple CSV parser that handles various edge cases:
 * - Fields with commas inside quotes
 * - Fields with quotes
 * - Fields with newlines inside quotes
 */
export function parseCSV(csvText: string, delimiter: string = '\t'): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = i < csvText.length - 1 ? csvText[i + 1] : '';
    
    // Handle quotes
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double quotes inside quotes - add a single quote
        currentField += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    }
    // Handle delimiters
    else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    }
    // Handle newlines
    else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // Skip \n in \r\n
      
      // Only add non-empty rows (skip empty lines)
      if (currentField.trim() !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
      }
      
      currentRow = [];
      currentField = '';
    }
    // Regular character
    else {
      currentField += char;
    }
  }
  
  // Add the last field and row if they exist
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Converts CSV rows to an array of objects using the header row as keys
 */
export function csvRowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return []; // Need at least a header row and one data row
  
  const headers = rows[0];
  const objects: T[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== headers.length) {
      console.warn(`Row ${i} has ${row.length} fields, expected ${headers.length}`);
      continue;
    }
    
    const obj: any = {};
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    
    objects.push(obj as T);
  }
  
  return objects;
}
