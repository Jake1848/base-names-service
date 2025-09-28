# Contributing to Base Name Service

Thank you for your interest in contributing to the Base Name Service! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to maintain a welcoming community.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/base-name-service.git
   cd base-name-service
   ```

3. Install dependencies:
   ```bash
   cd base-name-service-fork
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests
```bash
npm test                 # Run all tests
npm run test:gas        # Run tests with gas reporting
npm run coverage        # Generate coverage report
```

### Linting and Formatting
```bash
npm run lint            # Run all linters
npm run lint:sol        # Lint Solidity files
npm run lint:js         # Lint JavaScript files
npm run format          # Auto-format code
```

### Compiling Contracts
```bash
npm run compile         # Compile all contracts
npm run clean          # Clean build artifacts
```

## Pull Request Process

1. **Ensure your code passes all tests and linting**
   ```bash
   npm test
   npm run lint
   ```

2. **Update documentation** if you've made changes to:
   - Contract interfaces
   - Deployment process
   - Configuration options
   - Public APIs

3. **Write tests** for new features:
   - Unit tests for individual functions
   - Integration tests for complex interactions
   - Gas optimization tests for critical paths

4. **Update the changelog** in CHANGELOG.md

5. **Submit your PR**:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include test results and gas reports if relevant

## Coding Standards

### Solidity
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use meaningful variable and function names
- Add NatSpec comments for all public functions
- Keep functions small and focused
- Optimize for gas efficiency

### JavaScript/TypeScript
- Use ES6+ features
- Follow ESLint configuration
- Add JSDoc comments for complex functions
- Keep test files organized and descriptive

### Git Commits
- Use conventional commit format:
  ```
  type(scope): description

  [optional body]

  [optional footer]
  ```
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused

## Security

- Never commit sensitive data (private keys, API keys)
- Report security vulnerabilities privately to the maintainers
- Follow security best practices for smart contracts
- Run security analysis tools before submitting PRs

## Testing Guidelines

### Unit Tests
- Test each function independently
- Cover edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

### Integration Tests
- Test contract interactions
- Verify state changes
- Test failure scenarios
- Validate events emission

### Gas Optimization
- Report gas usage for critical functions
- Compare before/after for optimizations
- Document tradeoffs if any

## Documentation

- Update inline code comments
- Update README for user-facing changes
- Update technical docs for architecture changes
- Add examples for new features

## Questions?

Feel free to:
- Open an issue for bugs or features
- Start a discussion for questions
- Contact maintainers for security issues

Thank you for contributing!