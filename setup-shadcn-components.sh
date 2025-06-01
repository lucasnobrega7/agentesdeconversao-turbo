#!/bin/bash

# Setup shadcn/ui components needed by v0.dev components

cd apps/web

# Initialize shadcn/ui if not already done
npx shadcn@latest init -y

# Install essential components that v0.dev components depend on
npx shadcn@latest add button -y
npx shadcn@latest add card -y
npx shadcn@latest add dropdown-menu -y
npx shadcn@latest add badge -y
npx shadcn@latest add tabs -y
npx shadcn@latest add dialog -y
npx shadcn@latest add input -y
npx shadcn@latest add label -y
npx shadcn@latest add textarea -y
npx shadcn@latest add select -y
npx shadcn@latest add scroll-area -y
npx shadcn@latest add separator -y
npx shadcn@latest add avatar -y
npx shadcn@latest add tooltip -y
npx shadcn@latest add toast -y
npx shadcn@latest add form -y
npx shadcn@latest add alert -y
npx shadcn@latest add skeleton -y
npx shadcn@latest add popover -y
npx shadcn@latest add command -y
npx shadcn@latest add sheet -y
npx shadcn@latest add switch -y

echo "✅ shadcn/ui components installed!"