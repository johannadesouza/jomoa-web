# Production Readiness Checklist

## Backend (Supabase)

### ✅ Databas & Schema
- [x] Alla tabeller skapade
- [x] Foreign keys konfigurerade
- [x] Indexes för performance
- [ ] **RLS (Row Level Security) policies för alla tabeller**
- [ ] **Triggers fungerar korrekt**
- [ ] **Seed data för onboarding_tasks**
- [ ] **Seed data för tips_library**

### 🔐 Säkerhet
- [ ] RLS aktiverat på alla tabeller
- [ ] Policies för coaches (kan bara se sina klienter)
- [ ] Policies för clients (kan bara se sin egen data)
- [ ] Service role key skyddad (endast backend)
- [ ] API routes skyddade

### 🔄 Triggers & Functions
- [x] Notification trigger för workout session log
- [ ] **Notification trigger för readiness missing (scheduled function)**
- [ ] **Notification trigger för coach comments (om implementerat)**

### 📊 Seed Data
- [ ] Onboarding tasks (coach + client)
- [ ] Tips library (alla faser)
- [ ] Global exercises (om det behövs)

## Frontend

### ✅ Core Features
- [x] Authentication (login/logout)
- [x] Role-based routing (coach/client)
- [x] Client dashboard
- [x] Coach dashboard
- [x] Program creation (stepper)
- [x] Calendar view
- [x] Notifications system
- [x] Onboarding checklist
- [x] Tips library
- [x] Readiness logging

### 🎨 UX Polish
- [ ] Error handling på alla sidor
- [ ] Loading states konsekvent
- [ ] Empty states konsekvent
- [ ] Success feedback (toasts)
- [ ] Form validation
- [ ] Mobile responsiveness testad

### 🔧 Configuration
- [ ] Environment variables dokumenterade (.env.example)
- [ ] Build fungerar utan fel
- [ ] TypeScript errors fixade
- [ ] Linter errors fixade

## Deployment

### 📦 Setup
- [ ] Supabase project konfigurerat
- [ ] Environment variables satta (Vercel/Netlify)
- [ ] Database migrations körda
- [ ] Seed data körda
- [ ] RLS policies verifierade

### 🧪 Testing
- [ ] Testa coach flow (skapa klient, program, etc.)
- [ ] Testa client flow (logga readiness, pass, etc.)
- [ ] Testa notifications
- [ ] Testa onboarding
- [ ] Testa tips library

## Dokumentation

### 📚 README
- [ ] Setup instruktioner
- [ ] Environment variables
- [ ] Database setup
- [ ] Deployment guide

### 🔍 API Documentation
- [ ] Supabase tables dokumenterade
- [ ] RLS policies dokumenterade
- [ ] Triggers dokumenterade

