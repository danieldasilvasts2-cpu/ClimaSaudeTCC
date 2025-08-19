"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getHealthProfile, 
  getSymptomHistory,
  formatDate,
  formatDateShort,
  type HealthProfile,
  type SymptomEntry 
} from '@/lib/utils';
import Link from 'next/link';

interface WeatherReport {
  date: string;
  temperature: { min: number; max: number; avg: number };
  humidity: number;
  uvIndex: number;
  airQuality: number;
  risks: number;
  symptoms: string[];
}

interface WeeklySummary {
  week: string;
  avgTemperature: number;
  avgHumidity: number;
  avgUV: number;
  avgAirQuality: number;
  totalRisks: number;
  totalSymptoms: number;
  mostCommonSymptoms: string[];
  recommendations: string[];
}

export default function ReportsPage() {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [symptomHistory, setSymptomHistory] = useState<SymptomEntry[]>([]);
  const [dailyReports, setDailyReports] = useState<WeatherReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklySummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('7');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
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

      // Load symptom history
      const symptoms = getSymptomHistory();
      setSymptomHistory(symptoms);

      // Generate mock daily reports (in a real app, this would come from stored weather data)
      const daily = generateDailyReports(parseInt(selectedPeriod), symptoms);
      setDailyReports(daily);

      // Generate weekly summaries
      const weekly = generateWeeklySummaries(daily);
      setWeeklyReports(weekly);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyReports = (days: number, symptoms: SymptomEntry[]): WeatherReport[] => {
    const reports: WeatherReport[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate weather data (in real app, this would be historical data)
      const temp = 20 + Math.random() * 15; // 20-35°C
      const humidity = 40 + Math.random() * 40; // 40-80%
      const uv = Math.random() * 11; // 0-11
      const aqi = Math.floor(Math.random() * 5) + 1; // 1-5

      // Find symptoms for this date
      const daySymptoms = symptoms.filter(s => {
        const symptomDate = new Date(s.date);
        return symptomDate.toDateString() === date.toDateString();
      });

      // Calculate risks based on conditions
      let risks = 0;
      if (temp > 30) risks++;
      if (humidity > 70) risks++;
      if (uv > 7) risks++;
      if (aqi > 3) risks++;

      reports.push({
        date: date.toISOString(),
        temperature: {
          min: temp - 3,
          max: temp + 3,
          avg: temp
        },
        humidity: Math.round(humidity),
        uvIndex: Math.round(uv * 10) / 10,
        airQuality: aqi,
        risks,
        symptoms: daySymptoms.flatMap(s => s.symptoms)
      });
    }

    return reports.reverse(); // Show oldest first
  };

  const generateWeeklySummaries = (dailyReports: WeatherReport[]): WeeklySummary[] => {
    const summaries: WeeklySummary[] = [];
    const weeks: { [key: string]: WeatherReport[] } = {};

    // Group reports by week
    dailyReports.forEach(report => {
      const date = new Date(report.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(report);
    });

    // Generate summaries for each week
    Object.entries(weeks).forEach(([weekStart, reports]) => {
      const avgTemp = reports.reduce((sum, r) => sum + r.temperature.avg, 0) / reports.length;
      const avgHumidity = reports.reduce((sum, r) => sum + r.humidity, 0) / reports.length;
      const avgUV = reports.reduce((sum, r) => sum + r.uvIndex, 0) / reports.length;
      const avgAirQuality = reports.reduce((sum, r) => sum + r.airQuality, 0) / reports.length;
      const totalRisks = reports.reduce((sum, r) => sum + r.risks, 0);
      const allSymptoms = reports.flatMap(r => r.symptoms);
      const totalSymptoms = allSymptoms.length;

      // Count symptom frequency
      const symptomCounts: { [key: string]: number } = {};
      allSymptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });

      const mostCommonSymptoms = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([symptom]) => symptom);

      // Generate recommendations based on data
      const recommendations = [];
      if (avgTemp > 28) recommendations.push('Mantenha-se hidratado em temperaturas altas');
      if (avgHumidity > 70) recommendations.push('Use desumidificador em casa');
      if (avgUV > 6) recommendations.push('Use protetor solar diariamente');
      if (avgAirQuality > 3) recommendations.push('Evite atividades ao ar livre');
      if (totalSymptoms > 3) recommendations.push('Considere consultar um médico');

      summaries.push({
        week: weekStart,
        avgTemperature: Math.round(avgTemp * 10) / 10,
        avgHumidity: Math.round(avgHumidity),
        avgUV: Math.round(avgUV * 10) / 10,
        avgAirQuality: Math.round(avgAirQuality * 10) / 10,
        totalRisks,
        totalSymptoms,
        mostCommonSymptoms,
        recommendations
      });
    });

    return summaries.reverse(); // Show most recent first
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 15) return 'text-blue-600';
    if (temp < 25) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUVColor = (uv: number) => {
    if (uv <= 2) return 'text-green-600';
    if (uv <= 5) return 'text-yellow-600';
    if (uv <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAirQualityColor = (aqi: number) => {
    if (aqi <= 2) return 'text-green-600';
    if (aqi <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadge = (risks: number) => {
    if (risks === 0) return <Badge className="bg-green-500 text-white">Baixo</Badge>;
    if (risks <= 2) return <Badge className="bg-yellow-500 text-white">Médio</Badge>;
    return <Badge className="bg-red-500 text-white">Alto</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
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
                  <Skeleton className="h-40 w-full" />
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
              <h1 className="text-3xl font-bold text-gray-900">Relatórios de Saúde Climática</h1>
              <p className="text-gray-600 mt-1">Análises detalhadas do impacto do clima na sua saúde</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={(value: '7' | '30' | '90') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/">
                <Button variant="outline">Voltar</Button>
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
              <strong>Perfil necessário:</strong> Crie seu perfil de saúde para gerar relatórios personalizados.{' '}
              <Link href="/profile" className="underline font-medium">
                Criar perfil
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Relatório Diário</TabsTrigger>
            <TabsTrigger value="weekly">Resumo Semanal</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Temperatura Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getTemperatureColor(
                    dailyReports.reduce((sum, r) => sum + r.temperature.avg, 0) / dailyReports.length
                  )}`}>
                    {Math.round(dailyReports.reduce((sum, r) => sum + r.temperature.avg, 0) / dailyReports.length)}°C
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Umidade Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-600">
                    {Math.round(dailyReports.reduce((sum, r) => sum + r.humidity, 0) / dailyReports.length)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total de Riscos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {dailyReports.reduce((sum, r) => sum + r.risks, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sintomas Relatados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {dailyReports.reduce((sum, r) => sum + r.symptoms.length, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Relatório Diário - Últimos {selectedPeriod} dias</CardTitle>
                <CardDescription>
                  Condições climáticas e impactos na saúde por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Temp (°C)</th>
                        <th className="text-left p-2">Umidade</th>
                        <th className="text-left p-2">UV</th>
                        <th className="text-left p-2">Ar</th>
                        <th className="text-left p-2">Risco</th>
                        <th className="text-left p-2">Sintomas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyReports.map((report, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">
                            {formatDateShort(report.date)}
                          </td>
                          <td className={`p-2 font-medium ${getTemperatureColor(report.temperature.avg)}`}>
                            {Math.round(report.temperature.avg)}°
                          </td>
                          <td className="p-2">
                            {report.humidity}%
                          </td>
                          <td className={`p-2 font-medium ${getUVColor(report.uvIndex)}`}>
                            {report.uvIndex}
                          </td>
                          <td className={`p-2 font-medium ${getAirQualityColor(report.airQuality)}`}>
                            {report.airQuality}
                          </td>
                          <td className="p-2">
                            {getRiskBadge(report.risks)}
                          </td>
                          <td className="p-2">
                            {report.symptoms.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {report.symptoms.slice(0, 2).map((symptom, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                                {report.symptoms.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{report.symptoms.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">Nenhum</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            {weeklyReports.length > 0 ? (
              <div className="space-y-6">
                {weeklyReports.map((week, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Semana de {formatDateShort(week.week)}</span>
                        <div className="flex gap-2">
                          {getRiskBadge(week.totalRisks)}
                          {week.totalSymptoms > 0 && (
                            <Badge variant="outline">
                              {week.totalSymptoms} sintoma{week.totalSymptoms > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Weekly Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`text-2xl font-bold ${getTemperatureColor(week.avgTemperature)}`}>
                            {week.avgTemperature}°C
                          </div>
                          <div className="text-sm text-gray-600">Temp. Média</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-cyan-600">
                            {week.avgHumidity}%
                          </div>
                          <div className="text-sm text-gray-600">Umidade Média</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`text-2xl font-bold ${getUVColor(week.avgUV)}`}>
                            {week.avgUV}
                          </div>
                          <div className="text-sm text-gray-600">UV Médio</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={`text-2xl font-bold ${getAirQualityColor(week.avgAirQuality)}`}>
                            {week.avgAirQuality}
                          </div>
                          <div className="text-sm text-gray-600">Qualidade do Ar</div>
                        </div>
                      </div>

                      {/* Most Common Symptoms */}
                      {week.mostCommonSymptoms.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Sintomas Mais Frequentes:</h4>
                          <div className="flex flex-wrap gap-2">
                            {week.mostCommonSymptoms.map((symptom, i) => (
                              <Badge key={i} variant="secondary">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {week.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Recomendações da Semana:</h4>
                          <ul className="space-y-1">
                            {week.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Dados Insuficientes
                  </h3>
                  <p className="text-gray-500">
                    Não há dados suficientes para gerar resumos semanais. Continue usando o app para acumular dados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Relatórios</CardTitle>
            <CardDescription>
              Salve seus dados para compartilhar com profissionais de saúde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  const data = JSON.stringify({ dailyReports, weeklyReports, healthProfile }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `relatorio-clima-saude-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              >
                Exportar JSON
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  let csv = 'Data,Temperatura,Umidade,UV,Qualidade do Ar,Riscos,Sintomas\n';
                  dailyReports.forEach(report => {
                    csv += `${formatDateShort(report.date)},${report.temperature.avg},${report.humidity},${report.uvIndex},${report.airQuality},${report.risks},"${report.symptoms.join('; ')}"\n`;
                  });
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `relatorio-clima-saude-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
              >
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
