/**
 * Convert Stitch export to Next.js components
 * Reads stitch-export.json and generates React component stubs
 * 
 * Usage: node scripts/convert-stitch-to-next.js
 */

const fs = require('fs');
const path = require('path');

const STITCH_EXPORT = path.join(__dirname, '..', 'frontend', 'stitch', 'stitch-export.json');
const COMPONENTS_DIR = path.join(__dirname, '..', 'frontend', 'components', 'stitch');

// Check if Stitch export exists
if (!fs.existsSync(STITCH_EXPORT)) {
  console.error('❌ Error: stitch-export.json not found');
  console.log('\nPlease run fetch-stitch.js first:');
  console.log('  STITCH_API_KEY=your_key node scripts/fetch-stitch.js');
  console.log('\nOr continue using the fallback components already provided.');
  process.exit(1);
}

// Create components directory if it doesn't exist
if (!fs.existsSync(COMPONENTS_DIR)) {
  fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
}

console.log('🔄 Converting Stitch export to Next.js components...');

try {
  const exportData = JSON.parse(fs.readFileSync(STITCH_EXPORT, 'utf8'));
  
  // Extract pages and components from export
  const pages = exportData.pages || [];
  const components = exportData.components || [];
  
  console.log(`📄 Found ${pages.length} pages and ${components.length} components`);
  
  // Process each page
  pages.forEach((page, index) => {
    const componentName = page.name || `Page${index}`;
    const fileName = `${componentName}.jsx`;
    const filePath = path.join(COMPONENTS_DIR, fileName);
    
    // Generate component stub
    const componentCode = generateComponentStub(componentName, page);
    
    // Write to file (only if it doesn't exist to avoid overwriting custom changes)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, componentCode);
      console.log(`  ✅ Created ${fileName}`);
    } else {
      console.log(`  ⏭️  Skipped ${fileName} (already exists)`);
    }
  });
  
  // Process each standalone component
  components.forEach((component, index) => {
    const componentName = component.name || `Component${index}`;
    const fileName = `${componentName}.jsx`;
    const filePath = path.join(COMPONENTS_DIR, fileName);
    
    const componentCode = generateComponentStub(componentName, component);
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, componentCode);
      console.log(`  ✅ Created ${fileName}`);
    } else {
      console.log(`  ⏭️  Skipped ${fileName} (already exists)`);
    }
  });
  
  console.log('\n✅ Conversion complete!');
  console.log('\nNext steps:');
  console.log('  1. Review generated components in frontend/components/stitch/');
  console.log('  2. Convert dangerouslySetInnerHTML to proper JSX where needed');
  console.log('  3. Wire up component props and event handlers');
  
} catch (error) {
  console.error('❌ Conversion failed:', error.message);
  process.exit(1);
}

/**
 * Generate React component stub from Stitch export data
 */
function generateComponentStub(name, data) {
  const hasHTML = data.html || data.markup;
  
  if (hasHTML) {
    // Component contains raw HTML - wrap with dangerouslySetInnerHTML
    return `// Generated from Stitch export
// TODO: Convert dangerouslySetInnerHTML to proper JSX

export default function ${name}() {
  const markup = ${JSON.stringify(hasHTML, null, 2)};
  
  return (
    <div dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
`;
  } else {
    // Component without HTML - create basic stub
    return `// Generated from Stitch export
// TODO: Implement component based on Stitch design

export default function ${name}() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">${name}</h2>
      <p className="text-slate-600 mt-2">
        Component generated from Stitch export. Update this file to match the design.
      </p>
    </div>
  );
}
`;
  }
}
