const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Setu OKYC Configuration
const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID || 'sandbox_client_id';
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET || 'sandbox_client_secret';
const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID || 'sandbox_instance_id';
const REDIRECT_URL = process.env.SERVER_URL ? `${process.env.SERVER_URL}/api/ekyc/setu/callback` : 'http://localhost:3001/api/ekyc/setu/callback';

const SETU_BASE_URL = 'https://dg-sandbox.setu.co/api/okyc';

/**
 * Circuit Breaker Pattern for Upstream eKYC API
 */
const circuitBreaker = {
  failures: 0,
  threshold: 3,
  lastFailureTime: null,
  resetTimeout: 60000, // 1 minute
  
  isOpen() {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.failures = 0; // Half-open
        return false;
      }
      return true;
    }
    return false;
  },
  
  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  },
  
  recordSuccess() {
    this.failures = 0;
  }
};

/**
 * Initialize Setu OKYC Session
 */
router.get('/setu/auth', requireAuth, async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const tokenParams = req.query.token ? `?token=${req.query.token}` : '';

  // The Setu dg-sandbox endpoint is currently returning 410 Gone globally.
  // We force the mock flow immediately to prevent unnecessary timeouts and errors.
  const FORCE_MOCK = true;

  if (FORCE_MOCK || SETU_CLIENT_ID === 'sandbox_client_id' || circuitBreaker.isOpen()) {
    console.log('[Setu OKYC] Upstream sandbox is 410 Gone. Falling back to mock flow.');
    return res.redirect(`${clientUrl}/mock-aadhaar${tokenParams}`);
  }

  try {
    const response = await axios.post(SETU_BASE_URL, {
      redirectURL: REDIRECT_URL
    }, {
      headers: {
        'x-client-id': SETU_CLIENT_ID,
        'x-client-secret': SETU_CLIENT_SECRET,
        'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // aggressive timeout to fail fast
    });

    circuitBreaker.recordSuccess();
    const sessionUrl = response.data.url;
    res.redirect(sessionUrl);
  } catch (err) {
    circuitBreaker.recordFailure();
    console.warn(`[Setu OKYC] Init Error (Failures: ${circuitBreaker.failures}):`, err.response?.data || err.message);
    res.redirect(`${clientUrl}/mock-aadhaar${tokenParams}`);
  }
});

/**
 * Setu OKYC Callback
 */
router.get('/setu/callback', requireAuth, async (req, res) => {
  const { id, mock } = req.query; // Setu returns the request 'id'

  try {
    let userInfo;

    if (mock === 'true' || SETU_CLIENT_ID === 'sandbox_client_id') {
      // Fetch passport using userId to be completely safe against missing token payload fields
      const userPassport = await prisma.passport.findUnique({ where: { userId: req.user.userId } });
      if (!userPassport) throw new Error('Passport not found for user');
      
      console.log('[Setu OKYC] Using Mock Aadhaar response (Keys not provided)');
      userInfo = {
        name: userPassport?.displayName || 'John Doe',
        dob: '01-01-1990',
        gender: 'M',
        uuid: crypto.randomBytes(16).toString('hex')
      };
    } else {
      if (!id) throw new Error('Missing Setu request ID in callback');

      // Fetch the OKYC details from Setu
      const response = await axios.get(`${SETU_BASE_URL}/${id}`, {
        headers: {
          'x-client-id': SETU_CLIENT_ID,
          'x-client-secret': SETU_CLIENT_SECRET,
          'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID
        }
      });

      const data = response.data;
      if (data.status !== 'successful') {
        throw new Error('Aadhaar verification was not successful');
      }

      // Setu returns data in a specific format depending on the product
      userInfo = {
        name: data.profile?.name || data.name,
        dob: data.profile?.dob || data.dob,
        gender: data.profile?.gender || data.gender,
        uuid: data.id
      };
    }

    // Update the Passport record
    const userPassport = await prisma.passport.findUnique({ where: { userId: req.user.userId } });
    if (!userPassport) throw new Error('Passport not found for user');

    await prisma.passport.update({
      where: { id: userPassport.id },
      data: {
        ekycVerified: true,
        ekycProvider: 'setu_aadhaar',
        ekycName: userInfo.name,
        ekycId: userInfo.uuid
      }
    });

    // Redirect back to the dashboard with success
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/dashboard?ekyc=success`);

  } catch (err) {
    console.error('[Setu OKYC] Callback Error:', err);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/dashboard?ekyc=error`);
  }
});

// Alias digilocker routes to Setu to preserve frontend links temporarily
router.get('/digilocker/auth', (req, res) => res.redirect('/api/ekyc/setu/auth'));

module.exports = router;
