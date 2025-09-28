# Base Name Service Label Validation Policy

## Overview

The Base Name Service implements strict on-chain validation for domain labels to ensure security, prevent homograph attacks, and maintain consistency across the namespace.

## Validation Rules

### Character Set Restrictions

**Allowed Characters:**
- Lowercase letters: `a-z` (0x61-0x7a)
- Numbers: `0-9` (0x30-0x39)
- Hyphens: `-` (0x2d)

**Prohibited Characters:**
- Uppercase letters (`A-Z`)
- Unicode characters (including accented letters, emojis, etc.)
- Special characters (`!@#$%^&*()_+=[]{}|;':",./<>?`)
- Spaces and tabs
- Control characters

### Length Requirements

- **Minimum length**: 3 characters
- **Maximum length**: Unlimited (limited only by gas costs)

### Hyphen Rules

- **Leading hyphens**: Not allowed (e.g., `-example`)
- **Trailing hyphens**: Not allowed (e.g., `example-`)
- **Consecutive hyphens**: Not allowed (e.g., `exam--ple`)
- **Valid usage**: Single hyphens between alphanumeric characters (e.g., `my-domain`)

## Implementation Details

### On-Chain Validation

The validation is implemented in the `valid()` function in `ETHRegistrarController.sol`:

```solidity
function valid(string memory label) public pure returns (bool) {
    uint256 len = label.strlen();
    if (len < 3) return false;

    bytes memory labelBytes = bytes(label);

    // Check first and last character cannot be hyphen
    if (labelBytes[0] == 0x2d || labelBytes[len - 1] == 0x2d) return false;

    bool lastWasHyphen = false;
    for (uint256 i = 0; i < len; i++) {
        bytes1 char = labelBytes[i];

        // Check for valid characters: a-z (0x61-0x7a), 0-9 (0x30-0x39), hyphen (0x2d)
        bool isLowerLetter = (char >= 0x61 && char <= 0x7a);
        bool isDigit = (char >= 0x30 && char <= 0x39);
        bool isHyphen = (char == 0x2d);

        if (!isLowerLetter && !isDigit && !isHyphen) {
            return false;
        }

        // Check for consecutive hyphens
        if (isHyphen) {
            if (lastWasHyphen) return false;
            lastWasHyphen = true;
        } else {
            lastWasHyphen = false;
        }
    }

    return true;
}
```

### Integration Points

The validation is enforced at multiple points:

1. **Registration**: Called during domain registration via `register()`
2. **Availability Check**: Used in `available()` function
3. **Public Interface**: Available for frontend validation

## Frontend Implementation Guidelines

### Recommended Approach

1. **Client-side Pre-validation**: Implement the same validation rules in your frontend to provide immediate feedback
2. **Normalization**: Convert user input to lowercase before validation
3. **User Feedback**: Provide clear error messages for validation failures
4. **Real-time Validation**: Validate as the user types for better UX

### Example JavaScript Implementation

```javascript
function validateLabel(label) {
    // Convert to lowercase
    label = label.toLowerCase();

    // Check length
    if (label.length < 3) {
        return { valid: false, error: "Label must be at least 3 characters long" };
    }

    // Check character set
    if (!/^[a-z0-9-]+$/.test(label)) {
        return { valid: false, error: "Label can only contain lowercase letters, numbers, and hyphens" };
    }

    // Check hyphen rules
    if (label.startsWith('-') || label.endsWith('-')) {
        return { valid: false, error: "Label cannot start or end with a hyphen" };
    }

    if (label.includes('--')) {
        return { valid: false, error: "Label cannot contain consecutive hyphens" };
    }

    return { valid: true };
}
```

## Security Considerations

### Homograph Attack Prevention

By restricting to ASCII-only characters, we prevent:
- Lookalike characters (e.g., Cyrillic 'a' vs Latin 'a')
- Mixed script attacks
- Unicode normalization attacks
- Punycode confusion

### Consistency

- **Deterministic**: The same label will always validate the same way
- **Gas-efficient**: Validation uses simple byte comparisons
- **Immutable**: Rules cannot be changed post-deployment

## Comparison with ENS

| Aspect | ENS | Base Name Service |
|--------|-----|-------------------|
| Character Set | Unicode (with normalization) | ASCII only |
| Normalization | UTS-46 | Lowercase conversion |
| Validation | Off-chain + on-chain | On-chain only |
| Complexity | High | Low |
| Security | Relies on normalization | Restrictive character set |

## Migration and Compatibility

### From Existing Systems

If migrating from systems that allow Unicode:
1. Audit existing names for compatibility
2. Provide mapping suggestions for incompatible names
3. Consider grandfathering mechanisms if needed

### Future Considerations

- The validation policy is immutable in the current implementation
- Future versions could be deployed with different rules
- Consider the trade-offs between flexibility and security

## Testing

### Valid Examples
- `abc` ✅
- `example` ✅
- `my-domain` ✅
- `web3-app` ✅
- `test123` ✅
- `a1b2c3` ✅

### Invalid Examples
- `ab` ❌ (too short)
- `ABC` ❌ (uppercase)
- `test@` ❌ (special character)
- `-test` ❌ (leading hyphen)
- `test-` ❌ (trailing hyphen)
- `test--name` ❌ (consecutive hyphens)
- `tést` ❌ (accented character)
- `🚀` ❌ (emoji)

## Error Handling

When validation fails, the contract reverts with:
```
NameNotAvailable(string name)
```

This error is thrown for both invalid labels and unavailable names to maintain a consistent interface.

## Best Practices for Integrators

1. **Always validate client-side first** for better UX
2. **Normalize input** by converting to lowercase
3. **Provide helpful suggestions** for common mistakes
4. **Cache validation results** where appropriate
5. **Test edge cases** thoroughly
6. **Handle errors gracefully** with clear user messaging

## Compliance and Standards

- **ASCII-only**: Complies with traditional DNS restrictions
- **RFC 1035**: Compatible with original DNS hostname rules
- **Security-first**: Prioritizes security over flexibility
- **Gas-optimized**: Minimal on-chain computation required

This validation policy ensures that Base Name Service domains are secure, consistent, and compatible while preventing common attack vectors associated with international domain names.