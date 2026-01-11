require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const fs = require("fs");
let privateKey = "";

try {
	privateKey = fs.readFileSync(".secret").toString().trim();
} catch (err) {
	console.warn("No .secret file found. Skipping private key for now.");
}

module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {},
		localhost: {
			url: "http://127.0.0.1:8545",
		},
		// Uncomment for deploying to Mumbai
		// matic: {
		// 	url: "https://rpc-mumbai.maticvigil.com",
		// 	accounts: [`0x${privateKey}`],
		// },
	},
	etherscan: {
		apiKey: "T7EJKK22HARAGKTIQKGNVDJ3YSV6SET5C8",
	},
	solidity: {
		version: "0.8.13",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
};
