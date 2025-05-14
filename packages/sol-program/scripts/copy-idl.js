const fs = require('node:fs');
const path = require('node:path');

// Paths 
const TARGET_DIR = path.join(__dirname, '../dist');
const TYPES_DIR = path.join(__dirname, '../src');
const IDL_PATH = path.join(__dirname, '../../../apps/smart-contract/target/idl');

// Program IDs from output of get-id.sh
const PROGRAM_IDS = {
  'escrow': '9AKiQ65rfHuMBjNs44CSKKMTE5pYE9soXR8dHiTfU6bo',
  'token': '8xrypu8aeupEFyGCsp6Gq5QtFP32iT6g3Yy2g3EucxGY'
};

// Debug logging
console.log('IDL_PATH:', IDL_PATH);
console.log('Files in IDL directory:', fs.existsSync(IDL_PATH) ? fs.readdirSync(IDL_PATH) : 'Directory not found');

// Ensure directories exist
for (const dir in [TARGET_DIR, TYPES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create index file
let indexContent = '// Generated Types\n';

// Process each program
for (const programName of Object.keys(PROGRAM_IDS)) {
  const sourceDir = path.join(IDL_PATH, programName);
  const idlFile = path.join(sourceDir, `${programName}.json`);
  
  if (fs.existsSync(idlFile)) {
    console.log(`Processing ${programName} IDL...`);
    const idl = JSON.parse(fs.readFileSync(idlFile, 'utf8'));
    
    // Create the TypeScript file
    const tsContent = `
// Generated Types for ${programName}
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export const ${programName.toUpperCase()}_PROGRAM_ID = new PublicKey('${PROGRAM_IDS[programName]}');

// IDL
export const ${programName}IDL = ${JSON.stringify(idl, null, 2)} as const;

// Program Types
export type ${capitalize(programName)}Program = anchor.Program<typeof ${programName}IDL>;

${generateTypeDefinitions(idl)}
`;
    
    // Write the file
    fs.writeFileSync(path.join(TYPES_DIR, `${programName}.ts`), tsContent);
    
    // Add to index
    indexContent += `export * from './${programName}';\n`;
  }
}

// Write index file
fs.writeFileSync(path.join(TYPES_DIR, 'index.ts'), indexContent);

console.log('Generation complete!');

// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateTypeDefinitions(idl) {
  let types = '';
  
  // Generate account types
  if (idl.accounts) {
    idl.accounts.forEach(account => {
      types += `// ${capitalize(account.name)} Account\n`;
      types += `export type ${capitalize(account.name)} = {\n`;
      account.type.fields.forEach(field => {
        types += `  ${camelCase(field.name)}: ${mapSolanaTypeToTs(field.type)};\n`;
      });
      types += '};\n\n';
    });
  }
  
  // Generate custom types
  if (idl.types) {
    idl.types.forEach(type => {
      types += `// ${capitalize(type.name)} Type\n`;
      types += `export type ${capitalize(type.name)} = {\n`;
      type.type.fields.forEach(field => {
        types += `  ${camelCase(field.name)}: ${mapSolanaTypeToTs(field.type)};\n`;
      });
      types += '};\n\n';
    });
  }
  
  // Generate instruction args types
  if (idl.instructions) {
    idl.instructions.forEach(ix => {
      if (ix.args && ix.args.length > 0) {
        types += `// ${capitalize(ix.name)} Instruction Args\n`;
        types += `export type ${capitalize(ix.name)}Args = {\n`;
        ix.args.forEach(arg => {
          types += `  ${camelCase(arg.name)}: ${mapSolanaTypeToTs(arg.type)};\n`;
        });
        types += '};\n\n';
      }
      
      // Generate accounts type for each instruction
      types += `// ${capitalize(ix.name)} Instruction Accounts\n`;
      types += `export type ${capitalize(ix.name)}Accounts = {\n`;
      ix.accounts.forEach(account => {
        types += `  ${camelCase(account.name)}: PublicKey;\n`;
      });
      types += '};\n\n';
    });
  }
  
  return types;
}

function camelCase(str) {
  return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());
}

function mapSolanaTypeToTs(type) {
  if (typeof type === 'string') {
    switch (type) {
      case 'u8': case 'u16': case 'u32': case 'u64': 
      case 'i8': case 'i16': case 'i32': case 'i64': case 'i128':
      case 'f32': case 'f64':
        return 'number';
      case 'bool':
        return 'boolean';
      case 'string':
        return 'string';
      case 'publicKey':
        return 'PublicKey';
      default:
        return 'any';
    }
  }
  
  if (typeof type === 'object' && type !== null) {
    if (type.vec) {
      return `${mapSolanaTypeToTs(type.vec)}[]`;
    } else if (type.option) {
      return `${mapSolanaTypeToTs(type.option)} | null`;
    } else if (type.defined) {
      return capitalize(type.defined);
    } else if (type.array) {
      return `${mapSolanaTypeToTs(type.array[0])}[]`;
    } else if (type.generic) {
      return `${mapSolanaTypeToTs(type.generic)}<${type.args ? type.args.map(mapSolanaTypeToTs).join(', ') : ''}>`;
    }
  }
  
  return 'any';
}
