# ClimaHealth - Android Kotlin App

Uma aplicação Android nativa desenvolvida em Kotlin que monitora condições climáticas e fornece alertas personalizados de saúde baseados no perfil do usuário.

## 📱 Características Principais

- **Dashboard Inteligente**: Visualização em tempo real de dados meteorológicos
- **Alertas de Saúde Personalizados**: Notificações baseadas em condições de saúde e clima
- **Perfil de Saúde Completo**: Gerenciamento de condições médicas, medicamentos e sensibilidades
- **Análise de Riscos**: Algoritmo inteligente que correlaciona dados climáticos com condições de saúde
- **Modo Família**: Gerenciamento de múltiplos perfis de dependentes
- **Histórico de Sintomas**: Registro e acompanhamento de sintomas relacionados ao clima
- **Relatórios Detalhados**: Análises diárias e semanais exportáveis
- **Dicas de Prevenção**: Conteúdo educativo personalizado

## 🏗️ Arquitetura

### Padrões Arquiteturais
- **MVVM (Model-View-ViewModel)**: Separação clara de responsabilidades
- **Repository Pattern**: Abstração de acesso a dados
- **Clean Architecture**: Separação em camadas bem definidas

### Tecnologias Android
- **Jetpack Compose**: UI moderna e declarativa
- **Navigation Component**: Navegação entre telas
- **DataStore**: Persistência moderna de dados
- **Retrofit + OkHttp**: Cliente HTTP para APIs
- **Room Database**: Banco de dados local (futuro)
- **WorkManager**: Trabalho em background
- **Play Services Location**: Serviços de localização
- **Material 3**: Design system moderno

## 📋 Requisitos

### SDK Android
- **Target SDK**: 36 (Android 15)
- **Minimum SDK**: 24 (Android 7.0)
- **Compile SDK**: 36

### APIs Externas
- **OpenWeatherMap API**: Dados meteorológicos
  - Clima atual
  - Índice UV
  - Qualidade do ar

## ⚙️ Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/danieldasilvasts2-cpu/ClimaSaudeTCC.git
cd ClimaSaudeTCC
```

### 2. Configurar API Key
1. Obtenha uma chave gratuita da API do OpenWeatherMap em [openweathermap.org](https://openweathermap.org/api)
2. Edite o arquivo `gradle.properties`:
```properties
OPENWEATHER_API_KEY=sua_chave_api_aqui
```

### 3. Configurar Android Studio
1. Abra o projeto no Android Studio
2. Sincronize o projeto (Sync Project with Gradle Files)
3. Execute o build para verificar dependências

### 4. Executar o App
```bash
./gradlew assembleDebug
# ou use o Android Studio para executar
```

## 📁 Estrutura do Projeto

```
app/src/main/kotlin/com/climasaude/
├── data/                           # Camada de dados
│   ├── model/                      # Modelos de dados (Health, Weather, etc.)
│   ├── repository/                 # Repositórios (UserPreferences, Weather)
│   ├── remote/                     # Serviços de API (Retrofit)
│   └── local/                      # Armazenamento local (DataStore)
├── ui/                            # Interface do usuário
│   ├── screens/                   # Telas da aplicação
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── profile/               # Perfil de saúde
│   │   ├── alerts/                # Alertas
│   │   ├── reports/               # Relatórios
│   │   ├── history/               # Histórico de sintomas
│   │   ├── family/                # Modo família
│   │   ├── tips/                  # Dicas de prevenção
│   │   └── education/             # Conteúdo educativo
│   ├── components/                # Componentes reutilizáveis
│   ├── theme/                     # Tema e cores
│   └── navigation/                # Navegação
├── service/                       # Serviços
│   ├── LocationService.kt         # Serviço de localização
│   └── WeatherUpdateService.kt    # Atualizações em background
├── utils/                         # Utilitários
│   └── HealthRiskAnalyzer.kt      # Análise de riscos de saúde
├── notification/                  # Sistema de notificações
├── MainActivity.kt                # Activity principal
└── ClimaHealthApplication.kt      # Application class
```

## 🔧 Funcionalidades Implementadas

### ✅ Completas
- **Estrutura base do projeto Android**
- **Dashboard com dados meteorológicos**
- **Integração com API OpenWeatherMap**
- **Sistema de navegação entre telas**
- **Análise de riscos de saúde**
- **Persistência de dados com DataStore**
- **Serviços de localização**
- **Arquitetura MVVM completa**

### 🚧 Em Desenvolvimento
- **Telas de perfil de saúde** (estrutura criada)
- **Sistema de alertas** (estrutura criada)
- **Relatórios e gráficos** (estrutura criada)
- **Histórico de sintomas** (estrutura criada)
- **Modo família** (estrutura criada)
- **Dicas de prevenção** (estrutura criada)
- **Conteúdo educativo** (estrutura criada)

## 🔒 Permissões

A aplicação requer as seguintes permissões:

```xml
<!-- Acesso à internet para APIs -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Localização para dados meteorológicos -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Notificações (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Trabalho em background -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## 📊 Dados de Saúde

### Modelos Principais
- **HealthProfile**: Perfil completo do usuário
- **FamilyMember**: Perfil de dependentes
- **HealthRisk**: Riscos identificados
- **SymptomEntry**: Registro de sintomas
- **WeatherData**: Dados meteorológicos

### Condições Suportadas
- Asma
- Doença Cardíaca
- Diabetes
- Hipertensão
- Artrite
- DPOC (Doença Pulmonar Obstrutiva Crônica)
- Alergias Respiratórias
- Enxaqueca
- Problemas de Pele

## 🔬 Algoritmo de Análise de Riscos

O sistema analiza múltiplos fatores climáticos:

### Fatores Analisados
- **Temperatura**: Extremos de calor/frio
- **Umidade**: Níveis altos/baixos
- **Índice UV**: Exposição solar
- **Qualidade do Ar**: Poluição atmosférica
- **Condições Meteorológicas**: Chuva, neblina, etc.

### Níveis de Risco
- **Baixo**: Condições favoráveis
- **Médio**: Atenção recomendada
- **Alto**: Precauções necessárias

## 🧪 Testes

```bash
# Testes unitários
./gradlew test

# Testes instrumentados
./gradlew connectedAndroidTest

# Verificação de lint
./gradlew lint
```

## 📈 Roadmap

### Próximas Funcionalidades
1. **Interface completa de perfil de saúde**
2. **Sistema de notificações push**
3. **Gráficos e relatórios visuais**
4. **Integração com wearables**
5. **Compartilhamento com profissionais de saúde**
6. **Machine Learning para predições**

### Melhorias Técnicas
1. **Implementação de Room Database**
2. **Testes automatizados completos**
3. **CI/CD pipeline**
4. **Análise estática de código**
5. **Documentação da API**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvedor**: Daniel da Silva
- **Orientação**: [Nome do Orientador]
- **Instituição**: [Nome da Instituição]

## 📞 Contato

- **Email**: [email]
- **LinkedIn**: [perfil]
- **GitHub**: [@danieldasilvasts2-cpu](https://github.com/danieldasilvasts2-cpu)

---

## 🏥 Aviso Médico

**IMPORTANTE**: Esta aplicação é uma ferramenta de apoio e não substitui consultas médicas profissionais. Sempre consulte um médico para questões de saúde sérias.