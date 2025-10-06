// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IBaseRegistrar {
    function nameExpires(uint256 id) external view returns (uint256);
    function available(uint256 id) external view returns (bool);
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title BaseNamesMetadataWithStorage
 * @notice Generates beautiful on-chain metadata for Base Names NFTs
 * @dev Stores name mappings and returns data URI with embedded SVG and JSON metadata
 */
contract BaseNamesMetadataWithStorage is Ownable {
    using Strings for uint256;

    IBaseRegistrar public immutable registrar;
    string public baseNode = ".base";

    // Mapping from tokenId (label hash) to actual domain name
    mapping(uint256 => string) public labels;

    // Authorized addresses that can set labels (controller contracts)
    mapping(address => bool) public authorizedCallers;

    event LabelSet(uint256 indexed tokenId, string label);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);

    constructor(address _registrar) {
        registrar = IBaseRegistrar(_registrar);
        _transferOwnership(msg.sender);
    }

    /**
     * @notice Authorize an address to set labels (e.g., controller contract)
     */
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }

    /**
     * @notice Store the label for a token ID
     * @dev Can be called by authorized callers (like the controller during registration)
     */
    function setLabel(uint256 tokenId, string calldata label) external {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        labels[tokenId] = label;
        emit LabelSet(tokenId, label);
    }

    /**
     * @notice Batch set labels (for migration)
     */
    function setLabelsBatch(uint256[] calldata tokenIds, string[] calldata _labels) external onlyOwner {
        require(tokenIds.length == _labels.length, "Length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            labels[tokenIds[i]] = _labels[i];
            emit LabelSet(tokenIds[i], _labels[i]);
        }
    }

    /**
     * @notice Generate SVG image for a domain name
     * @param name The domain name (without .base)
     * @return SVG as a string
     */
    function generateSVG(string memory name, bool isExpired) internal pure returns (string memory) {
        return string(abi.encodePacked(
            _svgHeader(isExpired),
            _svgContent(name, isExpired),
            '</svg>'
        ));
    }

    function _svgHeader(bool isExpired) private pure returns (string memory) {
        string memory colors = isExpired ? '#666,#888' : '#0052FF,#0066FF';
        return string(abi.encodePacked(
            '<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="',
            isExpired ? '#666' : '#0052FF',
            '"/><stop offset="100%" stop-color="',
            isExpired ? '#888' : '#0066FF',
            '"/></linearGradient></defs><rect width="500" height="500" fill="url(#g)"/>'
        ));
    }

    function _svgContent(string memory name, bool isExpired) private pure returns (string memory) {
        return string(abi.encodePacked(
            '<rect x="50" y="150" width="400" height="200" rx="20" fill="white" opacity="0.15"/>',
            '<text x="250" y="230" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="white">',
            name,
            '</text><text x="250" y="280" font-family="Arial" font-size="32" text-anchor="middle" fill="white">.base</text>',
            '<text x="250" y="430" font-family="Arial" font-size="18" text-anchor="middle" fill="rgba(255,255,255,0.7)">BASE NAMES</text>'
        ));
    }

    /**
     * @notice Get trait rarity based on domain length
     */
    function getLengthRarity(uint256 length) internal pure returns (string memory) {
        if (length == 1) return "Legendary";
        if (length == 2) return "Epic";
        if (length == 3) return "Rare";
        if (length == 4) return "Uncommon";
        return "Common";
    }

    /**
     * @notice Calculate days until expiration
     */
    function getDaysUntilExpiration(uint256 expires) internal view returns (uint256) {
        if (block.timestamp >= expires) return 0;
        return (expires - block.timestamp) / 1 days;
    }

    /**
     * @notice Generate complete token URI with metadata
     * @param tokenId The NFT token ID (label hash)
     * @return Complete data URI with JSON metadata
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        string memory label = labels[tokenId];
        require(bytes(label).length > 0, "Label not set");

        uint256 expires = registrar.nameExpires(tokenId);
        bool isExpired = block.timestamp > expires;
        uint256 daysLeft = getDaysUntilExpiration(expires);
        uint256 nameLength = bytes(label).length;
        string memory rarity = getLengthRarity(nameLength);

        string memory svg = generateSVG(label, isExpired);
        string memory svgBase64 = Base64.encode(bytes(svg));

        string memory fullDomain = string(abi.encodePacked(label, baseNode));

        string memory json = string(abi.encodePacked(
            '{',
            '"name": "', fullDomain, '",',
            '"description": "', fullDomain, ' - A decentralized domain name on Base L2. Own your identity, build your brand, and control your digital presence on Base.",',
            '"image": "data:image/svg+xml;base64,', svgBase64, '",',
            '"external_url": "https://basenameservice.xyz/domain/', label, '",',
            '"attributes": [',
            '{"trait_type": "Domain", "value": "', fullDomain, '"},',
            '{"trait_type": "Label", "value": "', label, '"},',
            '{"trait_type": "Length", "value": ', nameLength.toString(), '},',
            '{"trait_type": "Rarity", "value": "', rarity, '"},',
            '{"trait_type": "Expiration", "display_type": "date", "value": ', expires.toString(), '},',
            '{"trait_type": "Days Until Expiration", "value": ', daysLeft.toString(), '},',
            '{"trait_type": "Status", "value": "', isExpired ? 'Expired' : 'Active', '"},',
            '{"trait_type": "Network", "value": "Base"},',
            '{"trait_type": "Standard", "value": "ERC-721"}',
            ']',
            '}'
        ));

        string memory jsonBase64 = Base64.encode(bytes(json));

        return string(abi.encodePacked(
            'data:application/json;base64,',
            jsonBase64
        ));
    }

    /**
     * @notice Get label for a token ID
     */
    function getLabel(uint256 tokenId) external view returns (string memory) {
        return labels[tokenId];
    }

    /**
     * @notice Check if label is set for a token
     */
    function hasLabel(uint256 tokenId) external view returns (bool) {
        return bytes(labels[tokenId]).length > 0;
    }
}
