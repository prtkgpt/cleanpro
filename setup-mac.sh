#!/bin/bash
# CleanPro CRM - Automated Setup Script for macOS
# Run this with: bash setup-mac.sh

set -e  # Exit on any error

echo "🚀 CleanPro CRM Setup Starting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the cleanpro directory?${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Run: brew install node@20"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Run: brew install postgresql@14 && brew services start postgresql@14"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL $(psql --version | awk '{print $3}') detected${NC}"

echo ""
echo -e "${YELLOW}📦 Step 2: Installing npm dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}🗄️  Step 3: Setting up database...${NC}"

# Check if database exists, create if not
if psql -lqt | cut -d \| -f 1 | grep -qw cleanpro; then
    echo "Database 'cleanpro' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb cleanpro
        createdb cleanpro
        echo -e "${GREEN}✓ Database recreated${NC}"
    fi
else
    createdb cleanpro
    echo -e "${GREEN}✓ Database created${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  Step 4: Creating .env file...${NC}"

cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://localhost:5432/cleanpro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="PigXXti/9G8NsujKW1uy54eOosxfob1Ew5wcEZvVs1g="

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF

echo -e "${GREEN}✓ .env file created${NC}"

echo ""
echo -e "${YELLOW}🔧 Step 5: Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

echo ""
echo -e "${YELLOW}📊 Step 6: Creating database schema...${NC}"
npx prisma db push --skip-generate
echo -e "${GREEN}✓ Database schema created${NC}"

echo ""
echo -e "${YELLOW}🌱 Step 7: Seeding database...${NC}"

# Try npm seed first, fallback to SQL file
if npm run db:seed 2>/dev/null; then
    echo -e "${GREEN}✓ Database seeded via npm${NC}"
else
    echo "npm seed failed, trying SQL file..."
    if [ -f "setup-data.sql" ]; then
        psql -d cleanpro < setup-data.sql > /dev/null
        echo -e "${GREEN}✓ Database seeded via SQL${NC}"
    else
        echo -e "${RED}❌ Seed failed and setup-data.sql not found${NC}"
        exit 1
    fi
fi

# Verify data
echo ""
echo -e "${YELLOW}🔍 Verifying setup...${NC}"
DATA_CHECK=$(psql -d cleanpro -t -c "SELECT COUNT(*) FROM \"User\" WHERE role = 'ADMIN';")
if [ "$DATA_CHECK" -ge 1 ]; then
    echo -e "${GREEN}✓ Admin user created${NC}"
else
    echo -e "${RED}❌ Admin user not found. Setup may have failed.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 CleanPro CRM is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Login with:"
echo "  Email:    admin@cleansweep.com"
echo "  Password: password123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
