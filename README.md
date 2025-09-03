# ClimaHealth - Aplicativo de Saúde e Clima

## 📱 Versão Android (Atual)

Este projeto foi **convertido de Next.js/React para Android nativo** usando Kotlin e Jetpack Compose, mantendo todas as funcionalidades originais.

### Características Principais
- **Target SDK**: 36 (Android 15)
- **Minimum SDK**: 24 (Android 7.0)
- **Linguagem**: Kotlin
- **UI Framework**: Jetpack Compose
- **Arquitetura**: MVVM + Repository Pattern

### Como Executar
1. Abra o projeto no Android Studio
2. Configure sua API key do OpenWeatherMap no `gradle.properties`
3. Execute o app no emulador ou dispositivo

📖 **Documentação completa**: Veja [README_ANDROID.md](./README_ANDROID.md) para instruções detalhadas.

---

## 🌐 Versão Web (Legada)

A versão original em Next.js ainda está disponível nos arquivos `src/` para referência.

### Para executar a versão web legada:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔄 Conversão Realizada

### De Next.js/React para Android Kotlin:
- ✅ **UI Components**: React → Jetpack Compose
- ✅ **State Management**: React Hooks → ViewModels + StateFlow
- ✅ **Navigation**: Next.js Router → Navigation Component
- ✅ **Data Storage**: localStorage → DataStore
- ✅ **API Calls**: fetch → Retrofit + OkHttp
- ✅ **Location**: Browser Geolocation → Android Location Services
- ✅ **Notifications**: Web Push → Android Notifications
- ✅ **Build System**: webpack → Gradle + Kotlin DSL

### Funcionalidades Mantidas:
- Dashboard com dados meteorológicos em tempo real
- Análise de riscos de saúde personalizados
- Sistema de alertas baseado em condições climáticas
- Perfil de saúde completo com condições médicas
- Modo família para gerenciar dependentes
- Histórico de sintomas e relatórios
- Dicas de prevenção personalizadas
- Conteúdo educativo sobre saúde e clima

## 📊 Status do Projeto

- **Android App**: ✅ Estrutura completa, dashboard funcional
- **Telas Restantes**: 🚧 Em desenvolvimento (estrutura criada)
- **Web App**: 📋 Arquivado para referência

## 🏥 Sobre o ClimaHealth

O ClimaHealth é uma aplicação que monitora condições climáticas e fornece alertas de saúde personalizados baseados no perfil médico do usuário. Desenvolvido como projeto de TCC, combina dados meteorológicos com informações de saúde para prevenir complicações relacionadas ao clima.
