# 🚀 Guida alla Build dell'App Android - Corralejo 2026

Questa guida spiega come compilare l'APK Android per l'app di allenamento mezza maratona.

---

## 📋 Prerequisiti

### Sistema
- **Node.js** >= 18.x
- **npm** o **yarn**
- **Java JDK** 17 (per build Android native)
- **Android SDK** con API level 34+
- **EAS CLI** di Expo

### Account necessari
1. **Expo Account**: https://expo.dev/signup
2. **Render.com Account** (per il backend): https://render.com
3. **MongoDB Atlas** (database gratuito): https://mongodb.com/cloud/atlas
4. **Google Gemini API Key** (gratuito): https://aistudio.google.com
5. **Strava API** (opzionale, per sync attività): https://www.strava.com/settings/api

---

## 🔧 Setup Iniziale

### 1. Installare EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login su Expo
```bash
eas login
```

### 3. Configurare il progetto
```bash
cd frontend
eas init
# Seleziona l'ID progetto: a48df678-6b21-4c17-9033-76216bd17940
```

### 4. Installare dipendenze frontend
```bash
cd frontend
npm install
```

### 5. Installare dipendenze backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
```

---

## ⚙️ Configurazione Variabili d'Ambiente

### Backend (.env in cartella backend/)
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/corralejo?retryWrites=true&w=majority
DB_NAME=corralejo
GEMINI_API_KEY=AIzaSy...  # Dalla console Google AI Studio
STRAVA_CLIENT_ID=12345  # Opzionale
STRAVA_CLIENT_SECRET=abcdef...  # Opzionale
```

### Frontend (app.json - già configurato)
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_BACKEND_URL": "https://corralejo-backend.onrender.com"
    }
  }
}
```

---

## 🛠️ Sviluppo in Locale

### Avviare il Backend
```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate su Windows
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Il backend sarà disponibile su: `http://localhost:8000`

API Docs (Swagger): `http://localhost:8000/docs`

### Seed del Database (prima esecuzione)
```bash
curl -X POST http://localhost:8000/api/seed
```

### Avviare il Frontend
```bash
cd frontend
npx expo start
```

Opzioni:
- **Android Emulator**: Premi `a` nel terminal
- **Dispositivo fisico**: Scansiona il QR code con l'app Expo Go
- **Build nativa Android**: `npx expo run:android`

---

## 📦 Build APK per Android

### Metodo 1: Build Cloud con EAS (Consigliato)
```bash
cd frontend

# Build APK per testing interno
eas build --platform android --profile preview

# Build AAB per Google Play Store
eas build --platform android --profile production
```

Il download dell'APK sarà disponibile nella dashboard Expo:
https://expo.dev/accounts/kikkoderiso/projects/corralejo-2026/builds

### Metodo 2: Build Locale (richiede Android SDK)
```bash
cd frontend
npx expo run:android --variant release
```

L'APK sarà generato in:
`frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 🌐 Deploy Backend su Render.com

### Opzione A: Blueprint (render.yaml)
1. Vai su https://render.com/new/blueprint
2. Collega il repository GitHub
3. Render leggerà automaticamente `render.yaml`

### Opzione B: Manuale
1. Crea nuovo **Web Service** su Render
2. Connetti il repository GitHub
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
   - **Region**: Frankfurt (EU)
4. Aggiungi le variabili d'ambiente dalla sezione **Environment**

URL del backend: `https://corralejo-backend.onrender.com`

> ⚠️ Il piano Free di Render va in sleep dopo 15 minuti di inattività. La prima richiesta può richiedere ~50 secondi.

---

## 🗄️ Setup MongoDB Atlas

1. Crea un cluster gratuito (M0) su https://cloud.mongodb.com
2. Crea un utente database con permessi di lettura/scrittura
3. Whitelista l'IP `0.0.0.0/0` (per Render) o l'IP specifico
4. Ottieni la connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/corralejo?retryWrites=true&w=majority
   ```
5. Inseriscila in `MONGO_URL` nelle variabili d'ambiente del backend

---

## 🔑 Google Gemini API Key

1. Vai su https://aistudio.google.com/app/apikey
2. Crea una nuova API key (gratuita, 60 richieste/minuto)
3. Copia la key in `GEMINI_API_KEY` nel backend

---

## 🔗 Integrazione Strava (Opzionale)

1. Registra l'app su https://www.strava.com/settings/apps
2. Configura:
   - **Application Name**: Corralejo 2026
   - **Category**: Fitness
   - **Website**: https://corralejo.app
   - **Authorization Callback Domain**: corralejo://strava-callback
3. Copia `Client ID` e `Client Secret` nelle variabili d'ambiente

---

## 🧪 Testing

### Test API Backend
```bash
# Health check
curl https://corralejo-backend.onrender.com/api/health

# Dashboard
curl https://corralejo-backend.onrender.com/api/dashboard

# VDOT paces
curl https://corralejo-backend.onrender.com/api/vdot/paces
```

### Test App Mobile
1. Installa l'APK su dispositivo Android
2. Verifica connessione al backend
3. Testa flusso OAuth Strava (se configurato)
4. Verifica analisi AI delle corse

---

## 🔄 Aggiornamenti OTA (Over-The-Air)

Per aggiornamenti minori del frontend senza rebuild APK:

```bash
cd frontend
eas update --branch preview --message "Fix dashboard stats"
```

Gli utenti riceveranno l'aggiornamento al prossimo avvio dell'app.

---

## 🐛 Troubleshooting

### Build EAS fallisce
```bash
# Pulisci cache
eas build --platform android --profile preview --clear-cache

# Controlla i log
eas build:view <BUILD_ID>
```

### Backend non risponde
```bash
# Controlla i log su Render
# Vai su Render Dashboard > corralejo-backend > Events

# Test locale
curl http://localhost:8000/api/health
```

### MongoDB connection error
- Verifica che l'IP sia whitelisted su Atlas
- Controlla username/password nella connection string
- Assicurati che il nome database sia corretto

### Strava OAuth non funziona
- Verifica che il deep link `corralejo://` sia configurato in app.json
- Controlla che il callback domain su Strava sia corretto
- Assicurati che le scope siano `read,activity:read_all`

---

## 📱 Struttura APK Finale

```
corralejo-2026.apk
├── Package: com.kikkoderiso.corralejo
├── Version: 1.0.0
├── Min SDK: 24 (Android 7.0)
├── Target SDK: 34 (Android 14)
├── Permissions:
│   ├── INTERNET
│   ├── ACCESS_NETWORK_STATE
│   └── POST_NOTIFICATIONS (Android 13+)
└── Features:
    ├── 5 Tab Navigation
    ├── Dark Theme
    ├── Strava OAuth
    ├── AI Analysis
    └── Offline Caching
```

---

## 🎯 Prossimi Passi

1. [ ] Testare build APK su dispositivo fisico
2. [ ] Configurare notifiche push (expo-notifications)
3. [ ] Implementare deep linking completo per Strava
4. [ ] Aggiungere schermate mancanti (piano.tsx, statistiche.tsx)
5. [ ] Configurare Firebase per analytics (opzionale)

---

*Ultimo aggiornamento: Marzo 2026*  
*Per supporto: https://github.com/daniele9233/CORRALEJO-2026/issues*
