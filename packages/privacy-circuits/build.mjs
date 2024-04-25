import argv from 'process.argv';
import { execSync } from 'child_process';
import * as changeCase from 'change-case';

const CIRCOM_LIB_DIR = `./node_modules/circomlib`;
const PRIVACY_CIRCUITS_DIR = `./packages/privacy-circuits`;

const CIRCOM_BUILD_DIR = `${PRIVACY_CIRCUITS_DIR}/build`;
const CIRCOM_SRC_DIR = `${PRIVACY_CIRCUITS_DIR}/src/circom`;
const TRUSTED_SETUP_DIR = `${PRIVACY_CIRCUITS_DIR}/trusted-setup`;

const DEFAULT_PTAU_FILE = 'powersOfTau28_hez_final_12.ptau';

const PROVING_KEY_FILE = 'proving_key.zkey';
const VERIFICATION_KEY_FILE = 'verification_key.json';

const args = argv(process.argv.slice(2))();

const circuitFile = args.circuit;
const circuitPath = `${CIRCOM_SRC_DIR}/${circuitFile}`;
const circuitName = circuitFile.split('.')[0];

const outDir = `${CIRCOM_BUILD_DIR}/${circuitName}`;

let ptauFile = args.ptau;
if (!ptauFile) {
  console.warn(`Warning: No ptau file specified, using default`);
  ptauFile = DEFAULT_PTAU_FILE;
}
const ptauPath = `${TRUSTED_SETUP_DIR}/${ptauFile}`;

console.info(`Build started`);
console.info(`Circuit: ${circuitFile}`);
console.info(`Ptau: ${ptauFile}`);

console.info(`Cleaning up '${outDir}'`);
execSync(`rm -rf ${outDir}`);
execSync(`mkdir -p ${outDir}`);
console.info(`Done`);

console.info(`Compiling WASM and R1CS files`);
execSync(`mkdir -p ${outDir}/wasm`);
execSync(
  `circom ${circuitPath} --wasm -o ${outDir}/wasm -l ${CIRCOM_LIB_DIR}`,
  {
    stdio: 'inherit',
  }
);
execSync(`mkdir -p ${outDir}/r1cs`);
execSync(
  `circom ${circuitPath} --r1cs -o ${outDir}/r1cs -l ${CIRCOM_LIB_DIR}`,
  {
    stdio: 'inherit',
  }
);
console.info(`Done`);

const r1csPath = `${outDir}/r1cs/${circuitName}.r1cs`;

console.info(`Generating keys`);
execSync(`mkdir -p ${outDir}/keys`);
const provingKeyPath = `${outDir}/keys/${PROVING_KEY_FILE}`;
execSync(
  `npx snarkjs groth16 setup ${r1csPath} ${ptauPath} ${provingKeyPath}`,
  { stdio: 'inherit' }
);
execSync(
  `npx snarkjs zkey export verificationkey ${provingKeyPath} ${outDir}/keys/${VERIFICATION_KEY_FILE}`,
  { stdio: 'inherit' }
);
console.info(`Done`);

console.info(`Generating solidity verifier`);
const contractName = changeCase.pascalCase(circuitName);
execSync(`mkdir -p ${outDir}/solidity`);
execSync(
  `snarkjs zkey export solidityverifier ${provingKeyPath} ${outDir}/solidity/${contractName}.sol`,
  { stdio: 'inherit' }
);
execSync(
  `sed -i '' 's/Groth16Verifier/${contractName}/g' ${outDir}/solidity/${contractName}.sol`,
  { stdio: 'inherit' }
);

console.info(`Circuit ${circuitFile} built successfully`);
