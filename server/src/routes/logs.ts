/**
 * Logs API Routes
 * Provides endpoints for retrieving and analyzing log data
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import zlib from 'zlib';
import { createReadStream } from 'fs';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const LOG_DIR = path.join(process.cwd(), 'logs');

// Make sure all routes are authenticated
router.use(authenticate);

/**
 * Helper to get all log files
 */
function getLogFiles(pattern: string = '.*\\.log(\\.gz)?$'): string[] {
  if (!fs.existsSync(LOG_DIR)) {
    return [];
  }

  const fileRegex = new RegExp(pattern);
  return fs.readdirSync(LOG_DIR)
    .filter(file => fileRegex.test(file))
    .map(file => path.join(LOG_DIR, file));
}

/**
 * Helper to create appropriate read stream based on file extension
 */
function createAppropriateReadStream(filePath: string) {
  const readStream = createReadStream(filePath);
  
  if (filePath.endsWith('.gz')) {
    return readStream.pipe(zlib.createGunzip());
  }
  
  return readStream;
}

/**
 * @swagger
 * /api/logs/stats:
 *   get:
 *     summary: Get log statistics
 *     description: Retrieves statistical data about logs based on various filters
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to analyze logs
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, http, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: collection
 *         schema:
 *           type: string
 *         description: Filter by database collection
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Search in message text
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs before this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Log statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       total:
 *                         type: integer
 *                 levelDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       value:
 *                         type: integer
 *                 topErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 totalEntries:
 *                   type: integer
 *                 collectionMetrics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       operations:
 *                         type: integer
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token or insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    // Extract query params with defaults
    const days = parseInt(req.query.days as string || '7');
    const level = req.query.level as string;
    const collection = req.query.collection as string;
    const userId = req.query.userId as string;
    const message = req.query.message as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    // Calculate cutoff date
    const cutoffDate = startDate 
      ? new Date(startDate) 
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const maxDate = endDate 
      ? new Date(endDate) 
      : new Date();
    
    const files = getLogFiles();
    
    // Prepare response stats object
    const stats = {
      totalEntries: 0,
      byLevel: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
      topErrors: [] as { message: string; count: number }[],
      errorMessages: {} as Record<string, number>,
      collectionMetrics: {} as Record<string, number>
    };
    
    // Process each log file
    for (const file of files) {
      // Skip files outside date range based on filename pattern
      const fileDate = file.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (fileDate) {
        const fileDateObj = new Date(fileDate);
        if (fileDateObj < cutoffDate || fileDateObj > maxDate) {
          continue;
        }
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
          if (level && level !== 'All Levels' && logEntry.level !== level) continue;
          if (message && !logEntry.message.includes(message)) continue;
          
          // Filter by userId if present in meta
          if (userId && 
            (!logEntry.meta || 
             (!logEntry.meta.userId && !logEntry.userId) || 
             (logEntry.meta.userId !== userId && logEntry.userId !== userId)
            )) continue;
            
          // Filter by collection if present in meta
          if (collection && collection !== 'All Collections') {
            if (!logEntry.meta || !logEntry.meta.collection || logEntry.meta.collection !== collection) {
              continue;
            }
          }
          
          // Count the entry
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
          
          // Track collection metrics
          if (logEntry.meta && logEntry.meta.collection) {
            stats.collectionMetrics[logEntry.meta.collection] = 
              (stats.collectionMetrics[logEntry.meta.collection] || 0) + 1;
          }
        } catch (error) {
          // Skip invalid JSON lines
          continue;
        }
      }
    }
    
    // Process daily data
    const dailyData = Object.entries(stats.byDay)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Process level distribution
    const levelDistribution = Object.entries(stats.byLevel)
      .map(([name, value]) => ({ name, value }));
    
    // Process top errors
    const topErrors = Object.entries(stats.errorMessages)
      .map(([message, count]) => ({ message, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Process collection metrics
    const collectionMetrics = Object.entries(stats.collectionMetrics)
      .map(([name, operations]) => ({ name, operations }))
      .sort((a, b) => b.operations - a.operations);
    
    // Send response
    res.json({
      dailyData,
      levelDistribution,
      topErrors,
      totalEntries: stats.totalEntries,
      collectionMetrics
    });
  } catch (error) {
    console.error('Error processing log stats:', error);
    res.status(500).json({ error: 'Failed to process log statistics' });
  }
});

/**
 * @swagger
 * /api/logs/search:
 *   get:
 *     summary: Search logs with various filters
 *     description: Search through log files with filtering options
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, http, debug]
 *         description: Filter by log level
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Search in message text
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: files
 *         schema:
 *           type: string
 *         description: File pattern to search in (regex)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                       level:
 *                         type: string
 *                       message:
 *                         type: string
 *                       meta:
 *                         type: object
 *                       source:
 *                         type: string
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token or insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/search', async (req, res) => {
  try {
    // Extract query parameters
    const level = req.query.level as string;
    const date = req.query.date as string;
    const message = req.query.message as string;
    const userId = req.query.userId as string;
    const filePattern = req.query.files as string;
    const limit = parseInt(req.query.limit as string || '100');
    
    // Get log files matching pattern
    const files = getLogFiles(filePattern);
    
    // Prepare results array
    const results: any[] = [];
    
    // Process each log file
    for (const file of files) {
      if (date && !file.includes(date)) {
        continue;
      }
      
      const stream = createAppropriateReadStream(file);
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
      });
      
      for await (const line of rl) {
        if (results.length >= limit) break;
        
        try {
          const logEntry = JSON.parse(line);
          
          // Apply filters
          if (level && level !== 'All Levels' && logEntry.level !== level) continue;
          if (message && !logEntry.message.includes(message)) continue;
          if (userId && 
              (!logEntry.meta || 
              (!logEntry.meta.userId && !logEntry.userId) || 
              (logEntry.meta.userId !== userId && logEntry.userId !== userId)
              )) continue;
          
          // Add source file info
          logEntry.source = path.basename(file);
          
          // Add to results
          results.push(logEntry);
        } catch (error) {
          // Skip invalid JSON lines
          continue;
        }
      }
      
      if (results.length >= limit) break;
    }
    
    // Send response
    res.json({
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Failed to search logs' });
  }
});

/**
 * @swagger
 * /api/logs/files:
 *   get:
 *     summary: Get list of available log files
 *     description: Returns a list of all log files with metadata
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of log files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       created:
 *                         type: string
 *                         format: date-time
 *                       modified:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token or insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/files', (req, res) => {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      return res.json({ files: [] });
    }
    
    const logFiles = fs.readdirSync(LOG_DIR)
      .filter(file => file.endsWith('.log') || file.endsWith('.log.gz'))
      .map(file => {
        const filePath = path.join(LOG_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified.getTime() - a.modified.getTime());
    
    res.json({ files: logFiles });
  } catch (error) {
    console.error('Error listing log files:', error);
    res.status(500).json({ error: 'Failed to list log files' });
  }
});

/**
 * @swagger
 * /api/logs/download/{filename}:
 *   get:
 *     summary: Download a specific log file
 *     description: Returns the contents of a log file for download
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the log file to download
 *     responses:
 *       200:
 *         description: Log file content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filename
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token or insufficient permissions
 *       404:
 *         description: Log file not found
 *       500:
 *         description: Server error
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security check - prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(LOG_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Log file not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading log file:', error);
    res.status(500).json({ error: 'Failed to download log file' });
  }
});

export default router; 