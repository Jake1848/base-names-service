//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

/**
 * @title RRUtils
 * @dev Utility library for parsing DNS resource records
 */
library RRUtils {
    using RRUtils for *;

    /**
     * @dev RRIterator is used to iterate over resource records in a DNS response
     */
    struct RRIterator {
        bytes data;
        uint256 offset;
        uint16 dnstype;
        uint16 class;
        uint32 ttl;
        uint256 rdataOffset;
        uint256 nextOffset;
    }

    /**
     * @dev Reads a DNS name from the specified offset, following compression pointers if necessary.
     * @param data The DNS response data.
     * @param offset The offset to start reading from.
     * @return name The DNS name, as bytes.
     * @return nextOffset The offset after the name.
     */
    function readName(bytes memory data, uint256 offset) internal pure returns (bytes memory name, uint256 nextOffset) {
        uint256 len = nameLength(data, offset);
        name = new bytes(len);

        uint256 idx = 0;
        uint256 off = offset;

        while (true) {
            uint256 labelLen = uint256(uint8(data[off]));

            if (labelLen == 0) {
                off++;
                break;
            } else if (labelLen < 64) {
                // Regular label
                if (idx > 0) {
                    name[idx++] = 0x2e; // '.'
                }
                for (uint256 i = 0; i < labelLen; i++) {
                    name[idx++] = data[off + i + 1];
                }
                off += labelLen + 1;
            } else if ((labelLen & 0xc0) == 0xc0) {
                // Compression pointer
                uint256 ptr = ((labelLen & 0x3f) << 8) | uint256(uint8(data[off + 1]));

                // Follow the pointer for the name content
                (bytes memory suffix, ) = readName(data, ptr);
                if (idx > 0 && suffix.length > 0) {
                    name[idx++] = 0x2e; // '.'
                }
                for (uint256 i = 0; i < suffix.length; i++) {
                    name[idx++] = suffix[i];
                }

                return (name, off + 2);
            } else {
                revert("Invalid label length");
            }
        }

        return (name, off);
    }

    /**
     * @dev Returns the length of a DNS name at the specified offset.
     * @param data The DNS response data.
     * @param offset The offset to start reading from.
     * @return The length of the DNS name, in bytes.
     */
    function nameLength(bytes memory data, uint256 offset) internal pure returns (uint256) {
        uint256 len = 0;
        uint256 off = offset;

        while (true) {
            uint256 labelLen = uint256(uint8(data[off]));

            if (labelLen == 0) {
                break;
            } else if (labelLen < 64) {
                // Regular label
                if (len > 0) {
                    len++; // For the dot
                }
                len += labelLen;
                off += labelLen + 1;
            } else if ((labelLen & 0xc0) == 0xc0) {
                // Compression pointer
                uint256 ptr = ((labelLen & 0x3f) << 8) | uint256(uint8(data[off + 1]));
                uint256 suffixLen = nameLength(data, ptr);
                if (len > 0 && suffixLen > 0) {
                    len++; // For the dot
                }
                len += suffixLen;
                break;
            } else {
                revert("Invalid label length");
            }
        }

        return len;
    }

    /**
     * @dev Creates an RRIterator to iterate over resource records.
     * @param data The DNS response data.
     * @param offset The offset to start iterating from.
     * @return An RRIterator positioned at the first resource record.
     */
    function iterateRRs(bytes memory data, uint256 offset) internal pure returns (RRIterator memory) {
        RRIterator memory iter;
        iter.data = data;
        iter.offset = offset;
        iter.nextOffset = offset;
        return iter.next();
    }

    /**
     * @dev Checks if there are more resource records to iterate over.
     * @param iter The RRIterator.
     * @return True if the iterator has finished.
     */
    function done(RRIterator memory iter) internal pure returns (bool) {
        return iter.offset >= iter.data.length;
    }

    /**
     * @dev Moves the iterator to the next resource record.
     * @param iter The RRIterator.
     * @return The updated iterator.
     */
    function next(RRIterator memory iter) internal pure returns (RRIterator memory) {
        if (iter.nextOffset >= iter.data.length) {
            iter.offset = iter.data.length;
            return iter;
        }

        iter.offset = iter.nextOffset;

        // Skip the name
        (, uint256 off) = readName(iter.data, iter.offset);

        // Check we have enough data for the RR header
        if (off + 10 > iter.data.length) {
            iter.offset = iter.data.length;
            return iter;
        }

        // Read the RR header
        iter.dnstype = uint16(uint8(iter.data[off])) << 8 | uint16(uint8(iter.data[off + 1]));
        iter.class = uint16(uint8(iter.data[off + 2])) << 8 | uint16(uint8(iter.data[off + 3]));
        iter.ttl = uint32(uint8(iter.data[off + 4])) << 24 |
                   uint32(uint8(iter.data[off + 5])) << 16 |
                   uint32(uint8(iter.data[off + 6])) << 8 |
                   uint32(uint8(iter.data[off + 7]));

        uint256 rdataLen = uint16(uint8(iter.data[off + 8])) << 8 | uint16(uint8(iter.data[off + 9]));
        iter.rdataOffset = off + 10;
        iter.nextOffset = iter.rdataOffset + rdataLen;

        return iter;
    }

    /**
     * @dev Returns the name of the current resource record.
     * @param iter The RRIterator.
     * @return The name of the resource record.
     */
    function name(RRIterator memory iter) internal pure returns (bytes memory) {
        (bytes memory name, ) = readName(iter.data, iter.offset);
        return name;
    }

    /**
     * @dev Returns the data of the current resource record.
     * @param iter The RRIterator.
     * @return The resource record data.
     */
    function rdata(RRIterator memory iter) internal pure returns (bytes memory) {
        uint256 len = iter.nextOffset - iter.rdataOffset;
        bytes memory data = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            data[i] = iter.data[iter.rdataOffset + i];
        }
        return data;
    }

    /**
     * @dev Counts the number of labels in a DNS name.
     * @param data The DNS name.
     * @param offset The offset to start from.
     * @return The number of labels.
     */
    function labelCount(bytes memory data, uint256 offset) internal pure returns (uint256) {
        uint256 count = 0;
        uint256 off = offset;

        while (off < data.length) {
            uint256 labelLen = uint256(uint8(data[off]));

            if (labelLen == 0) {
                break;
            } else if (labelLen < 64) {
                count++;
                off += labelLen + 1;
            } else if ((labelLen & 0xc0) == 0xc0) {
                // Compression pointer - count labels at the pointed location
                uint256 ptr = ((labelLen & 0x3f) << 8) | uint256(uint8(data[off + 1]));
                return count + labelCount(data, ptr);
            } else {
                revert("Invalid label length");
            }
        }

        return count;
    }

    /**
     * @dev Compares two DNS names for equality.
     * @param a The first DNS name.
     * @param b The second DNS name.
     * @return 0 if equal, 1 if a > b, -1 if a < b
     */
    function compareNames(bytes memory a, bytes memory b) internal pure returns (int) {
        if (a.length != b.length) {
            return a.length > b.length ? int(1) : int(-1);
        }

        for (uint256 i = 0; i < a.length; i++) {
            bytes1 ac = a[i];
            bytes1 bc = b[i];

            // Case-insensitive comparison for ASCII letters
            if (ac >= 0x41 && ac <= 0x5A) {
                ac = bytes1(uint8(ac) + 32);
            }
            if (bc >= 0x41 && bc <= 0x5A) {
                bc = bytes1(uint8(bc) + 32);
            }

            if (ac != bc) {
                return ac > bc ? int(1) : int(-1);
            }
        }

        return 0;
    }

    /**
     * @dev Checks if serial number i1 is greater than or equal to i2, using serial number arithmetic.
     * @param i1 The first serial number.
     * @param i2 The second serial number.
     * @return True if i1 >= i2.
     */
    function serialNumberGte(uint32 i1, uint32 i2) internal pure returns (bool) {
        unchecked {
            return int32(i1) - int32(i2) >= 0;
        }
    }

    /**
     * @dev Computes the keytag for a DNSKEY record.
     * @param data The DNSKEY record data.
     * @return The computed keytag.
     */
    function computeKeytag(bytes memory data) internal pure returns (uint16) {
        uint256 ac = 0;
        for (uint256 i = 0; i < data.length; i++) {
            ac += (i & 1) == 0 ? uint256(uint8(data[i])) << 8 : uint256(uint8(data[i]));
        }
        ac += (ac >> 16) & 0xFFFF;
        return uint16(ac & 0xFFFF);
    }
}