// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../PizzaMixtapeNFT.sol";

/**
 * @title Deploy Script for PizzaMixtapeNFT
 * @dev Deployment script using Foundry
 *
 * Usage:
 * forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_RPC_URL --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        // Load deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying PizzaMixtapeNFT with account:", deployer);
        console.log("Account balance:", deployer.balance);

        // Metadata URI (update this with your actual IPFS CID or metadata URL)
        string memory metadataURI = "ipfs://QmYourCIDHere/metadata.json";

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        PizzaMixtapeNFT nft = new PizzaMixtapeNFT(metadataURI);

        console.log("PizzaMixtapeNFT deployed to:", address(nft));

        // Authorize the minter wallet (backend wallet)
        address minterWallet = vm.envAddress("MINTER_WALLET_ADDRESS");
        nft.setAuthorizedMinter(minterWallet, true);

        console.log("Authorized minter:", minterWallet);

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Contract Address:", address(nft));
        console.log("Authorized Minter:", minterWallet);
        console.log("BaseScan URL: https://basescan.org/address/", address(nft));
    }
}
