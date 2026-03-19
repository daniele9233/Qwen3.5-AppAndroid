@echo off
REM Script per push su GitHub - Qwen3.5 Corralejo App
REM Esegui questo file dalla cartella del progetto

echo 🚀 Inizio push su GitHub...

REM Inizializza git se necessario
git init

REM Aggiungi tutti i file (esclusi quelli in .gitignore)
git add .

REM Crea commit
git commit -m "feat: struttura completa app Android Corralejo 2026

- frontend Expo/React Native con 5 tab navigation
- backend FastAPI con MongoDB Atlas + Google Gemini AI
- config EAS build per APK Android (project ID: d5afcbbe-64eb-449a-92bd-546ea0c65e86)
- documentazione completa README.md
- .env con credenziali MongoDB QWEN35 e Gemini API Key
- TypeScript completo per type-safety
- Dark theme con colori lime (#bef264)
- VDOT calculations (Jack Daniels)
- 38-week training plan con periodizzazione scientifica
- Strava OAuth integration ready
- Injury Risk Score analysis

🎯 Obiettivo: Mezza Maratona Corralejo 2026 in 1:35:00 (4:30/km)"

REM Imposta branch main
git branch -M main

REM Aggiungi remote (se non esiste già)
git remote set-url origin https://github.com/daniele9233/Qwen3.5-AppAndroid.git 2>nul || git remote add origin https://github.com/daniele9233/Qwen3.5-AppAndroid.git

REM Push su GitHub
echo 📤 Push in corso...
git push -u origin main --force

echo ✅ Push completato!
echo 📱 Repository: https://github.com/daniele9233/Qwen3.5-AppAndroid
pause
