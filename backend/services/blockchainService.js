// services/contractService.js
import Web3 from "web3";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

// Set __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Web3 with local Hardhat network
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_RPC_URL));

// ✅ Load ABI and bytecode of ImageReport
const contractJsonPath = path.join(__dirname, "../..", "contracts", "artifacts", "contracts", "imageReport.sol", "ImageReport.json");
if (!fs.existsSync(contractJsonPath)) {
  console.error("Artifact path:", contractJsonPath);
  throw new Error("ImageReport.json not found. Make sure it's compiled.");
}

const contractJson = JSON.parse(fs.readFileSync(contractJsonPath, "utf8"));
const { abi, bytecode } = contractJson;

// ✅ Main function to deploy the contract
export async function deployReportContract(
  fromAddress,
  privateKey,
  user,
  doctor,
  reportType,
  originalImage,
  maskedImage,
  diagnosis,
  analysis,
  signature
) {
  try {
    const contract = new web3.eth.Contract(abi);

    const deployTx = contract.deploy({
      data: bytecode,
      arguments: [
        user,
        doctor,
        reportType,
        originalImage,
        maskedImage,
        diagnosis,
        analysis,
        signature
      ],
    });

    const gas = await deployTx.estimateGas({ from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from: fromAddress,
      gas,
      gasPrice,
      data: deployTx.encodeABI(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("✅ Contract deployed at:", receipt.contractAddress);

    return { contractAddress: receipt.contractAddress, receipt };
  } catch (error) {
    console.error("❌ Contract deployment error:", error);
    throw error;
  }
}

// ✅ Function to add multiple doctors to an existing contract
export async function addDoctorsToContract(
  contractAddress,
  fromAddress,
  privateKey,
  doctorAddresses
) {
  try {
    const contract = new web3.eth.Contract(abi, contractAddress);
    const method = contract.methods.addDoctors(doctorAddresses);

    const gas = await method.estimateGas({ from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from: fromAddress,
      to: contractAddress,
      gas,
      gasPrice,
      data: method.encodeABI(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`✅ Doctors added to contract ${contractAddress}`);
    return receipt;
  } catch (error) {
    console.error("❌ Add doctors error:", error);
    throw error;
  }
}

// ✅ Function to sync (overwrite) doctors on an existing contract
export async function syncDoctorsOnContract(
  contractAddress,
  fromAddress,
  privateKey,
  doctorAddresses
) {
  try {
    const contract = new web3.eth.Contract(abi, contractAddress);
    const method = contract.methods.syncDoctors(doctorAddresses);

    const gas = await method.estimateGas({ from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from: fromAddress,
      to: contractAddress,
      gas,
      gasPrice,
      data: method.encodeABI(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`✅ Doctors synced (overwritten) on contract ${contractAddress}`);
    return receipt;
  } catch (error) {
    console.error("❌ Sync doctors error:", error);
    throw error;
  }
}

// ✅ Function to check if a user has access to a report on the contract
export async function checkAccessOnContract(contractAddress, userWallet) {
  try {
    const contract = new web3.eth.Contract(abi, contractAddress);

    // Check if the user is an owner of the report contract
    const hasAccess = await contract.methods.isOwner(userWallet.toLowerCase()).call();

    return hasAccess;
  } catch (error) {
    console.error("❌ Check access error:", error);
    // If contract call fails (e.g. wrong address), return false for safety
    return false;
  }
}
