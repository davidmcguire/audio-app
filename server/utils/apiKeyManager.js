const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class ApiKeyManager {
  constructor() {
    this.keys = new Map();
    this.rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  createApiKey(userId, permissions = ['read']) {
    const key = this.generateKey();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    this.keys.set(key, {
      userId,
      permissions,
      createdAt: new Date(),
      expiresAt,
      lastUsed: new Date()
    });

    return {
      key,
      expiresAt
    };
  }

  validateApiKey(key) {
    const keyData = this.keys.get(key);
    if (!keyData) return false;

    // Check if key is expired
    if (keyData.expiresAt < new Date()) {
      this.keys.delete(key);
      return false;
    }

    // Update last used timestamp
    keyData.lastUsed = new Date();
    return keyData;
  }

  rotateKey(oldKey) {
    const keyData = this.keys.get(oldKey);
    if (!keyData) return null;

    const newKey = this.generateKey();
    this.keys.set(newKey, {
      ...keyData,
      createdAt: new Date(),
      lastUsed: new Date()
    });

    // Delete old key after a grace period
    setTimeout(() => {
      this.keys.delete(oldKey);
    }, 24 * 60 * 60 * 1000); // 24 hours grace period

    return {
      key: newKey,
      expiresAt: keyData.expiresAt
    };
  }

  revokeKey(key) {
    this.keys.delete(key);
  }

  getKeyInfo(key) {
    const keyData = this.keys.get(key);
    if (!keyData) return null;

    return {
      userId: keyData.userId,
      permissions: keyData.permissions,
      createdAt: keyData.createdAt,
      expiresAt: keyData.expiresAt,
      lastUsed: keyData.lastUsed
    };
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

module.exports = apiKeyManager; 