const fs = require('node:fs');
const path = require('node:path');

// Paths
const TARGET_DIR = path.join(__dirname, '../src');
const IDL_PATH = path.join(__dirname, '../../../apps/smart-contract/target/idl');
const PROGRAMS_DIR = path.join(__dirname, '../../../apps/smart-contract/programs');

// Ensure the target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Copy IDL files
if (fs.existsSync(IDL_PATH)) {
  const programs = fs.readdirSync(IDL_PATH);
  
  let indexContent = '// This file is auto-generated. Do not modify.\n\n';
  
  for (const program in programs) {
    const idlPath = path.join(IDL_PATH, program);
    if (fs.lstatSync(idlPath).isDirectory()) {
      const idlFiles = fs.readdirSync(idlPath).filter(file => file.endsWith('.json'));
      
      for (const file in idlFiles) {
        const idlFile = path.join(idlPath, file);
        const idl = JSON.parse(fs.readFileSync(idlFile, 'utf8'));
        
        // Create a file for each program
        const targetFile = path.join(TARGET_DIR, `${program}.ts`);
        const idlContent = `// Generated from ${program} IDL
import { IDL } from './idl/${program}';
import * as anchor from '@coral-xyz/anchor';

// Program ID
export const ${program.toUpperCase()}_PROGRAM_ID = new anchor.web3.PublicKey('${idl.metadata.address || "PROGRAM_ID_PLACEHOLDER"}');

// Program Client Type
export type ${capitalize(program)}Program = anchor.Program<typeof IDL>;

// Account Types
${generateTypesFromIdl(idl)}

export { IDL };
`;
        fs.writeFileSync(targetFile, idlContent);
        
        // Create IDL directory and file
        const idlDir = path.join(TARGET_DIR, 'idl');
        if (!fs.existsSync(idlDir)) {
          fs.mkdirSync(idlDir, { recursive: true });
        }
        
        const idlTypeFile = path.join(idlDir, `${program}.ts`);
        fs.writeFileSync(idlTypeFile, `// Generated from ${program} IDL
export const IDL = ${JSON.stringify(idl, null, 2)} as const;
`);
        
        indexContent += `export * from './${program}';\n`;
      };
    }
  }
  
  // Write index.ts
  fs.writeFileSync(path.join(TARGET_DIR, 'index.ts'), indexContent);
  
  console.log('Types generated successfully!');
} else {
  console.error('IDL directory not found. Did you run "anchor build"?');
}

// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateTypesFromIdl(idl) {
  let types = '';
  
  // Generate account types
  if (idl.accounts) {
    for (const account in idl.accounts) {
      types += `export type ${capitalize(account.name)} = {\n`;
      for (const field in account.type.fields) {
        types += `  ${field.name}: ${mapSolanaTypeToTs(field.type)};\n`;
      }
      types += '};\n\n';
    };
  }
  
  // Generate instruction types
  if (idl.instructions) {
    for (const ix in idl.instructions) {
      if (ix.args && ix.args.length > 0) {
        types += `export type ${capitalize(ix.name)}Args = {\n`;
        for (const arg in ix.args) {
          types += `  ${arg.name}: ${mapSolanaTypeToTs(arg.type)};\n`;
        };
        types += '};\n\n';
      }
    };
  }
  
  return types;
}

function mapSolanaTypeToTs(type) {
  // Basic type mapping
  if (typeof type === 'string') {
    switch (type) {
      case 'u8': case 'u16': case 'u32': case 'u64': 
      case 'i8': case 'i16': case 'i32': case 'i64':
      case 'f32': case 'f64':
        return 'number';
      case 'bool':
        return 'boolean';
      case 'string':
        return 'string';
      case 'publicKey':
        return 'anchor.web3.PublicKey';
      default:
        return 'any';
    }
  }
  
  // Complex types
  if (typeof type === 'object') {
    if (type.vec) {
      return `${mapSolanaTypeToTs(type.vec)}[]`;
    }
    if (type.option) {
      return `${mapSolanaTypeToTs(type.option)} | null`;
    }
    if (type.defined) {
      return capitalize(type.defined);
    }
  }
  
  return 'any';
}
