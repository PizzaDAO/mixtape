// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PizzaMixtapeNFT
 * @dev ERC1155 contract for PizzaDAO Mixtape NFTs
 * Features:
 * - Single token ID (MIXTAPE_TOKEN_ID = 1) represents the mixtape
 * - Authorized minters can mint NFTs to users after USDC payment
 * - Tracks total supply of mixtapes minted
 */
contract PizzaMixtapeNFT is ERC1155, Ownable {
    // Constants
    uint256 public constant MIXTAPE_TOKEN_ID = 1;

    // State variables
    uint256 public totalMinted;
    mapping(address => bool) public authorizedMinters;

    // Events
    event MinterAuthorized(address indexed minter, bool authorized);
    event MixtapeMinted(address indexed to, uint256 amount, uint256 totalSupply);

    /**
     * @dev Constructor sets the metadata URI and initializes ownership
     * @param uri_ The base URI for token metadata
     */
    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {
        // Owner is automatically set by Ownable constructor
    }

    /**
     * @dev Modifier to restrict function access to authorized minters only
     */
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "PizzaMixtapeNFT: Not authorized to mint");
        _;
    }

    /**
     * @dev Set or revoke minter authorization
     * @param minter Address to authorize or revoke
     * @param authorized True to authorize, false to revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "PizzaMixtapeNFT: Cannot authorize zero address");
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @dev Mint mixtape NFTs to a specified address
     * Only authorized minters can call this function
     * @param to Address to receive the NFTs
     * @param amount Number of NFTs to mint
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter {
        require(to != address(0), "PizzaMixtapeNFT: Cannot mint to zero address");
        require(amount > 0, "PizzaMixtapeNFT: Amount must be greater than 0");

        _mint(to, MIXTAPE_TOKEN_ID, amount, "");
        totalMinted += amount;

        emit MixtapeMinted(to, amount, totalMinted);
    }

    /**
     * @dev Get the balance of mixtapes owned by an address
     * Convenience function that wraps ERC1155.balanceOf
     * @param account Address to check balance for
     * @return Number of mixtapes owned
     */
    function balanceOf(address account) public view returns (uint256) {
        return balanceOf(account, MIXTAPE_TOKEN_ID);
    }

    /**
     * @dev Update the metadata URI
     * @param newuri New base URI for token metadata
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    /**
     * @dev Override uri function to return the same URI for all token IDs
     * @param tokenId Token ID (ignored, all tokens use same URI)
     * @return Token metadata URI
     */
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        // For simplicity, all token IDs return the same URI
        // In production, you might want to return different URIs per token ID
        return super.uri(tokenId);
    }
}
