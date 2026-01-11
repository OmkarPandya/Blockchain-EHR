require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY || "";

if (!privateKey) {
	console.warn("No PRIVATE_KEY found in .env file.");
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
		apiKey: process.env.ETHERSCAN_API_KEY,
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
