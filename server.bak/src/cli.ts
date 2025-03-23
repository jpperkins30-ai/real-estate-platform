#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { CollectorManager } from './dataCollection/manager/CollectorManager';
import { HtmlTableCollector } from './dataCollection/collectors/HtmlTableCollector';
import { SdatPropertyDetailCollector } from './dataCollection/collectors/SdatPropertyDetailCollector';
import { stMarysCountyConfig } from './dataCollection/sources/stMarysCounty/config';
import { sdatConfig } from './dataCollection/sources/sdat/config';
import DataSource from './models/DataSource';
import chalk from 'chalk';
import Table from 'cli-table3';

// Load environment variables
dotenv.config();

// Create a new command line program
const program = new Command();

// Initialize the collector manager
const collectorManager = new CollectorManager();

/**
 * Initialize the application
 * Connects to MongoDB and registers collectors
 */
async function initialize() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  try {
    await mongoose.connect(mongoUri);
    console.log(chalk.green('✓ Connected to MongoDB'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to connect to MongoDB:'), error);
    process.exit(1);
  }
  
  // Register collectors
  try {
    collectorManager.registerCollector('stMarysCounty', new HtmlTableCollector(stMarysCountyConfig));
    collectorManager.registerCollector('sdat', new SdatPropertyDetailCollector(sdatConfig));
    console.log(chalk.green('✓ Registered collectors'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to register collectors:'), error);
    process.exit(1);
  }
}

// Program metadata
program
  .name('property-collector')
  .description('Command-line tool for collecting property data')
  .version('1.0.0');

// Command to run a specific collector
program
  .command('collect')
  .description('Run a specific collector to gather property data')
  .argument('<collectorName>', 'Name of the collector to run (e.g., stMarysCounty, sdat)')
  .option('-o, --output <directory>', 'Directory to save output files', './data')
  .option('-f, --format <format>', 'Output format (json, csv, or both)', 'both')
  .action(async (collectorName, options) => {
    await initialize();
    
    console.log(chalk.blue(`Running collector: ${collectorName}`));
    console.log(chalk.gray(`Output directory: ${options.output}`));
    console.log(chalk.gray(`Output format: ${options.format}`));
    
    try {
      // Ensure output directory exists
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }
      
      // Run the collector
      const startTime = Date.now();
      const result = await collectorManager.runCollection(collectorName);
      const duration = (Date.now() - startTime) / 1000;
      
      if (result.success) {
        console.log(chalk.green(`✓ Collection completed successfully in ${duration}s`));
        console.log(chalk.green(`  Collected ${result.data?.length || 0} properties`));
        
        if (result.rawDataPath) {
          console.log(chalk.green(`  Raw data saved to: ${result.rawDataPath}`));
        }
      } else {
        console.log(chalk.red(`✗ Collection failed: ${result.message}`));
      }
    } catch (error) {
      console.error(chalk.red('Error running collector:'), error);
    } finally {
      await mongoose.disconnect();
    }
  });

// Command to run all collectors
program
  .command('collect-all')
  .description('Run all registered collectors')
  .option('-c, --concurrency <number>', 'Maximum number of parallel collectors', '2')
  .option('-o, --output <directory>', 'Directory to save output files', './data')
  .action(async (options) => {
    await initialize();
    
    console.log(chalk.blue(`Running all collectors with concurrency: ${options.concurrency}`));
    
    try {
      // Run all collectors
      const startTime = Date.now();
      const results = await collectorManager.executeParallelCollections(
        undefined, 
        parseInt(options.concurrency)
      );
      const duration = (Date.now() - startTime) / 1000;
      
      console.log(chalk.blue(`\nCollection results (completed in ${duration}s):`));
      
      // Display results in a table
      const table = new Table({
        head: ['Source', 'Status', 'Properties', 'Duration (s)', 'Message'],
        style: { head: ['cyan'] }
      });
      
      let successCount = 0;
      let totalProperties = 0;
      
      for (const [sourceId, result] of results.entries()) {
        const source = await DataSource.findById(sourceId);
        const sourceName = source ? source.name : sourceId;
        
        if (result.success) {
          successCount++;
          totalProperties += result.data?.length || 0;
          
          table.push([
            sourceName,
            chalk.green('Success'),
            result.data?.length || 0,
            result.duration ? (result.duration / 1000).toFixed(1) : 'N/A',
            result.message || 'Completed successfully'
          ]);
        } else {
          table.push([
            sourceName,
            chalk.red('Failed'),
            0,
            result.duration ? (result.duration / 1000).toFixed(1) : 'N/A',
            result.message || 'Unknown error'
          ]);
        }
      }
      
      console.log(table.toString());
      console.log(chalk.green(`\nSummary: ${successCount}/${results.size} collectors succeeded, collected ${totalProperties} properties`));
    } catch (error) {
      console.error(chalk.red('Error running collectors:'), error);
    } finally {
      await mongoose.disconnect();
    }
  });

// Command to list all data sources
program
  .command('list-sources')
  .description('List all available data sources')
  .action(async () => {
    await initialize();
    
    try {
      const sources = await DataSource.find().sort({ name: 1 });
      
      console.log(chalk.blue(`\nFound ${sources.length} data sources:`));
      
      const table = new Table({
        head: ['ID', 'Name', 'Type', 'Region', 'Status', 'Last Collected'],
        style: { head: ['cyan'] }
      });
      
      for (const source of sources) {
        const region = `${source.region.county || ''}, ${source.region.state || ''}`.trim();
        const status = source.status === 'active' 
          ? chalk.green(source.status) 
          : source.status === 'warning' 
            ? chalk.yellow(source.status) 
            : chalk.red(source.status);
        
        table.push([
          source._id.toString(),
          source.name,
          source.collectorType,
          region,
          status,
          source.lastCollected 
            ? new Date(source.lastCollected).toLocaleString() 
            : 'Never'
        ]);
      }
      
      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red('Error listing sources:'), error);
    } finally {
      await mongoose.disconnect();
    }
  });

// Command to check system health
program
  .command('health')
  .description('Check the health of the data collection system')
  .option('-p, --period <hours>', 'Lookback period in hours', '24')
  .action(async (options) => {
    await initialize();
    
    try {
      const health = await collectorManager.checkHealth(parseInt(options.period));
      
      const statusColor = health.status === 'healthy' 
        ? chalk.green 
        : health.status === 'degraded' 
          ? chalk.yellow 
          : chalk.red;
      
      console.log(statusColor(`\nSystem Status: ${health.status.toUpperCase()}`));
      console.log(chalk.blue(`Last checked: ${health.lastChecked.toLocaleString()}`));
      
      // Display counts
      console.log(chalk.blue('\nCounts:'));
      console.log(`Collectors: ${health.collectors.total} (${health.collectors.active} active)`);
      console.log(`Sources: ${health.sources.total} (${health.sources.active} active, ${health.sources.warning} warning, ${health.sources.error} error)`);
      console.log(`Recent Collections: ${health.recentCollections.total} (${health.recentCollections.successful} successful, ${health.recentCollections.failed} failed)`);
      
      // Display issues
      if (health.issues.length > 0) {
        console.log(chalk.yellow(`\nIssues (${health.issues.length}):`));
        
        const table = new Table({
          head: ['Type', 'Severity', 'Name', 'Message', 'Time'],
          style: { head: ['cyan'] }
        });
        
        for (const issue of health.issues) {
          const severityColor = issue.severity === 'warning' 
            ? chalk.yellow 
            : issue.severity === 'error' 
              ? chalk.red 
              : chalk.magenta;
          
          table.push([
            issue.type,
            severityColor(issue.severity),
            issue.name || 'N/A',
            issue.message,
            issue.timestamp ? new Date(issue.timestamp).toLocaleString() : 'N/A'
          ]);
        }
        
        console.log(table.toString());
      } else {
        console.log(chalk.green('\nNo issues found!'));
      }
    } catch (error) {
      console.error(chalk.red('Error checking health:'), error);
    } finally {
      await mongoose.disconnect();
    }
  });

// Parse command line arguments
program.parse(); 