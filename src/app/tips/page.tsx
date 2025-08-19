"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  getWeatherData, 
  getCurrentLocation, 
  getHealthProfile,
  type HealthProfile 
} from '@/lib/utils';
import Link from 'next/link';

interface PreventionTip {
  id: string;
  title: string;
  description: string;
  category: 'temperature' | 'humidity' | 'uv' | 'airQuality' | 'general';
  conditions: string[];
  severity: 'low' | 'medium' | 'high';
  icon: string;
}

const preventionTips: PreventionTip[] = [
  // Temperature Tips
  {
    id: '1',
    title: 'Hidratação em Altas Temperaturas',
    description: 'Beba pelo menos 2-3 litros de água por dia quando a temperatura estiver acima de 30°C. Evite bebidas alcoólicas e com cafeína que podem causar desidratação.',
    category: 'temperature',
    conditions: ['Calor extremo', 'Desidratação'],
    severity: 'high',
    icon: '💧'
  },
  {
    id: '2',
    title: 'Roupas Adequadas para o Calor',
    description: 'Use roupas leves, de cores claras e tecidos respiráveis como algodão. Evite roupas escuras que absorvem mais calor.',
    category: 'temperature',
    conditions: ['Calor', 'Exposição solar'],
    severity: 'medium',
    icon: '👕'
  },
  {
    id: '3',
    title: 'Proteção contra o Frio',
    description: 'Vista-se em camadas para manter o calor corporal. Proteja extremidades como mãos, pés e cabeça. Pessoas com problemas respiratórios devem ter cuidado especial.',
    category: 'temperature',
    conditions: ['Frio', 'Asma', 'Problemas respiratórios'],
    severity: 'medium',
    icon: '🧥'
  },

  // UV Tips
  {
    id: '4',
    title: 'Protetor Solar Diário',
    description: 'Use protetor solar FPS 30 ou superior, mesmo em dias nublados. Reaplique a cada 2 horas ou após nadar/suar.',
    category: 'uv',
    conditions: ['Exposição solar', 'Pele sensível'],
    severity: 'high',
    icon: '🧴'
  },
  {
    id: '5',
    title: 'Evitar Horários de Pico Solar',
    description: 'Evite exposição direta ao sol entre 10h e 16h, quando os raios UV são mais intensos. Procure sombra sempre que possível.',
    category: 'uv',
    conditions: ['Índice UV alto', 'Pele sensível'],
    severity: 'high',
    icon: '🌞'
  },
  {
    id: '6',
    title: 'Acessórios de Proteção',
    description: 'Use chapéu de abas largas, óculos de sol com proteção UV e roupas com proteção solar para atividades ao ar livre.',
    category: 'uv',
    conditions: ['Atividades externas', 'Exposição prolongada'],
    severity: 'medium',
    icon: '🕶️'
  },

  // Air Quality Tips
  {
    id: '7',
    title: 'Máscara em Dias de Poluição',
    description: 'Use máscara N95 ou PFF2 quando a qualidade do ar estiver ruim, especialmente se você tem problemas respiratórios.',
    category: 'airQuality',
    conditions: ['Asma', 'Bronquite', 'Problemas respiratórios'],
    severity: 'high',
    icon: '😷'
  },
  {
    id: '8',
    title: 'Exercícios em Ambientes Fechados',
    description: 'Em dias de alta poluição, prefira exercitar-se em ambientes fechados com ar condicionado ou filtrado.',
    category: 'airQuality',
    conditions: ['Poluição alta', 'Exercícios'],
    severity: 'medium',
    icon: '🏃'
  },
  {
    id: '9',
    title: 'Purificação do Ar Doméstico',
    description: 'Use purificadores de ar em casa, mantenha janelas fechadas em dias poluídos e cultive plantas que purificam o ar.',
    category: 'airQuality',
    conditions: ['Poluição', 'Alergias'],
    severity: 'medium',
    icon: '🌱'
  },

  // Humidity Tips
  {
    id: '10',
    title: 'Controle da Umidade em Casa',
    description: 'Mantenha a umidade entre 40-60%. Use desumidificador se necessário e evite secar roupas dentro de casa.',
    category: 'humidity',
    conditions: ['Artrite', 'Problemas respiratórios'],
    severity: 'medium',
    icon: '🏠'
  },
  {
    id: '11',
    title: 'Cuidados com Mofo e Ácaros',
    description: 'Em alta umidade, limpe regularmente para evitar mofo. Use capas antialérgicas em colchões e travesseiros.',
    category: 'humidity',
    conditions: ['Alergias', 'Asma', 'Rinite'],
    severity: 'medium',
    icon: '🧽'
  },

  // General Tips
  {
    id: '12',
    title: 'Medicação de Emergência',
    description: 'Sempre carregue medicamentos de emergência (inalador, antialérgicos) e mantenha-os em temperatura adequada.',
    category: 'general',
    conditions: ['Asma', 'Alergias', 'Condições crônicas'],
    severity: 'high',
    icon: '💊'
  },
  {
    id: '13',
    title: 'Monitoramento Regular',
    description: 'Acompanhe diariamente as condições climáticas e alertas meteorológicos para se preparar adequadamente.',
    category: 'general',
    conditions: ['Todas as condições'],
    severity: 'low',
    icon: '📱'
  },
  {
    id: '14',
    title: 'Alimentação Sazonal',
    description: 'Adapte sua dieta às condições climáticas: mais líquidos no calor, alimentos quentes no frio, antioxidantes em dias poluídos.',
    category: 'general',
    conditions: ['Nutrição', 'Imunidade'],
    severity: 'low',
    icon: '🥗'
  },
  {
    id: '15',
    title: 'Sono e Descanso',
    description: 'Mantenha o ambiente de sono confortável: temperatura entre 18-22°C, umidade adequada e ar limpo.',
    category: 'general',
    conditions: ['Qualidade do sono', 'Bem-estar'],
    severity: 'medium',
    icon: '😴'
  }
];

