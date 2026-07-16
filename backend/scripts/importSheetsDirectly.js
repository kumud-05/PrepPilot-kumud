const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Sheet = require('../models/Sheet');

const SHEETS_DIR = path.join(__dirname, '../sheets');

async function importSheets() {
  const connected = await connectDB();
  if (!connected) {
    throw new Error('Failed to connect to database.');
  }
  const files = fs.readdirSync(SHEETS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(SHEETS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const sheetsArr = Array.isArray(data.sheets) ? data.sheets : [data];
    
    for (const sheetObj of sheetsArr) {
      if (!sheetObj || !sheetObj.id || !sheetObj.title) {
        console.warn(`Skipping invalid sheet in ${file}`);
        continue;
      }
      await Sheet.findOneAndUpdate(
        { id: sheetObj.id },
        sheetObj,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Successfully seeded/updated sheet: ${sheetObj.id}`);
    }
  }
}

importSheets()
  .then(() => {
    console.log('All sheets successfully imported/updated directly in MongoDB.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to import sheets:', err);
    process.exit(1);
  });
