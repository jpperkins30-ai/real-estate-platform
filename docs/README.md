# Real Estate Platform Documentation

This directory contains the comprehensive documentation for the Real Estate Platform. Each document serves a specific purpose and is cross-referenced with related documentation.

## Core Documentation

### System and Development
- [Architecture Guide](./architecture.md) - System architecture, component design, and data flows
- [Development Guide](./development-guide.md) - Development environment setup and workflows
- [Component Testing Guide](./component-test-guide.md) - Testing procedures and guidelines

### Security and Authentication
- [Security Guide](./SECURITY.md) - Central security documentation and best practices
- [Security Improvements](./security-improvements.md) - Changelog of security enhancements
- [Authentication Setup](./authentication-setup.md) - Authentication implementation details

### Component Documentation
- [Map Component](../client/src/components/maps/DOCUMENTATION.md) - Interactive map visualization
- [Server Authentication](../server/README-AUTH.md) - Server-side authentication details

## Documentation Organization

### Main Guides
Each main guide focuses on a specific aspect of the platform:
- Architecture → System design and components
- Development → Environment setup and workflows
- Security → Security measures and practices
- Testing → Testing procedures and guidelines

### Cross-References
All documentation is interconnected through cross-references:
- Each document begins with links to related documentation
- Specific sections reference relevant details in other documents
- Implementation examples link to corresponding guides

### Component-Specific Documentation
Component documentation is located alongside the code:
- Client components → `client/src/components/*/DOCUMENTATION.md`
- Server modules → `server/*/README.md`
- Each links back to relevant main guides

## Contributing to Documentation

1. **Adding New Documentation**
   - Place in appropriate location (docs/ or component directory)
   - Add cross-references to related documents
   - Update this README if adding main documentation

2. **Updating Existing Documentation**
   - Maintain existing cross-references
   - Add new cross-references as needed
   - Keep format consistent with other documents

3. **Documentation Standards**
   - Use Markdown formatting
   - Include code examples where relevant
   - Maintain up-to-date cross-references
   - Follow the established structure

## Documentation Review Process

1. **Pre-Commit Review**
   - Verify all cross-references
   - Check code examples
   - Validate Markdown formatting
   - Ensure consistency with other docs

2. **Pull Request Requirements**
   - Update related documentation
   - Add new cross-references
   - Include documentation changes in PR description

## Getting Started

New to the project? Start with these documents:
1. [Development Guide](./development-guide.md) - Setup your environment
2. [Architecture Guide](./architecture.md) - Understand the system
3. [Security Guide](./SECURITY.md) - Learn security practices
4. Component documentation relevant to your work

## Welcome to the Real Estate Platform documentation. This index will help you navigate the available documentation files.

## Getting Started

- [Quick Start Guide](../WINDOWS-QUICKSTART.md) - Quick instructions for running the application on Windows
- [Manual Start Instructions](../MANUAL-START-INSTRUCTIONS.md) - Step-by-step guide for manually starting components
- [Setup Guide](./setup/installation.md) - Comprehensive installation and setup instructions
- [Project Overview](./overview.md) - High-level overview of the project architecture

## Windows-Specific Documentation

- [PowerShell Compatibility](./windows/powershell-compatibility.md) - Details on PowerShell limitations and workarounds
- [Windows Command Reference](./windows/command-reference.md) - Reference for Windows command execution
- [Script Execution Policy](./windows/script-execution-policy.md) - Guide for managing execution policies
- [Windows Environment Setup](./windows/environment-setup.md) - Setting up your Windows environment for development

## Component Guides

- [Inventory Module](./components/inventory.md) - Documentation for the Inventory Module
- [US Map Component](./components/usmap.md) - Documentation for the US Map Component
- [Collector Wizard](./components/wizard.md) - Documentation for the Collector Wizard
- [Component Visual Testing Guide](../component-test-guide.md) - Guide for visually testing components

## API Documentation

- [API Routes](./api/routes.md) - Documentation of all API routes
- [API Troubleshooting](./api/troubleshooting.md) - Guide for troubleshooting API issues
- [Testing API Endpoints](./api/testing-endpoints.md) - Procedures for testing API functionality
- [API Error Codes](./api/error-codes.md) - Reference for API error codes

## Authorization and Security

- [Role-Based Authorization](./auth/role-based-authorization.md) - Documentation of role-based access control
- [Testing Authorization](./auth/testing-authorization.md) - Guide for testing authorization functionality
- [JWT Tokens](./auth/jwt-tokens.md) - Information on JWT token implementation
- [Security Best Practices](./security/best-practices.md) - Security recommendations for the platform

## Development Guides

- [Development Workflow](./development/workflow.md) - Development process guidelines
- [Code Standards](./development/code-standards.md) - Coding standards and best practices
- [Testing Strategy](./development/testing-strategy.md) - Overall testing approach and guidelines
- [Dependency Management](./development/dependency-management.md) - Guide for managing dependencies

## Troubleshooting

- [General Troubleshooting](./troubleshooting/general.md) - General troubleshooting procedures
- [PowerShell Issues](./troubleshooting/powershell-issues.md) - Common PowerShell issues and solutions
- [Port Conflicts](./troubleshooting/port-conflicts.md) - Troubleshooting port conflict issues
- [Node.js Issues](./troubleshooting/nodejs-issues.md) - Common Node.js issues and solutions

## Script Reference

- [Script Usage Guide](./scripts/usage-guide.md) - Guide for using the various scripts
- [Application Startup Scripts](./scripts/startup-scripts.md) - Documentation for startup scripts
- [Component Testing Scripts](./scripts/testing-scripts.md) - Documentation for testing scripts
- [Utility Scripts](./scripts/utility-scripts.md) - Documentation for utility scripts

## Project Reports

- [Project Update](../PROJECT-REPORT-UPDATE.md) - Latest project update report
- [Components Summary](../COMPONENTS-SUMMARY.md) - Overview of all component functionality
- [Open Issues](../OPEN-ISSUES-DETAILED.md) - Detailed information about open issues
- [Authorization Implementation](../README-AUTH.md) - Documentation of the authorization implementation

## Contributing

- [Contributing Guidelines](./CONTRIBUTING.md) - Guidelines for contributing to the project
- [Issue Reporting](./contributing/issue-reporting.md) - How to report issues
- [Pull Request Process](./contributing/pull-request-process.md) - How to submit changes
- [Code Review Standards](./contributing/code-review-standards.md) - Standards for code reviews

## Reference

- [Technology Stack](./reference/technology-stack.md) - Overview of technologies used
- [Environment Variables](./reference/environment-variables.md) - Reference for environment variables
- [API Schema](./reference/api-schema.md) - Detailed API schema documentation
- [Glossary](./reference/glossary.md) - Definitions of terms used in the project 