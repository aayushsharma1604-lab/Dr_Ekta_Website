#!/usr/bin/env node
/**
 * MongoDB Backup Script
 * Runs daily backups, retains 7 daily + 4 weekly + 12 monthly
 */
require('dotenv').config({ path: '.env' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dr-ekta';
const BACKUP_DIR = path.join(__dirname, '../backups');
const DAILY_RETENTION = 7;
const WEEKLY_RETENTION = 4;
const MONTHLY_RETENTION = 12;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function runBackup() {
  const timestamp = getTimestamp();
  const filename = `dr-ekta-${timestamp}.gz`;
  const filepath = path.join(BACKUP_DIR, 'daily', filename);
  
  ensureDir(path.join(BACKUP_DIR, 'daily'));
  
  console.log(`Starting backup: ${filename}`);
  
  try {
    execSync(`mongodump --uri="${MONGO_URI}" --gzip --archive="${filepath}"`, {
      stdio: 'inherit',
      timeout: 300000
    });
    console.log(`Backup completed: ${filepath}`);
    return filepath;
  } catch (err) {
    console.error('Backup failed:', err.message);
    process.exit(1);
  }
}

function pruneBackups() {
  const dailyDir = path.join(BACKUP_DIR, 'daily');
  const weeklyDir = path.join(BACKUP_DIR, 'weekly');
  const monthlyDir = path.join(BACKUP_DIR, 'monthly');
  
  [dailyDir, weeklyDir, monthlyDir].forEach(ensureDir);
  
  // Prune daily (keep last 7)
  const dailyFiles = fs.readdirSync(dailyDir)
    .filter(f => f.endsWith('.gz'))
    .map(f => ({ name: f, time: fs.statSync(path.join(dailyDir, f)).mtime }))
    .sort((a, b) => b.time - a.time);
  
  dailyFiles.slice(DAILY_RETENTION).forEach(f => {
    fs.unlinkSync(path.join(dailyDir, f.name));
    console.log(`Pruned daily: ${f.name}`);
  });
  
  // Move oldest daily to weekly on Sundays
  const today = new Date().getDay();
  if (today === 0 && dailyFiles.length > 0) {
    ensureDir(weeklyDir);
    const oldestDaily = dailyFiles[dailyFiles.length - 1];
    const src = path.join(dailyDir, oldestDaily.name);
    const dest = path.join(weeklyDir, oldestDaily.name);
    fs.copyFileSync(src, dest);
    console.log(`Archived to weekly: ${oldestDaily.name}`);
    
    // Prune weekly
    const weeklyFiles = fs.readdirSync(weeklyDir)
      .filter(f => f.endsWith('.gz'))
      .map(f => ({ name: f, time: fs.statSync(path.join(weeklyDir, f)).mtime }))
      .sort((a, b) => b.time - a.time);
    weeklyFiles.slice(WEEKLY_RETENTION).forEach(f => {
      fs.unlinkSync(path.join(weeklyDir, f.name));
      console.log(`Pruned weekly: ${f.name}`);
    });
  }
  
  // Move oldest weekly to monthly on 1st of month
  const todayDate = new Date().getDate();
  if (todayDate === 1) {
    ensureDir(monthlyDir);
    const weeklyFiles = fs.readdirSync(weeklyDir)
      .filter(f => f.endsWith('.gz'))
      .map(f => ({ name: f, time: fs.statSync(path.join(weeklyDir, f)).mtime }))
      .sort((a, b) => b.time - a.time);
    
    if (weeklyFiles.length > 0) {
      const oldestWeekly = weeklyFiles[weeklyFiles.length - 1];
      const src = path.join(weeklyDir, oldestWeekly.name);
      const dest = path.join(monthlyDir, oldestWeekly.name);
      fs.copyFileSync(src, dest);
      console.log(`Archived to monthly: ${oldestWeekly.name}`);
      
      // Prune monthly
      const monthlyFiles = fs.readdirSync(monthlyDir)
        .filter(f => f.endsWith('.gz'))
        .map(f => ({ name: f, time: fs.statSync(path.join(monthlyDir, f)).mtime }))
        .sort((a, b) => b.time - a.time);
      monthlyFiles.slice(MONTHLY_RETENTION).forEach(f => {
        fs.unlinkSync(path.join(monthlyDir, f.name));
        console.log(`Pruned monthly: ${f.name}`);
      });
    }
  }
}

function main() {
  console.log('=== MongoDB Backup Started ===');
  const backupPath = runBackup();
  pruneBackups();
  console.log('=== Backup Completed ===');
  console.log(`Backup saved to: ${backupPath}`);
}

main();