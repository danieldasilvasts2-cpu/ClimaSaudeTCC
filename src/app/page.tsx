"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getWeatherData, 
  getCurrentLocation, 
  getHealthProfile, 
  analyzeHealthRisks,
  formatDate,
  type HealthProfile,
  type HealthRisk 
} from '@/lib/utils';
import Link from 'next/link';

interface WeatherData {
  weather: {
    main: { temp: number; humidity: number; feels_like: number };
    weather: Array<{ main: string; description: string }>;
    name: string;
  };
  uv: { value: number };
  airPollution: {
    list: Array<{
      main: { aqi: number };
      components: Record<string, number>;
    }>;
  };
}

export default function Dashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [risks, setRisks] = useState<HealthRisk[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);

      // Fetch weather data
      const weather = await getWeatherData(userLocation.lat, userLocation.lon);
      setWeatherData(weather);

      // Load health profile
      const profile = getHealthProfile();
      setHealthProfile(profile);

      // Analyze health risks if profile exists
      if (profile && weather) {
        const analysis = analyzeHealthRisks(weather, profile);
        setRisks(analysis.risks);
        setRecommendations(analysis.recommendations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getAirQualityText = (aqi: number) => {
    const levels = ['Boa', 'Razoável', 'Moderada', 'Ruim', 'Muito Ruim'];
    return levels[aqi - 1] || 'Desconhecida';
  };

  const getAirQualityColor = (aqi: number) => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500'];
    return colors[aqi - 1] || 'bg-gray-500';
  };

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Baixo', color: 'bg-green-500' };
    if (uv <= 5) return { text: 'Moderado', color: 'bg-yellow-500' };
    if (uv <= 7) return { text: 'Alto', color: 'bg-orange-500' };
    if (uv <= 10) return { text: 'Muito Alto', color: 'bg-red-500' };
    return { text: 'Extremo', color: 'bg-purple-500' };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center py-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ClimaHealth</h1>
              <p className="text-gray-600 mt-1">Sua saúde em sintonia com o clima</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDashboardData}>
                Atualizar
              </Button>
              <Link href="/profile">
                <Button variant={healthProfile ? "outline" : "default"}>
                  {healthProfile ? "Editar Perfil" : "Criar Perfil"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!healthProfile && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Bem-vindo!</strong> Crie seu perfil de saúde para receber alertas personalizados.{' '}
              <Link href="/profile" className="underline font-medium">
                Criar perfil agora
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Weather Overview */}
        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(weatherData.weather.main.temp)}°C
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Sensação: {Math.round(weatherData.weather.main.feels_like)}°C
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {weatherData.weather.weather[0]?.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Umidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">
                  {weatherData.weather.main.humidity}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {weatherData.weather.main.humidity > 70 ? 'Alta' : 
                   weatherData.weather.main.humidity > 40 ? 'Normal' : 'Baixa'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Índice UV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {weatherData.uv?.value || 0}
                </div>
                <Badge className={`mt-2 ${getUVLevel(weatherData.uv?.value || 0).color} text-white`}>
                  {getUVLevel(weatherData.uv?.value || 0).text}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Qualidade do Ar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {weatherData.airPollution?.list?.[0]?.main?.aqi || 1}
                </div>
                <Badge className={`mt-2 ${getAirQualityColor(weatherData.airPollution?.list?.[0]?.main?.aqi || 1)} text-white`}>
                  {getAirQualityText(weatherData.airPollution?.list?.[0]?.main?.aqi || 1)}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Health Alerts */}
        {risks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-red-600">⚠️ Alertas de Saúde</CardTitle>
              <CardDescription>
                Baseado no seu perfil de saúde e condições climáticas atuais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {risks.map((risk, index) => (
                <Alert key={index} className={getRiskColor(risk.level)}>
                  <AlertDescription>
                    <strong className="capitalize">{risk.level}:</strong> {risk.message}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-green-600">💡 Recomendações</CardTitle>
              <CardDescription>
                Dicas personalizadas para manter sua saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">👤</div>
                <h3 className="font-semibold">Perfil de Saúde</h3>
                <p className="text-sm text-gray-600">Gerenciar condições</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/alerts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🚨</div>
                <h3 className="font-semibold">Alertas</h3>
                <p className="text-sm text-gray-600">Ver todos os alertas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold">Relatórios</h3>
                <p className="text-sm text-gray-600">Análises detalhadas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold">Sintomas</h3>
                <p className="text-sm text-gray-600">Registrar sintomas</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Última atualização: {formatDate(new Date())}</span>
              <span>Localização: {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : 'Não disponível'}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
