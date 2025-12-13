# Node.js Version Configuration

## ✅ Current Configuration

- **Functions Node Version:** Node 20 (specified in `functions/package.json`)
- **`.nvmrc` files created:** Both root and functions directory

## 📋 Files Updated

1. **`functions/package.json`** - Already has `"node": "20"` in engines
2. **`.nvmrc`** (root) - Created with `20`
3. **`functions/.nvmrc`** - Created with `20`

## 🚀 Using Node 20

### Option 1: Automatic (with nvm)
If you have nvm installed, it will automatically use Node 20 when you `cd` into the directory:
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
# nvm will automatically use Node 20 (from .nvmrc)
```

### Option 2: Manual Switch
```bash
source ~/.nvm/nvm.sh
nvm use 20
# or
nvm use  # (will read from .nvmrc)
```

### Option 3: Set as Default
```bash
nvm alias default 20
```

## 🔍 Verify Node Version

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

## 📦 Firebase Functions

Firebase Functions will use Node 20 as specified in `functions/package.json`:
```json
"engines": {
  "node": "20"
}
```

This means when you deploy, Firebase will use Node 20 runtime.

## ⚠️ Troubleshooting

If Firebase CLI still complains about Node version:

1. **Check current Node version:**
   ```bash
   node --version
   ```

2. **Switch to Node 20:**
   ```bash
   source ~/.nvm/nvm.sh
   nvm use 20
   ```

3. **Verify Firebase CLI uses correct Node:**
   ```bash
   which node
   which firebase
   ```

4. **If needed, reinstall Firebase CLI:**
   ```bash
   npm uninstall -g firebase-tools
   npm install -g firebase-tools
   ```

## ✅ Ready to Deploy

Once Node 20 is active, you can deploy:
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
source ~/.nvm/nvm.sh
nvm use 20
firebase deploy --only functions:generatePlan
```

