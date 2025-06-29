#!/usr/bin/env node

/**
 * Remove Product Status Script
 * 
 * This script temporarily removes status filtering from products for testing purposes.
 * It will:
 * 1. Update the ProductService to ignore status filtering
 * 2. Create a backup of the original files
 * 3. Allow all products to be visible regardless of status
 * 
 * To restore status filtering later, run: node scripts/restore-product-status.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Product Status Removal Script...\n');

// File paths
const productServicePath = path.join(__dirname, '../shared/services/productService.js');
const backupDir = path.join(__dirname, '../backups');
const backupPath = path.join(backupDir, 'productService.backup.js');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Created backup directory');
}

try {
  // Read the current ProductService file
  const originalContent = fs.readFileSync(productServicePath, 'utf8');
  
  // Create backup
  fs.writeFileSync(backupPath, originalContent);
  console.log('💾 Created backup of ProductService at:', backupPath);
  
  // Modifications to remove status filtering
  let modifiedContent = originalContent;
  
  // 1. Remove status filtering from main query
  modifiedContent = modifiedContent.replace(
    /q = q\.eq\('status', 'approved'\)\.eq\('is_active', true\);/g,
    '// Status filtering temporarily disabled for testing\n        // q = q.eq(\'status\', \'approved\').eq(\'is_active\', true);\n        q = q.eq(\'is_active\', true); // Only check if active'
  );
  
  // 2. Remove status filtering from applyFilters function
  modifiedContent = modifiedContent.replace(
    /q = q\.eq\('status', 'approved'\)\.eq\('is_active', true\);/g,
    '// Status filtering temporarily disabled for testing\n          // q = q.eq(\'status\', \'approved\').eq(\'is_active\', true);\n          q = q.eq(\'is_active\', true); // Only check if active'
  );
  
  // 3. Remove status filtering from getProductById
  modifiedContent = modifiedContent.replace(
    /\.eq\('status', 'approved'\)/g,
    '// .eq(\'status\', \'approved\') // Status check temporarily disabled'
  );
  
  // 4. Add a comment at the top indicating status is disabled
  const statusDisabledComment = `/**
 * NOTICE: Product status filtering has been temporarily disabled for testing.
 * All products will be visible regardless of their approval status.
 * To restore status filtering, run: node scripts/restore-product-status.js
 * 
 * Modified on: ${new Date().toISOString()}
 */

`;
  
  modifiedContent = statusDisabledComment + modifiedContent;
  
  // Write the modified content
  fs.writeFileSync(productServicePath, modifiedContent);
  
  console.log('✅ Successfully removed product status filtering');
  console.log('📝 Changes made:');
  console.log('   - Disabled status = "approved" filtering');
  console.log('   - Products will show regardless of approval status');
  console.log('   - Only is_active = true filtering remains');
  console.log('   - Added notice comment to file');
  
  console.log('\n🔄 To restore status filtering later, run:');
  console.log('   node scripts/restore-product-status.js');
  
  console.log('\n⚠️  Remember to restart your development server for changes to take effect!');
  
} catch (error) {
  console.error('❌ Error removing product status:', error.message);
  process.exit(1);
}

console.log('\n🎉 Product status removal completed successfully!');
