const rateLimit = require('express-rate-limit');

// 1. Rate Limiters for Sensitive Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/auth attempts per window
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact submissions per hour
  message: { message: 'Too many messages sent from this IP, please try again after an hour' }
});

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 comments per 15 minutes
  message: { message: 'Too many comments posted from this IP, please try again after 15 minutes' }
});

// 3. NoSQL Injection protection (Recursively strips mongo operators starting with $ or containing .)
const mongoSanitize = (req, res, next) => {
  const clean = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (obj[key] instanceof Object) {
          clean(obj[key]);
        }
      }
    }
  };
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};

// 4. Custom Firewall / WAF (Blocks known directory traversal, SQLi, and command injection signatures)
const firewall = (req, res, next) => {
  const blacklist = [
    /\.\.\//, // Path traversal
    /union\s+select/i, // SQL injection
    /select\s+.*\s+from/i, // SQL injection
    /or\s+\d+\s*=\s*\d+/i, // SQL injection e.g. OR 1=1
    /concat\s*\(/i, // SQL injection function
    /<script/i, // Script tag
    /javascript:/i, // JS link prefix
    /onload\s*=/i, // Inline JS onload handler
    /onerror\s*=/i, // Inline JS onerror handler
    /cmd\.exe/i, // System execution
    /\/bin\/sh/i, // Unix shell exec
    /\/bin\/bash/i // Unix bash exec
  ];

  const inspect = (val) => {
    if (typeof val === 'string') {
      for (const regex of blacklist) {
        if (regex.test(val)) {
          return true;
        }
      }
    } else if (val instanceof Object) {
      for (const key in val) {
        if (inspect(val[key])) return true;
      }
    }
    return false;
  };

  if (inspect(req.query) || inspect(req.params) || inspect(req.body)) {
    return res.status(403).json({ message: 'Request blocked by security firewall' });
  }
  next();
};

// 5. VPN / IP Whitelisting for Admin Operations
const ipWhitelist = (req, res, next) => {
  const allowedIpsStr = process.env.ADMIN_ALLOWED_IPS;
  if (!allowedIpsStr) return next();

  const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim());
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const cleanIp = (ip) => {
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    if (ip === '::1') return '127.0.0.1';
    return ip;
  };

  const clientIpClean = cleanIp(clientIp);
  const isAllowed = allowedIps.some(allowedIp => {
    const allowedIpClean = cleanIp(allowedIp);
    return clientIpClean === allowedIpClean;
  });

  if (!isAllowed) {
    console.warn(`Blocked administrative access attempt from IP: ${clientIpClean}`);
    return res.status(403).json({ message: 'Access denied: Admin IP restriction enabled' });
  }
  next();
};

// 6. CSRF Origin & Referer checks (For state-modifying requests)
const csrfCheck = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
      : ['http://localhost:5173', 'http://localhost:3000'];

    if (origin) {
      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === cleanOrigin);
      if (!isAllowed && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'CSRF validation failed: Origin not allowed' });
      }
    } else if (referer) {
      const isAllowed = allowedOrigins.some(o => referer.startsWith(o));
      if (!isAllowed && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'CSRF validation failed: Referer not allowed' });
      }
    }
  }
  next();
};

// 7. XSS Input Sanitizer (Escapes normal tags, cleans script vectors from rich text variables)
const xssSanitize = (req, res, next) => {
  const richTextFields = ['content', 'description'];

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeRichText = (str) => {
    return str
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script elements
      .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"') // Strip js urls
      .replace(/on\w+\s*=\s*["']([\s\S]*?)["']/gi, ''); // Strip inline event handlers
  };

  const process = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (richTextFields.includes(key)) {
            obj[key] = sanitizeRichText(obj[key]);
          } else {
            obj[key] = escapeHtml(obj[key]);
          }
        } else if (obj[key] instanceof Object) {
          process(obj[key]);
        }
      }
    }
  };

  if (req.body) {
    process(req.body);
  }
  next();
};

module.exports = {
  authLimiter,
  contactLimiter,
  commentLimiter,
  mongoSanitize,
  firewall,
  ipWhitelist,
  csrfCheck,
  xssSanitize
};
