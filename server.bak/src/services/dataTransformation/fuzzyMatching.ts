import { logger } from '../../utils/logger';

/**
 * Interface for fuzzy matching options
 */
export interface FuzzyMatchOptions {
  threshold?: number;
  caseSensitive?: boolean;
  ignoreSpecialChars?: boolean;
  normalizeAddresses?: boolean;
  scoreFunction?: (s1: string, s2: string) => number;
}

/**
 * Interface for fuzzy matching result
 */
export interface FuzzyMatchResult {
  value: string;
  score: number;
  index: number;
}

/**
 * Default fuzzy matching options
 */
const defaultOptions: FuzzyMatchOptions = {
  threshold: 0.8,
  caseSensitive: false,
  ignoreSpecialChars: true,
  normalizeAddresses: true
};

/**
 * Utility class for fuzzy matching of property records
 */
export class FuzzyMatcher {
  private options: FuzzyMatchOptions;

  constructor(options: FuzzyMatchOptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }
  
  /**
   * Compare two strings and return a similarity score (0-1)
   * @param s1 First string
   * @param s2 Second string
   * @returns Similarity score between 0 and 1
   */
  compare(s1: string, s2: string): number {
    if (this.options.scoreFunction) {
      return this.options.scoreFunction(s1, s2);
    }
    
    // Default to Levenshtein distance for string similarity
    const prep1 = this.preprocessString(s1);
    const prep2 = this.preprocessString(s2);
    
    return this.levenshteinSimilarity(prep1, prep2);
  }
  
  /**
   * Find best match for a string in an array of strings
   * @param needle String to match
   * @param haystack Array of strings to match against
   * @param threshold Optional minimum similarity threshold (0-1)
   * @returns Best match and score
   */
  findBestMatch(needle: string, haystack: string[], threshold?: number): FuzzyMatchResult | null {
    if (!needle || !haystack || haystack.length === 0) {
      logger.warn('Empty inputs provided to fuzzy matcher');
      return null;
    }
    
    const minThreshold = threshold ?? (this.options.threshold || 0.7);
    let bestMatch = '';
    let bestScore = minThreshold;
    let bestIndex = -1;
    
    // Normalize the query
    const normalizedNeedle = this.preprocessString(needle);
    
    for (let i = 0; i < haystack.length; i++) {
      const score = this.compare(normalizedNeedle, haystack[i]);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = haystack[i];
        bestIndex = i;
      }
    }
    
    if (bestIndex === -1) {
      return null;
    }
    
    return { 
      value: bestMatch, 
      score: bestScore, 
      index: bestIndex 
    };
  }
  
  /**
   * Find all matches above a threshold in a list of strings
   * @param query The string to match
   * @param choices The array of possible matches
   * @param threshold The minimum similarity score to consider a match (0-1)
   * @returns Array of matches that meet the threshold, sorted by score
   */
  findAllMatches(query: string, choices: string[], threshold = 0.7): FuzzyMatchResult[] {
    if (!query || !choices || choices.length === 0) {
      return [];
    }
    
    const matches: FuzzyMatchResult[] = [];
    
    // Normalize the query
    const normalizedQuery = this.preprocessString(query);
    
    // Compare against each choice
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const score = this.compare(normalizedQuery, choice);
      
      // Add to matches if above threshold
      if (score >= threshold) {
        matches.push({
          value: choice,
          score,
          index: i
        });
      }
    }
    
    // Sort matches by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Check if two strings match based on configured threshold
   * @param s1 First string
   * @param s2 Second string
   * @returns Whether the strings are considered a match
   */
  isMatch(s1: string, s2: string): boolean {
    const score = this.compare(s1, s2);
    return score >= (this.options.threshold || 0.8);
  }
  
  /**
   * Levenshtein distance algorithm for string similarity
   */
  private levenshteinSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    // Initialize the distance matrix
    const matrix: number[][] = [];
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [];
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill the distance matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost  // substitution
        );
      }
    }
    
    // Calculate similarity score based on distance
    const maxDistance = Math.max(len1, len2);
    const distance = matrix[len1][len2];
    
    return 1 - (distance / maxDistance);
  }
  
  /**
   * Preprocess string for comparison based on options
   */
  private preprocessString(str: string): string {
    if (!str) return '';
    
    let result = str;
    
    // Apply case sensitivity option
    if (!this.options.caseSensitive) {
      result = result.toLowerCase();
    }
    
    // Apply special characters option
    if (this.options.ignoreSpecialChars) {
      result = result.replace(/[^\w\s]/gi, '');
    }
    
    // Apply address normalization
    if (this.options.normalizeAddresses) {
      // Replace common address abbreviations
      result = result
        .replace(/\b(st|str)\b/i, 'street')
        .replace(/\b(rd)\b/i, 'road')
        .replace(/\b(ave)\b/i, 'avenue')
        .replace(/\b(blvd)\b/i, 'boulevard')
        .replace(/\b(dr)\b/i, 'drive')
        .replace(/\b(ln)\b/i, 'lane')
        .replace(/\b(ct)\b/i, 'court');
    }
    
    return result.trim();
  }
}

// Export a singleton instance with default options
export const fuzzyMatcher = new FuzzyMatcher(); 