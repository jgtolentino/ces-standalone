# 🔐 Azure Credentials Setup Guide

## Quick Reference: Where to Find Your Credentials

### 🗄️ **1. PostgreSQL Database Credentials**

**Location:** Azure Portal → PostgreSQL servers → [Your Server] → Connection strings

**What you need:**
- Server name: `yourserver.postgres.database.azure.com`
- Database name: `ces_production` (or your database name)
- Username: Usually `username@servername`
- Password: Your database password

**Format:**
```bash
CES_AZURE_POSTGRES_URL=postgresql://username:password@servername.postgres.database.azure.com:5432/ces_production?sslmode=require
```

**Example:**
```bash
CES_AZURE_POSTGRES_URL=postgresql://cesadmin:MySecurePass123@ces-db.postgres.database.azure.com:5432/ces_production?sslmode=require
```

---

### 🤖 **2. Azure OpenAI Credentials**

**Location:** Azure Portal → Azure OpenAI → [Your Resource] → Keys and Endpoint

**What you need:**
- API Key (Key 1 or Key 2)
- Endpoint URL
- Deployment name (the model you deployed)

**Format:**
```bash
AZURE_OPENAI_API_KEY=1234567890abcdef1234567890abcdef
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

---

### 🔑 **3. Azure Active Directory (AAD) Credentials**

**Location:** Azure Portal → Azure Active Directory → App registrations

**Steps:**
1. Go to **App registrations**
2. Select your app OR click **"New registration"** to create one
3. From **Overview** tab, copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**
4. Go to **Certificates & secrets** tab
5. Click **"New client secret"**
6. Copy the **Value** (not the Secret ID)

**Format:**
```bash
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789012
AZURE_CLIENT_ID=87654321-4321-4321-4321-210987654321
AZURE_CLIENT_SECRET=your~secret~value~here
```

---

## 🛠️ **Setup Steps**

### **Step 1: Edit Environment File**
```bash
cd /Users/tbwa/Documents/GitHub/ai-agency/tenants/ces
nano .env.local  # or use your preferred editor
```

### **Step 2: Replace Placeholder Values**
Open `.env.local` and replace:
- `USERNAME:PASSWORD@SERVERNAME` with your PostgreSQL credentials
- `your_azure_openai_api_key_here` with your actual API key
- `your-resource-name` with your OpenAI resource name
- Other placeholder values as needed

### **Step 3: Generate NextAuth Secret**
```bash
# Generate a random 32-character string
openssl rand -base64 32
```

### **Step 4: Test Connection**
```bash
cd /Users/tbwa/Documents/GitHub/ai-agency/tenants/ces
npm run dev
```

---

## 🚨 **Security Best Practices**

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Use different credentials** for development vs production
3. **Rotate secrets regularly** in Azure Portal
4. **Use least privilege** - only grant necessary permissions
5. **Monitor usage** in Azure Portal → Cost Management

---

## 🔍 **Troubleshooting**

### PostgreSQL Connection Issues:
- Check firewall rules in Azure Portal
- Verify SSL mode is set to `require`
- Ensure database `ces_production` exists

### OpenAI API Issues:
- Verify deployment name matches your model deployment
- Check quota limits in Azure Portal
- Ensure endpoint URL ends with `/`

### Authentication Issues:
- Verify App Registration has necessary permissions
- Check client secret hasn't expired
- Ensure redirect URIs are configured

---

## 📞 **Need Help?**

1. **Azure Documentation**: [docs.microsoft.com/azure](https://docs.microsoft.com/azure)
2. **PostgreSQL Connection**: [docs.microsoft.com/azure/postgresql](https://docs.microsoft.com/azure/postgresql)
3. **OpenAI Service**: [docs.microsoft.com/azure/cognitive-services/openai](https://docs.microsoft.com/azure/cognitive-services/openai)

---

**File Location:** `/Users/tbwa/Documents/GitHub/ai-agency/tenants/ces/.env.local`