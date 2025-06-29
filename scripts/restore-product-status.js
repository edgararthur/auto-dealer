#!/usr/bin/env node

/**
 * Restore Product Status Script
 * 
 * This script restores the original product status filtering from the backup.
 * It will restore the ProductService to its original state with status filtering enabled.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Starting Product Status Restoration Script...\n');

// File paths
const productServicePath = path.join(__dirname, '../shared/services/productService.js');
const backupPath = path.join(__dirname, '../backups/productService.backup.js');

try {
  // Check if backup exists
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found at:', backupPath);
    console.log('💡 Make sure you ran the remove-product-status.js script first');
    process.exit(1);
  }
  
  // Read the backup content
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  
  // Restore the original file
  fs.writeFileSync(productServicePath, backupContent);
  
  console.log('✅ Successfully restored product status filtering');
  console.log('📝 Changes restored:');
  console.log('   - Re-enabled status = "approved" filtering');
  console.log('   - Products will now require approval to be visible');
  console.log('   - All original filtering logic restored');
  
  console.log('\n⚠️  Remember to restart your development server for changes to take effect!');
  
  // Optionally remove the backup file
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n🗑️  Remove backup file? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      fs.unlinkSync(backupPath);
      console.log('🗑️  Backup file removed');
    } else {
      console.log('💾 Backup file kept at:', backupPath);
    }
    rl.close();
    console.log('\n🎉 Product status restoration completed successfully!');
  });
  
} catch (error) {
  console.error('❌ Error restoring product status:', error.message);
  process.exit(1);
}
