declare module 'csv-writer' {
  export interface Header {
    id: string;
    title: string;
  }

  export interface ObjectCsvStringifierParams {
    header: Header[];
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
  }

  export interface ObjectCsvStringifier {
    getHeaderString(): string;
    stringifyRecords(records: any[]): string;
  }

  export function createObjectCsvStringifier(params: ObjectCsvStringifierParams): ObjectCsvStringifier;
} 