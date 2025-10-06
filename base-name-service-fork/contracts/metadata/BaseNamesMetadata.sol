// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IBaseRegistrar {
    function nameExpires(uint256 id) external view returns (uint256);
    function available(uint256 id) external view returns (bool);
}

/**
 * @title BaseNamesMetadata
 * @notice Generates beautiful on-chain metadata for Base Names NFTs
 * @dev Returns data URI with embedded SVG and JSON metadata
 */
contract BaseNamesMetadata {
    using Strings for uint256;

    IBaseRegistrar public immutable registrar;
    string public baseNode = ".base";

    constructor(address _registrar) {
        registrar = IBaseRegistrar(_registrar);
    }

    /**
     * @notice Generate SVG image for a domain name
     * @param name The domain name (without .base)
     * @return SVG as a string
     */
    function generateSVG(string memory name) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0052FF;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#0066FF;stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#grad)"/>',
            '<text x="200" y="180" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">',
            name,
            '</text>',
            '<text x="200" y="220" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="rgba(255,255,255,0.8)">',
            '.base',
            '</text>',
            '<text x="200" y="280" font-family="monospace" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.6)">',
            'Base Names',
            '</text>',
            '<circle cx="200" cy="60" r="30" fill="white" opacity="0.2"/>',
            '<path d="M 200 40 L 210 50 L 200 60 L 190 50 Z" fill="white"/>',
            '</svg>'
        ));
    }

    /**
     * @notice Convert uint256 label hash to domain name string
     * @dev This is a placeholder - you'll need to store name mappings
     * @param labelHash The keccak256 hash of the label
     * @return The domain name (for now returns the hash as string)
     */
    function getLabelFromHash(uint256 labelHash) internal pure returns (string memory) {
        // TODO: Implement reverse lookup from hash to name
        // For now, return a truncated version of the hash
        return string(abi.encodePacked("domain-", labelHash.toString()));
    }

    /**
     * @notice Generate complete token URI with metadata
     * @param tokenId The NFT token ID (label hash)
     * @param name The domain name
     * @return Complete data URI with JSON metadata
     */
    function tokenURI(uint256 tokenId, string memory name) external view returns (string memory) {
        uint256 expires = registrar.nameExpires(tokenId);
        bool isExpired = block.timestamp > expires;

        string memory svg = generateSVG(name);
        string memory svgBase64 = Base64.encode(bytes(svg));

        string memory json = string(abi.encodePacked(
            '{',
            '"name": "', name, baseNode, '",',
            '"description": "Base Names - Decentralized domain on Base L2. Own your identity on Base.",',
            '"image": "data:image/svg+xml;base64,', svgBase64, '",',
            '"external_url": "https://basenameservice.xyz/name/', name, '",',
            '"attributes": [',
            '{"trait_type": "Domain", "value": "', name, baseNode, '"},',
            '{"trait_type": "Length", "value": ', uint256(bytes(name).length).toString(), '},',
            '{"trait_type": "Expiration", "display_type": "date", "value": ', expires.toString(), '},',
            '{"trait_type": "Status", "value": "', isExpired ? 'Expired' : 'Active', '"}',
            ']',
            '}'
        ));

        string memory jsonBase64 = Base64.encode(bytes(json));

        return string(abi.encodePacked(
            'data:application/json;base64,',
            jsonBase64
        ));
    }

}