export default function TipsPage() {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [filteredTips, setFilteredTips] = useState<PreventionTip[]>(preventionTips);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [personalizedTips, setPersonalizedTips] = useState<PreventionTip[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTips();
  }, [selectedCategory, searchTerm, healthProfile, weatherData]);

  const loadData = async () => {
    // Load health profile
    const profile = getHealthProfile();
    setHealthProfile(profile);

    // Load current weather for personalized tips
    try {
      const location = await getCurrentLocation();
      const weather = await getWeatherData(location.lat, location.lon);
      setWeatherData(weather);
    } catch (error) {
      console.warn('Não foi possível carregar dados meteorológicos:', error);
    }
  };

  const filterTips = () => {
    let filtered = preventionTips;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.conditions.some(condition => 
          condition.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredTips(filtered);

    // Generate personalized tips based on profile and weather
    if (healthProfile && weatherData) {
      const personalized = generatePersonalizedTips();
      setPersonalizedTips(personalized);
    }
  };

  const generatePersonalizedTips = (): PreventionTip[] => {
    if (!healthProfile || !weatherData) return [];

    const relevant: PreventionTip[] = [];
    const temp = weatherData.weather?.main?.temp || 0;
    const humidity = weatherData.weather?.main?.humidity || 0;
    const uvIndex = weatherData.uv?.value || 0;
    const aqi = weatherData.airPollution?.list?.[0]?.main?.aqi || 1;

    // Temperature-based tips
    if (temp > 30) {
      relevant.push(...preventionTips.filter(tip => 
        tip.category === 'temperature' && tip.title.includes('Hidratação')
      ));
    }
    if (temp < 15) {
      relevant.push(...preventionTips.filter(tip => 
        tip.category === 'temperature' && tip.title.includes('Frio')
      ));
    }

    // UV-based tips
    if (uvIndex > 6) {
      relevant.push(...preventionTips.filter(tip => tip.category === 'uv'));
    }

    // Air quality tips
    if (aqi > 3) {
      relevant.push(...preventionTips.filter(tip => tip.category === 'airQuality'));
    }

    // Humidity tips
    if (humidity > 70 && healthProfile.conditions.includes('artrite')) {
      relevant.push(...preventionTips.filter(tip => 
        tip.category === 'humidity'
      ));
    }

    // Condition-specific tips
    healthProfile.conditions.forEach(condition => {
      relevant.push(...preventionTips.filter(tip =>
        tip.conditions.some(c => c.toLowerCase().includes(condition.toLowerCase()))
      ));
    });

    // Remove duplicates and limit to top 6
    const unique = relevant.filter((tip, index, self) => 
      index === self.findIndex(t => t.id === tip.id)
    );

    return unique.slice(0, 6);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Média Prioridade';
      case 'low': return 'Baixa Prioridade';
      default: return 'Prioridade Desconhecida';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'temperature': return 'Temperatura';
      case 'humidity': return 'Umidade';
      case 'uv': return 'Proteção Solar';
      case 'airQuality': return 'Qualidade do Ar';
      case 'general': return 'Geral';
      default: return 'Todas';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dicas de Prevenção</h1>
              <p className="text-gray-600 mt-1">Orientações para manter sua saúde em diferentes condições climáticas</p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Hero Image */}
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gradient-to-r from-green-400 to-blue-500">
            <img 
              src="https://placehold.co/1200x400?text=Preventative+health+tips+illustration+showing+hydration+sun+protection+and+air+quality+awareness+in+modern+minimalist+design" 
              alt="Ilustração detalhada de dicas preventivas de saúde mostrando hidratação, proteção solar e consciência da qualidade do ar em design minimalista moderno"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-2">Sua Saúde em Primeiro Lugar</h2>
                <p className="text-xl">Dicas personalizadas baseadas no clima e seu perfil de saúde</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar dicas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  Todas
                </Button>
                {['temperature', 'uv', 'airQuality', 'humidity', 'general'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                  >
                    {getCategoryName(category)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personalized" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personalized">Dicas Personalizadas</TabsTrigger>
            <TabsTrigger value="all">Todas as Dicas</TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="space-y-6">
            {personalizedTips.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">🎯 Dicas Personalizadas para Você</CardTitle>
                    <CardDescription>
                      Baseado no seu perfil de saúde e condições climáticas atuais
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personalizedTips.map((tip) => (
                    <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{tip.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{tip.title}</CardTitle>
                              <Badge className={`${getSeverityColor(tip.severity)} text-white text-xs mt-1`}>
                                {getSeverityText(tip.severity)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{tip.description}</p>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Relevante para:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tip.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Dicas Personalizadas Indisponíveis
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {!healthProfile 
                      ? 'Crie seu perfil de saúde para receber dicas personalizadas.'
                      : 'Não foi possível carregar dados meteorológicos para personalização.'
                    }
                  </p>
                  {!healthProfile && (
                    <Link href="/profile">
                      <Button>Criar Perfil de Saúde</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip) => (
                <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tip.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {getCategoryName(tip.category)}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`${getSeverityColor(tip.severity)} text-white text-xs`}>
                        {tip.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{tip.description}</p>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Relevante para:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tip.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTips.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhuma Dica Encontrada
                  </h3>
                  <p className="text-gray-500">
                    Tente ajustar os filtros ou termo de busca para encontrar dicas relevantes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Emergency Tips */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              🚨 Dicas de Emergência
            </CardTitle>
            <CardDescription>
              Orientações importantes para situações de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-red-800">Emergência Respiratória</h4>
                  <p className="text-sm text-red-700">
                    Se sentir dificuldade extrema para respirar, procure atendimento médico imediatamente. 
                    Use medicação de emergência se prescrita.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <span className="text-red-500 text-xl">🌡️</span>
                <div>
                  <h4 className="font-medium text-red-800">Insolação ou Hipotermia</h4>
                  <p className="text-sm text-red-700">
                    Sintomas como confusão, náusea intensa, ou tremores descontrolados requerem atenção médica urgente.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <span className="text-red-500 text-xl">📞</span>
                <div>
                  <h4 className="font-medium text-red-800">Contatos de Emergência</h4>
                  <p className="text-sm text-red-700">
                    SAMU: 192 | Bombeiros: 193 | Sempre tenha seus medicamentos e contatos médicos acessíveis.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
