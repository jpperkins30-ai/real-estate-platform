#!/usr/bin/env node
/**
 * Log tools - A command-line utility for working with application logs
 * 
 * Usage:
 *   npx ts-node log-tools.ts <command> [options]
 * 
 * Commands:
 *   search      Search logs with filters
 *   analyze     Analyze logs for patterns
 *   stats       Show statistics about logs
 *   clean       Clean old log files
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import zlib from 'zlib';
import { createReadStream } from 'fs';
import { program } from 'commander';

// Constants
const LOG_DIR = path.join(process.cwd(), 'logs');

// Setup command-line interface
program
  .name('log-tools')
  .description('Command-line utility for analyzing application logs')
  .version('1.0.0');

// Helper to get all log files
function getLogFiles(pattern: string = '.*\\.log(\\.gz)?$'): string[] {
  if (!fs.existsSync(LOG_DIR)) {
    console.error(`Log directory does not exist: ${LOG_DIR}`);
    process.exit(1);
  }

  const fileRegex = new RegExp(pattern);
  return fs.readdirSync(LOG_DIR)
    .filter(file => fileRegex.test(file))
    .map(file => path.join(LOG_DIR, file));
}

// Helper to create appropriate read stream based on file extension
function createAppropriateReadStream(filePath: string) {
  const readStream = createReadStream(filePath);
  
  if (filePath.endsWith('.gz')) {
    return readStream.pipe(zlib.createGunzip());
  }
  
  return readStream;
}

// Search command implementation
program
  .command('search')
  .description('Search logs with filters')
  .option('-l, --level <level>', 'Filter by log level (error, warn, info, http, debug)')
  .option('-d, --date <date>', 'Filter by date (YYYY-MM-DD)')
  .option('-m, --message <text>', 'Search in message text')
  .option('-u, --user <userId>', 'Filter by user ID')
  .option('-f, --files <pattern>', 'File pattern to search in (regex)')
  .option('-j, --json', 'Output results as JSON')
  .action(async (options) => {
    const files = getLogFiles(options.files);
    console.log(`Searching ${files.length} log files...`);
    
    let count = 0;
    const results: any[] = [];
    
    for (const file of files) {
      if (options.date && !file.includes(options.date)) {
        continue;
      }
      
      const stream = createAppropriateReadStream(file);
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
      });
      
      for await (const line of rl) {
        try {
          const logEntry = JSON.parse(line);
          
          // Apply filters
          if (options.level && logEntry.level !== options.level) continue;
          if (options.message && !logEntry.message.includes(options.message)) continue;
          if (options.user && 
            (!logEntry.meta || 
             (!logEntry.meta.userId && !logEntry.userId) || 
             (logEntry.meta.userId !== options.user && logEntry.userId !== options.user)
            )) continue;
            
          // Output entry
          if (options.json) {
            results.push(logEntry);
          } else {
            console.log(`[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`);
            if (logEntry.meta) {
              console.log('  Metadata:', JSON.stringify(logEntry.meta, null, 2));
            }
            console.log('  Source:', path.basename(file));
            console.log('---');
          }
          
          count++;
        } catch (error) {
          // Skip lines that aren't valid JSON
          continue;
        }
      }
    }
    
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    }
    
    console.log(`Found ${count} matching log entries`);
  });

// Stats command implementation
program
  .command('stats')
  .description('Show statistics about logs')
  .option('-d, --days <number>', 'Number of days to analyze', '7')
  .action(async (options) => {
    const days = parseInt(options.days);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const files = getLogFiles();
    console.log(`Analyzing logs for the last ${days} days...`);
    
    const stats = {
      totalEntries: 0,
      byLevel: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
      topErrors: [] as { message: string; count: number }[],
      errorMessages: {} as Record<string, number>
    };
    
    for (const file of files) {
      // Skip files older than cutoff date
      const fileDate = file.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (fileDate && new Date(fileDate) < cutoffDate) {
        continue;
      }
      
      const stream = createAppropriateReadStream(file);
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
      });
      
      for await (const line of rl) {
        try {
          const logEntry = JSON.parse(line);
          stats.totalEntries++;
          
          // Count by level
          stats.byLevel[logEntry.level] = (stats.byLevel[logEntry.level] || 0) + 1;
          
          // Count by day
          const day = logEntry.timestamp.split(' ')[0];
          stats.byDay[day] = (stats.byDay[day] || 0) + 1;
          
          // Collect error messages
          if (logEntry.level === 'error') {
            stats.errorMessages[logEntry.message] = (stats.errorMessages[logEntry.message] || 0) + 1;
          }
        } catch (error) {
          // Skip lines that aren't valid JSON
          continue;
        }
      }
    }
    
    // Process error messages to get top errors
    stats.topErrors = Object.entries(stats.errorMessages)
      .map(([message, count]) => ({ message, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Output statistics
    console.log('=== Log Statistics ===');
    console.log(`Total log entries: ${stats.totalEntries}`);
    
    console.log('\nEntries by log level:');
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });
    
    console.log('\nEntries by day:');
    Object.entries(stats.byDay)
      .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
      .forEach(([day, count]) => {
        console.log(`  ${day}: ${count}`);
      });
    
    console.log('\nTop error messages:');
    stats.topErrors.forEach(({ message, count }, index) => {
      console.log(`  ${index + 1}. "${message}" (${count} occurrences)`);
    });
  });

// Clean command implementation
program
  .command('clean')
  .description('Clean old log files')
  .option('-d, --days <number>', 'Delete files older than this many days', '30')
  .option('--dry-run', "Don't actually delete files, just show what would be deleted", false)
  .action((options) => {
    const days = parseInt(options.days);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const files = getLogFiles();
    console.log(`Looking for log files older than ${days} days...`);
    
    let deletedCount = 0;
    let deletedSize = 0;
    
    files.forEach(filePath => {
      const fileStats = fs.statSync(filePath);
      if (fileStats.mtime < cutoffDate) {
        const fileSize = fileStats.size;
        console.log(`${options.dryRun ? 'Would delete' : 'Deleting'}: ${filePath} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
        
        if (!options.dryRun) {
          fs.unlinkSync(filePath);
        }
        
        deletedCount++;
        deletedSize += fileSize;
      }
    });
    
    console.log(`\n${options.dryRun ? 'Would delete' : 'Deleted'} ${deletedCount} files (${(deletedSize / 1024 / 1024).toFixed(2)} MB total)`);
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 