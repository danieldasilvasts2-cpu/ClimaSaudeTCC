"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface AlertHistory {
  id: string;
  date: string;
  risks: HealthRisk[];
  recommendations: string[];
  weatherData: any;
  acknowledged: boolean;
}

export default function AlertsPage() {
  const [currentRisks, setCurrentRisks] = useState<HealthRisk[]>([]);
  const [currentRecommendations, setCurrentRecommendations] = useState<string[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlertsData();
    loadAlertHistory();
  }, []);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load health profile
      const profile = getHealthProfile();
      setHealthProfile(profile);

      if (!profile) {
        setError('Perfil de saúde não encontrado. Crie seu perfil primeiro.');
        return;
      }

      // Get location and weather data
      const location = await getCurrentLocation();
      const weather = await getWeatherData(location.lat, location.lon);
      setWeatherData(weather);

      // Analyze health risks
      const analysis = analyzeHealthRisks(weather, profile);
      setCurrentRisks(analysis.risks);
      setCurrentRecommendations(analysis.recommendations);

      // Save current alert to history if there are risks
      if (analysis.risks.length > 0) {
        saveCurrentAlert(analysis, weather);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    setRefreshing(true);
    await loadAlertsData();
    setRefreshing(false);
  };

  const saveCurrentAlert = (analysis: { risks: HealthRisk[]; recommendations: string[] }, weather: any) => {
    const newAlert: AlertHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      weatherData: weather,
      acknowledged: false
    };

    const existing = getAlertHistory();
    const updated = [newAlert, ...existing.slice(0, 49)]; // Keep last 50 alerts
    saveAlertHistory(updated);
    setAlertHistory(updated);
  };

  const loadAlertHistory = () => {
    const history = getAlertHistory();
    setAlertHistory(history);
  };

  const getAlertHistory = (): AlertHistory[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alertHistory');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  };

  const saveAlertHistory = (history: AlertHistory[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alertHistory', JSON.stringify(history));
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    const updated = alertHistory.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setAlertHistory(updated);
    saveAlertHistory(updated);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'airQuality': return '🌫️';
      case 'uv': return '☀️';
      default: return '⚠️';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alertas de Saúde</h1>
              <p className="text-gray-600 mt-1">Monitoramento personalizado baseado no clima</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={refreshAlerts}
                disabled={refreshing}
              >
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
              <Link href="/">
                <Button variant="outline">Voltar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
              {error.includes('Perfil de saúde') && (
                <Link href="/profile" className="underline font-medium ml-2">
                  Criar perfil agora
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!healthProfile && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Perfil necessário:</strong> Crie seu perfil de saúde para receber alertas personalizados.{' '}
              <Link href="/profile" className="underline font-medium">
                Criar perfil
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Alertas Atuais</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Current Weather Summary */}
            {weatherData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🌤️ Condições Atuais
                  </CardTitle>
                  <CardDescription>
                    Última atualização: {formatDate(new Date())}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(weatherData.weather?.main?.temp || 0)}°C
                      </div>
                      <div className="text-sm text-gray-600">Temperatura</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-600">
                        {weatherData.weather?.main?.humidity || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Umidade</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {weatherData.uv?.value || 0}
                      </div>
                      <div className="text-sm text-gray-600">Índice UV</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {weatherData.airPollution?.list?.[0]?.main?.aqi || 1}
                      </div>
                      <div className="text-sm text-gray-600">Qualidade do Ar</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Risks */}
            {currentRisks.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    🚨 Alertas Ativos ({currentRisks.length})
                  </CardTitle>
                  <CardDescription>
                    Riscos identificados para seu perfil de saúde
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentRisks.map((risk, index) => (
                    <Alert key={index} className={getRiskColor(risk.level)}>
                      <AlertDescription className="flex items-start gap-3">
                        <span className="text-xl">{getRiskIcon(risk.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getRiskBadgeColor(risk.level)} text-white text-xs`}>
                              {risk.level.toUpperCase()}
                            </Badge>
                            <span className="font-medium capitalize">{risk.type}</span>
                          </div>
                          <p>{risk.message}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">
                    Nenhum Alerta Ativo
                  </h3>
                  <p className="text-gray-600">
                    As condições climáticas atuais não apresentam riscos para seu perfil de saúde.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Current Recommendations */}
            {currentRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    💡 Recomendações Atuais
                  </CardTitle>
                  <CardDescription>
                    Dicas personalizadas para manter sua saúde
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-green-800">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {alertHistory.length > 0 ? (
              <div className="space-y-4">
                {alertHistory.map((alert) => (
                  <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {alert.risks.length > 0 ? '🚨' : '✅'} 
                          {formatDate(alert.date)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {alert.risks.length > 0 && (
                            <Badge variant="destructive">
                              {alert.risks.length} alerta{alert.risks.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {!alert.acknowledged && alert.risks.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Marcar como Lido
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        Temp: {Math.round(alert.weatherData?.weather?.main?.temp || 0)}°C | 
                        Umidade: {alert.weatherData?.weather?.main?.humidity || 0}% | 
                        UV: {alert.weatherData?.uv?.value || 0} | 
                        Ar: {alert.weatherData?.airPollution?.list?.[0]?.main?.aqi || 1}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {alert.risks.length > 0 ? (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-red-600 mb-2">Riscos Identificados:</h4>
                            <div className="space-y-2">
                              {alert.risks.map((risk, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Badge className={`${getRiskBadgeColor(risk.level)} text-white text-xs`}>
                                    {risk.level}
                                  </Badge>
                                  <span>{getRiskIcon(risk.type)}</span>
                                  <span>{risk.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {alert.recommendations.length > 0 && (
                            <div>
                              <h4 className="font-medium text-green-600 mb-2">Recomendações:</h4>
                              <ul className="text-sm space-y-1">
                                {alert.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-green-600">Nenhum risco identificado neste período.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum Histórico
                  </h3>
                  <p className="text-gray-500">
                    O histórico de alertas aparecerá aqui conforme forem gerados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
