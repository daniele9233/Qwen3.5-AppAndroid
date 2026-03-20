# 🏃 Qwen3.5 Corralejo 2026

> App Android per l'allenamento alla **Mezza Maratona di Corralejo 2026**
> 🎯 Obiettivo: 1:35:00 (4:30/km) | 📅 Gara: 01/12/2026

App completa di allenamento generata con **React Native + Expo** (frontend) e **FastAPI + MongoDB + Gemini AI** (backend).

**Backend Live**: https://corralejo-backend-pubx.onrender.com

---

## ✨ Funzionalità Implementate

### 📱 Frontend (Expo/React Native) - 17 Schermate
- ✅ **Dark theme** con colori lime (#bef264) e design moderno
- ✅ **Navigation con 5 tab**: Dashboard, Corse, Piano, Statistiche, Profilo
- ✅ **Dashboard**: Countdown gara, sessione del giorno, bottone "SEGNA FATTO", progresso settimanale
- ✅ **Lista Corse**: Card con badge colorati per tipo sessione, stats, verdict confronto piano
- ✅ **Piano Allenamento**: Vista lista/calendario, 38 settimane, toggle completamento sessioni
- ✅ **Statistiche**: VO2Max gauge, previsioni gara VDOT, zone allenamento, best efforts
- ✅ **Profilo**: Dati atleta, connessione Strava (OAuth), medaglie, integratori, esercizi
- ✅ **Nuove Schermate**:
  - ➕ `add-run.tsx`: Aggiungi corsa manuale con calcolo automatico passo/durata
  - ➕ `add-test.tsx`: Aggiungi test (5km, 10km, 15km, 21.1km)
  - 🔍 `run-detail.tsx`: Dettaglio corsa con analisi AI Gemini (voto/10, consigli, punti forza/debolezza)
  - 📋 `workout-detail.tsx`: Dettaglio sessione allenamento con toggle completamento
  - 📈 `periodizzazione.tsx`: Grafico barre volume settimanale (38 settimane)
  - 📉 `progressi.tsx`: Storico VO2max, previsioni gara, passi VDOT, soglie anaerobiche
  - 🧮 `calcolatore.tsx`: Calcolatore VDOT, previsioni gara, convertitore passo/velocità
  - ⚠️ `injury-risk.tsx`: Injury Risk Score con gauge e raccomandazioni
  - 🔗 `strava-callback.tsx`: Gestione OAuth callback Strava
  - 🏅 `badges.tsx`: Sistema 100+ badge con 8 categorie e 6 livelli
- ✅ **TypeScript completo** per type-safety e autocompletamento

### ⚙️ Backend (FastAPI/Python)
- ✅ **Endpoint REST completi**: `/api/dashboard`, `/api/training-plan`, `/api/runs`, `/api/analytics`
- ✅ **Calcolo VDOT** con formule Jack Daniels per distanze 4-42km
- ✅ **Generazione piano 38 settimane** con 6 fasi di periodizzazione scientifica
- ✅ **Integrazione Google Gemini 1.5 Flash** per analisi AI delle prestazioni
- ✅ **OAuth Strava** con deep linking (`qwen35corralejo://auth/strava`)
- ✅ **Auto-adattamento piano** basato su modelli peer-reviewed (Impellizzeri, ACSM, Foster)
- ✅ **Injury Risk Score** con analisi predittiva carico di allenamento

### 🗄️ Database & AI
- ✅ **MongoDB Atlas** cluster QWEN35 (M0 free tier)
- ✅ **Google Gemini API** per analisi corse con fallback algoritmico
- ✅ **Seed automatico** per piano, profilo, integratori, esercizi

---

## 🚀 Setup Rapido

### Prerequisiti
- Node.js 18+ e npm
- Python 3.10+ e pip
- Java JDK 17 + Android SDK (solo per build locale)
- Account Expo: `npx expo login`

### 1. Clona il Repository
```bash
git clone https://github.com/daniele9233/Qwen3.5-AppAndroid.git
cd Qwen3.5-AppAndroid
```

### 2. Configura Variabili d'Ambiente
Il file `.env` è già configurato con le credenziali fornite:
```env
MONGO_URL=mongodb+srv://danielepascoliniphotography_db_user:***@qwen35.he7fief.mongodb.net/?appName=QWEN35
GEMINI_API_KEY=AIzaSyB8EZTgWsVOGGdjL4PLiSQVAyVVU6ufSzc
DB_NAME=corralejo2026
```

> 🔐 I file `.env` sono esclusi da `.gitignore` per sicurezza.

### 3. Installa Dipendenze Frontend
```bash
cd frontend
npm install
```

### 4. Installa Dipendenze Backend
```bash
cd ../backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Avvia in Sviluppo
```bash
# Terminale 1: Backend (porta 8000)
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Terminale 2: Frontend
cd ../frontend
npx expo start
```

Scansiona il QR code con l'app **Expo Go** sul tuo dispositivo Android.

---

## 📦 Build APK Android

### Opzione A: Cloud Build con EAS (Consigliato)
```bash
cd frontend

# Login Expo (se non fatto)
eas login

# Build APK per testing interno
eas build --platform android --profile preview

# Build AAB per Google Play Store
eas build --platform android --profile production
```

L'APK sarà scaricabile dalla [dashboard Expo](https://expo.dev/projects/d5afcbbe-64eb-449a-92bd-546ea0c65e86).

**Configurazione EAS**:
- Project ID: `d5afcbbe-64eb-449a-92bd-546ea0c65e86`
- Package Android: `com.qwen35.corralejo`
- Scheme: `qwen35corralejo://`

### Opzione B: Build Locale
```bash
cd frontend
npx expo run:android
```

Richiede Android SDK configurato e dispositivo/emulatore attivo.

---

## 🗄️ Database: MongoDB Atlas

### Cluster Configurato
- **Nome**: `QWEN35`
- **Tipo**: M0 Free Tier
- **Regione**: AWS EU (Frankfurt)
- **Connection String**: Già in `.env`

### Seed Iniziale Database
Con il backend in esecuzione su localhost:8000:
```bash
curl -X POST http://localhost:8000/api/seed
```

Popola automaticamente:
- ✅ Profilo atleta con VDOT 48.7 (target 4:30/km)
- ✅ Piano 38 settimane (23/03/2026 → 06/12/2026)
- ✅ Sessioni base per ogni fase di periodizzazione
- ✅ Lista integratori e protocollo esercizi

---

## 🤖 AI: Google Gemini

### Configurazione
- **Modello**: `gemini-1.5-flash`
- **API Key**: Già configurata in `.env`
- **Utilizzo**: Analisi corse con feedback da allenatore esperto

### Prompt Template per Analisi Corse
```
Sei un allenatore esperto di mezza maratona. Analizza questa corsa 
per un atleta che si prepara per Corralejo 2026 (obiettivo 1:35:00, 
passo 4:30/km)...
```

### Output Analisi
```json
{
  "sections": {
    "intro": "Analisi AI della tua corsa",
    "datiCorsa": "12.5 km a 5:08/km",
    "classificazione": "Prestazione valida",
    "utilitaObiettivo": "Dati utili per il monitoraggio progressi",
    "positivi": ["Costanza nel passo", "FC controllata"],
    "lacune": ["Monitorare recupero tra ripetute"],
    "realityCheck": "Con questa progressione, l'obiettivo 1:35:00 è realistico",
    "consigliTecnici": ["Mantieni cadenza 180 spm"],
    "voto": 8
  },
  "model": "gemini-1.5-flash"
}
```

---

## 🔗 Strava Integration (Opzionale)

### Configurazione OAuth
1. Registra app su [developer.strava.com](https://developer.strava.com)
2. Imposta `Redirect URI`: `qwen35corralejo://auth/strava`
3. Aggiungi a `.env`:
   ```env
   STRAVA_CLIENT_ID=tuo_client_id
   STRAVA_CLIENT_SECRET=tuo_client_secret
   ```

### Flusso di Connessione
1. Profilo → "Connetti Strava"
2. Autorizzazione OAuth nel browser
3. Deep link ritorno all'app: `qwen35corralejo://auth/strava?code=XXX`
4. Scambio codice per access token
5. Sync automatico attività

### Attività Sincronizzate
- ✅ Corsa: distanza, durata, passo, FC media/max, cadenza, dislivello
- ✅ Confronto con sessione pianificata (verdetto: perfetto/ok/lento/veloce)
- ✅ Trigger ricalcolo VDOT se nuovo PB
- ✅ Auto-completamento sessioni corrispondenti

---

## 📋 Struttura Progetto

```
Qwen3.5-AppAndroid/
├── README.md                 # Questa documentazione
├── BUILD_GUIDE.md            # Guida completa al deploy
├── .gitignore                # Esclude .env, node_modules, build outputs
├── .env                      # Variabili d'ambiente (NON committare!)
├── .env.example              # Template per nuove configurazioni
├── render.yaml               # Deploy automatico su Render.com
├── push-to-github.bat        # Script Windows per push
├── push-to-github.sh         # Script Unix per push
│
├── frontend/                 # React Native + Expo (Android App)
│   ├── app.json              # Config Expo (project ID, package, scheme)
│   ├── eas.json              # Config EAS Build (preview/production profiles)
│   ├── package.json          # Dipendenze npm (Expo 54, React Native 0.81.5)
│   ├── tsconfig.json         # TypeScript config con path aliases
│   ├── src/
│   │   ├── api.ts            # Client API axios con tutti gli endpoint
│   │   └── theme.ts          # Tema dark: colori, spacing, font, session types
│   └── app/
│       ├── _layout.tsx       # Root layout + Stack Navigator + StatusBar
│       ├── add-run.tsx       # Aggiungi corsa manuale
│       ├── add-test.tsx      # Aggiungi test
│       ├── run-detail.tsx    # Dettaglio corsa con analisi AI
│       ├── workout-detail.tsx # Dettaglio sessione
│       ├── periodizzazione.tsx # Grafico periodizzazione
│       ├── progressi.tsx     # Storico VO2max e progressi
│       ├── calcolatore.tsx   # Calcolatore VDOT e previsioni
│       ├── injury-risk.tsx   # Injury Risk Score
│       ├── strava-callback.tsx # OAuth callback Strava
│       ├── badges.tsx        # Sistema badge e trofei
│       └── (tabs)/
│           ├── _layout.tsx   # Bottom tabs: Dashboard|Corse|Piano|Stats|Profilo
│           ├── index.tsx     # Dashboard: countdown, sessione oggi, progressi
│           ├── corse.tsx     # Lista attività con stats e FAB aggiungi
│           ├── piano.tsx     # Piano 38 settimane: vista lista/calendario
│           ├── statistiche.tsx # Analytics: VO2Max, previsioni, zone, best efforts
│           └── profilo.tsx   # Profilo atleta + Strava + medaglie + integratori
│
└── backend/                  # FastAPI + Python (REST API Server)
    ├── server.py             # Server completo con tutti gli endpoint API
    ├── requirements.txt      # Dipendenze Python (FastAPI, Motor, Gemini)
    └── install-and-run.bat   # Script Windows per avviare il backend
```

---

## 🛠️ Endpoint API Principali

### Dashboard & Piano
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dati dashboard: profilo, settimana, countdown, progressi |
| GET | `/api/training-plan` | Piano completo 38 settimane con fasi e sessioni |
| GET | `/api/training-plan/current` | Settimana corrente |
| GET | `/api/training-plan/week/{week_id}` | Dettaglio settimana specifica |
| PATCH | `/api/training-plan/session/complete` | Toggle completamento sessione |
| POST | `/api/training-plan/adapt` | Auto-adatta piano basato su carico recente |
| GET | `/api/training-plan/adaptation-status` | Metriche scientifiche adattamento |

### Corse & Analytics
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/runs` | Lista corse (ordinamento data decrescente) |
| GET | `/api/runs/{run_id}` | Dettaglio corsa con analisi AI |
| POST | `/api/runs` | Crea nuova corsa manuale |
| GET | `/api/analytics` | Stats complete: VO2Max, previsioni, best efforts |
| GET | `/api/vdot/paces` | VDOT corrente + 5 zone allenamento Daniels |
| GET | `/api/injury-risk` | Injury Risk Score con raccomandazioni |
| GET | `/api/vo2max-history` | Storico andamento VDOT |
| GET | `/api/badges` | Lista badge e trofei |

### AI & Strava
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/ai/analyze-run` | Analisi AI corsa con Google Gemini |
| GET | `/api/strava/auth-url` | URL autorizzazione OAuth Strava |
| POST | `/api/strava/exchange-code` | Scambio codice per access token |
| POST | `/api/strava/sync` | Sync attività + auto-adatta piano + ricalcola VDOT |

### Utilità
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/health` | Health check: status DB, Gemini, versione |
| POST | `/api/seed` | Popola DB con dati iniziali (sviluppo) |
| GET | `/api/profile` | Profilo atleta |
| PATCH | `/api/profile` | Aggiorna campi profilo |
| GET | `/api/supplements` | Lista integratori |
| GET | `/api/exercises` | Protocollo esercizi rinforzo |

---

## 🧪 Testing & Debug

### Test API Backend
```bash
# Health check
curl http://localhost:8000/api/health

# Dashboard data
curl http://localhost:8000/api/dashboard

# VDOT paces
curl http://localhost:8000/api/vdot/paces

# Seed database (prima esecuzione)
curl -X POST http://localhost:8000/api/seed
```

### Test App Mobile
1. Installa APK su dispositivo Android
2. Verifica connessione backend: Dashboard → dati caricati
3. Testa flusso Strava: Profilo → Connetti → OAuth → Sync
4. Verifica analisi AI: Corse → Dettaglio → Analisi Gemini

### Log Backend
```bash
# Avvia con logging dettagliato
cd backend
uvicorn server:app --reload --log-level debug
```

---

## 🔄 Aggiornamenti OTA (Over-The-Air)

Per aggiornamenti minori del frontend senza rebuild APK:

```bash
cd frontend

# Publish update su canale preview
eas update --branch preview --message "Fix dashboard stats display"

# Publish update su canale production
eas update --branch production --message "Nuova feature injury risk"
```

Gli utenti riceveranno l'aggiornamento al prossimo avvio dell'app.

---

## ✅ Stato del Progetto

### Componenti Implementati

| Componente | Stato | URL/Note |
|---|---|---|
| **Backend API** | ✅ Live | https://corralejo-backend-pubx.onrender.com |
| **MongoDB Atlas** | ✅ Connesso | Database: corralejo2026 |
| **Google Gemini AI** | ✅ Attiva | Modello: gemini-1.5-flash |
| **Frontend Code** | ✅ Completo | 17 schermate implementate |
| **TypeScript** | ✅ Configurato | Type-safety completa |
| **Expo Router** | ✅ Navigazione | File-based routing |
| **EAS Build** | ✅ Pronto | Profile preview/production |

### Schermate Frontend (17 totale)

#### Tab Principali (5)
- ✅ Dashboard (`app/(tabs)/index.tsx`)
- ✅ Corse (`app/(tabs)/corse.tsx`)
- ✅ Piano (`app/(tabs)/piano.tsx`)
- ✅ Statistiche (`app/(tabs)/statistiche.tsx`)
- ✅ Profilo (`app/(tabs)/profilo.tsx`)

#### Schermate Secondarie (12)
- ✅ Aggiungi Corsa (`app/add-run.tsx`)
- ✅ Aggiungi Test (`app/add-test.tsx`)
- ✅ Dettaglio Corsa (`app/run-detail.tsx`)
- ✅ Dettaglio Sessione (`app/workout-detail.tsx`)
- ✅ Periodizzazione (`app/periodizzazione.tsx`)
- ✅ Progressi (`app/progressi.tsx`)
- ✅ Calcolatore (`app/calcolatore.tsx`)
- ✅ Injury Risk (`app/injury-risk.tsx`)
- ✅ Strava Callback (`app/strava-callback.tsx`)
- ✅ Badge (`app/badges.tsx`)

### Prossimi Passi

1. **Build APK**: `cd frontend && npx eas build --platform android --profile preview`
2. **Test su dispositivo**: Installa APK e verifica tutte le funzionalità
3. **Deploy Play Store**: `npx eas build --platform android --profile production`
4. **Aggiornamenti OTA**: `eas update --branch production`

---

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `eas build` fallisce | Controlla login: `eas login`, verifica `eas.json` project ID |
| Backend non si connette a MongoDB | Verifica IP whitelist su Atlas, stringa in `.env` corretta |
| Gemini API error 403 | Controlla key attiva su [aistudio.google.com](https://aistudio.google.com) |
| Expo Go non scansiona QR | Usa `npx expo start --tunnel` se dietro NAT/firewall |
| Build Android lenta | Usa EAS cloud build invece di locale |
| Strava OAuth non funziona | Verifica redirect URI: `qwen35corralejo://auth/strava` in app Strava |

---

## 📄 License

**MIT License** - Progetto personale per preparazione Mezza Maratona Corralejo 2026.

```
Copyright (c) 2026 daniele9233

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

> 🏃‍♂️ *Forza e costanza. Ogni km conta.* 💚  
> 📅 *Corralejo 2026: Ci vediamo al traguardo!*

---

*Ultimo aggiornamento: Marzo 2026*  
*Repository: https://github.com/daniele9233/Qwen3.5-AppAndroid*
