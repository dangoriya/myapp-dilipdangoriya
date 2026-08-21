# Frontend Local Development & Setup Guide

This document provides a step-by-step setup guide to run and test the frontend application locally on a fresh development machine.

---

## 📋 Prerequisites

- **Node.js**: v20.x (LTS recommended)
- **Package Manager**: `pnpm` v9.x (pinned for Node 20 compatibility)

---

## 🛠️ Step 1: Local Environment Setup

### 1. Install Node.js (via `nvm`)
If Node.js is not installed on your machine, install it via Node Version Manager (`nvm`):

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload terminal environment
source ~/.bashrc

# Install & use Node 20
nvm install 20
nvm use 20
```

### 2. Install `pnpm` v9 globally
> **Note**: `pnpm@9` must be used with Node 20 to avoid `node:sqlite` module compatibility errors introduced in pnpm v10+.

```bash
npm install -g pnpm@9 --force
```

Verify installations:
```bash
node -v   # Should output v20.x.x
pnpm -v   # Should output 9.x.x
```

---

## 🚀 Step 2: Running the Nextjs App Locally

### 1. Navigate to the frontend directory
```bash
cd nextjs-app
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Variables Setup (.env.local)
Create a `.env.local` file inside `nextjs-app/` to configure different system variable.
- External backend URL Setup (optional):

```env
BACKEND_API_URL=http://localhost:8051
```

> **Note**: `.env.local` is ignored in `.gitignore` and `.dockerignore` so system environment variables never baked into production Docker builds.

### 4. Start the development server
```bash
pnpm dev
```

The application will start at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🧹 Troubleshooting Common Issues

### Issue 1: `EACCES: permission denied, open '.next/package.json'`
**Cause**: The `.next` directory was previously generated inside a Docker container or with `sudo` permissions.

**Fix**:
```bash
rm -rf .next node_modules
pnpm install
```

### Issue 2: `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` when running `pnpm`
**Cause**: `pnpm` v10+ was installed, which requires Node.js v22+.

**Fix**:
```bash
npm install -g pnpm@9 --force
```
