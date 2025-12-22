# Security Guidelines for Smart Complaint System

## 🔒 Environment Variables & Secrets

### ❌ NEVER commit these files to git:
- `.env` files containing real credentials
- Database connection strings with passwords
- API keys and secret tokens
- SSL certificates and private keys
- Production configuration files

### ✅ Instead, use these practices:

1. **Use Example Files:**
   - `.env.example` - Template with placeholder values
   - `.env.docker.example` - Docker environment template
   - Commit these templates, not the actual files

2. **Environment Variables to Secure:**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@host:port/db
   
   # Security Keys
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   
   # Email Credentials
   MAIL_USERNAME=your-email@domain.com
   MAIL_PASSWORD=your-app-password
   
   # API Keys
   STRIPE_SECRET_KEY=sk_live_...
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

3. **Setup Instructions:**
   ```bash
   # Copy example files
   cp .env.docker.example .env.docker
   cp backend/.env.example backend/.env
   
   # Edit with your actual values
   nano .env.docker
   nano backend/.env
   ```

## 🛡️ Additional Security Measures

### Production Checklist:
- [ ] Debug mode disabled (`FLASK_DEBUG=0`)
- [ ] Strong secret keys (32+ characters)
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### File Permissions:
```bash
# Secure environment files
chmod 600 .env*
chmod 600 backend/.env*
```

### Git Security:
```bash
# Check for accidentally committed secrets
git log --all --full-history -- .env
git log --all --full-history -- backend/.env

# Remove from history if found
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all
```

## 🚨 If Secrets Are Compromised:

1. **Immediately rotate all exposed credentials**
2. **Change database passwords**
3. **Generate new secret keys**
4. **Update production deployments**
5. **Monitor for unauthorized access**

## 📞 Security Contact

Report security vulnerabilities to: [security@yourcompany.com]

---
**Remember: Security is everyone's responsibility!**