# IPNS Backup Storage Setup

This guide explains how to set up IPNS (InterPlanetary Name System) as a backup storage solution for images, providing redundancy alongside your primary Lighthouse/Storacha storage.

## Overview

Your app now supports dual storage:
- **Primary**: Lighthouse/Storacha (fast, reliable)
- **Backup**: IPNS via IPFS Desktop (decentralized, permanent)

## Setup Instructions

### 1. Install IPFS Desktop

Download and install IPFS Desktop from: https://docs.ipfs.tech/install/ipfs-desktop/

### 2. Configure IPFS Desktop

1. Open IPFS Desktop
2. Go to **Settings** → **Advanced**
3. Enable **HTTP API** (usually on `http://localhost:5001`)
4. Note your API URL (default: `http://localhost:5001`)

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Enable IPNS backup
NEXT_PUBLIC_ENABLE_IPNS_BACKUP=true

# IPFS HTTP API URL (from IPFS Desktop)
NEXT_PUBLIC_IPFS_API_URL=http://localhost:5001

# IPNS Key Name (this will be your permanent identifier)
NEXT_PUBLIC_IPNS_KEY_NAME=nightstudio
```

### 4. Test the Connection

1. Start your Next.js app
2. Open browser console
3. Run: `window.testIPNSConnection()`
4. You should see success messages

### 5. Upload an Image

Upload an image through your app. You should see logs like:
```
📤 Attempting IPNS backup...
📝 Created new IPNS key: nightstudio
📢 Published to IPNS: k51qzi5uqu5dk3r2o09ffw9s0036c22lk2ipec61q3yn7x1r48uyaeurv3hiq6/
✅ IPNS backup successful: https://ipfs.io/ipns/k51qzi5uqu5dk3r2o09ffw9s0036c22lk2ipec61q3yn7x1r48uyaeurv3hiq6/
```

## How It Works

1. **Primary Upload**: Images upload to Lighthouse/Storacha first
2. **IPNS Backup**: Same images are also uploaded to your IPNS directory
3. **Database Storage**: Both URLs are stored in the database
4. **Fallback**: If primary fails, IPNS backup ensures images are still accessible

## Benefits

- **Redundancy**: Images stored in multiple locations
- **Decentralization**: No single point of failure
- **Permanence**: IPNS provides permanent, updateable links
- **Cost-effective**: IPFS storage is essentially free
- **Censorship-resistant**: Decentralized storage can't be taken down

## Database Schema Changes

Posts and profiles now include IPNS backup URLs:

```typescript
interface Post {
  // ... existing fields
  ipnsBlurred?: string;   // IPNS URL for blurred image
  ipnsOriginal?: string;  // IPNS URL for original image
}

interface Profile {
  // ... existing fields
  ipnsAvatar?: string;    // IPNS URL for avatar backup
  ipnsBanner?: string;    // IPNS URL for banner backup
}
```

## Troubleshooting

### Common Issues

1. **IPFS API not accessible**
   - Ensure IPFS Desktop is running
   - Check that HTTP API is enabled in settings
   - Verify the API URL is correct

2. **IPNS key creation fails**
   - Check IPFS Desktop permissions
   - Try running IPFS Desktop as administrator
   - Ensure the key name doesn't conflict

3. **Upload succeeds but IPNS fails**
   - Primary upload still works
   - IPNS is just a backup, so functionality isn't affected
   - Check console logs for specific error messages

### Testing Commands

Run these in your browser console:

```javascript
// Test IPFS connection
window.testIPNSConnection()

// Test primary storage
window.testLighthouseConnection()

// Upload test image (replace with actual file)
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
uploadImage(testFile)
```

## Advanced Configuration

### Custom IPNS Keys

You can create multiple IPNS keys for different content types:

```bash
# Create additional keys
curl "http://localhost:5001/api/v0/key/gen?arg=avatars&type=rsa&size=2048"
curl "http://localhost:5001/api/v0/key/gen?arg=posts&type=rsa&size=2048"
```

### IPNS Publishing

To manually publish content to IPNS:

```bash
# Add file to IPFS
CID=$(curl -X POST -F "file=@image.jpg" "http://localhost:5001/api/v0/add" | jq -r '.Hash')

# Publish to IPNS
curl "http://localhost:5001/api/v0/name/publish?arg=$CID&key=nightstudio"
```

## Monitoring

Monitor your IPNS storage:

1. Check your IPNS URL: `https://ipfs.io/ipns/your-key-name`
2. View IPFS logs in IPFS Desktop
3. Monitor storage usage in IPFS Desktop dashboard
4. Check browser console for upload status messages

## Security Considerations

- IPNS keys are stored locally in IPFS Desktop
- Back up your IPFS repository regularly
- Consider encryption for sensitive content
- Monitor access logs if needed

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify IPFS Desktop is running and configured correctly
3. Test the API endpoints manually using curl
4. Check the IPFS documentation: https://docs.ipfs.tech/