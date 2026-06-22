# Contributing to ProofStamp

First off, thank you for considering contributing to ProofStamp! It's people like you that make ProofStamp such a great tool for creators. We welcome contributions of all kinds from anyone.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/your-username/pramp/issues) page to see if someone else has already created a ticket. If not, go ahead and make one!

## 2. Setting up your development environment

To contribute code to ProofStamp, you'll need to set up the project locally. 

Please refer to the [Local Setup Guide](docs/local-setup.md) for step-by-step instructions on setting up the React frontend, Node.js backend, and Python FastAPI stego-service using Docker Compose.

## 3. Architecture Overview

ProofStamp consists of three main components:
- **`client/`**: React + Vite frontend application.
- **`server/`**: Node.js + Express backend providing the core API and Prisma database interaction.
- **`stego-service/`**: Python FastAPI service for digital watermarking and perceptual hashing.

## 4. Pull Request Process

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure your code lints and builds correctly.
4. Issue that pull request! Please use the provided PR template and fill out all relevant sections.

## 5. Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

Thank you for contributing!
