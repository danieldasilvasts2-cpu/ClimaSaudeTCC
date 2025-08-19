"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  saveSymptomEntry, 
  getSymptomHistory,
  getWeatherData,
  getCurrentLocation,
  formatDate,
  type SymptomEntry 
} from '@/lib/utils';
import Link from 'next/link';

const commonSymptoms = [
  'Dor de cabeça',
  'Fadiga',
  'Dificuldade para respirar',
  'Tosse',
  'Espirros',
  'Olhos irritados',
  'Nariz entupido',
  'Dor nas articulações',
  'Dor muscular',
  'Irritação na pele',
  'Tontura',
  'Náusea',
  'Insônia',
  'Ansiedade',
  'Palpitações'
];

export default function HistoryPage() {
  const [symptomHistory, setSymptomHistory] = useState<SymptomEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<SymptomEntry>>({
    symptoms: [],
    severity: 'medium',
    notes: ''
  });
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSymptomHistory();
  }, []);

  const loadSymptomHistory = () => {
    const history = getSymptomHistory();
    setSymptomHistory(history);
  };

  const handleSymptomToggle = (symptom: string) => {
    setNewEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...(prev.symptoms || []), symptom]
    }));
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !newEntry.symptoms?.includes(customSymptom.trim())) {
      setNewEntry(prev => ({
        ...prev,
        symptoms: [...(prev.symptoms || []), customSymptom.trim()]
      }));
      setCustomSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setNewEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms?.filter(s => s !== symptom) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!newEntry.symptoms || newEntry.symptoms.length === 0) {
        throw new Error('Selecione pelo menos um sintoma');
      }

      // Get current weather data for context
      let weatherData = null;
      try {
        const location = await getCurrentLocation();
        weatherData = await getWeatherData(location.lat, location.lon);
      } catch (weatherError) {
        console.warn('Não foi possível obter dados meteorológicos:', weatherError);
      }

      const entry: SymptomEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symptoms: newEntry.symptoms,
        severity: newEntry.severity as 'low' | 'medium' | 'high',
        notes: newEntry.notes || '',
        weather: weatherData
      };

      saveSymptomEntry(entry);
      loadSymptomHistory();
      
      // Reset form
      setNewEntry({
        symptoms: [],
        severity: 'medium',
        notes: ''
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar sintoma');
    } finally {
      setLoading(false);
    }
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
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Desconhecida';
    }
  };

  const deleteEntry = (entryId: string) => {
    const updated = symptomHistory.filter(entry => entry.id !== entryId);
    setSymptomHistory(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('symptomHistory', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Sintomas</h1>
              <p className="text-gray-600 mt-1">Registre e acompanhe seus sintomas relacionados ao clima</p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Sintoma registrado com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* New Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Novos Sintomas</CardTitle>
            <CardDescription>
              Documente seus sintomas para identificar padrões relacionados ao clima
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Symptom Selection */}
              <div>
                <Label className="text-base font-medium">Sintomas Experimentados</Label>
                <p className="text-sm text-gray-600 mb-4">Selecione todos os sintomas que você está sentindo</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {commonSymptoms.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={newEntry.symptoms?.includes(symptom) || false}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Input
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder="Adicionar sintoma personalizado"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                  />
                  <Button type="button" onClick={addCustomSymptom} variant="outline">
                    Adicionar
                  </Button>
                </div>

                {newEntry.symptoms && newEntry.symptoms.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Sintomas Selecionados:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEntry.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="cursor-pointer">
                          {symptom}
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Severity */}
              <div>
                <Label htmlFor="severity">Intensidade dos Sintomas</Label>
                <Select
                  value={newEntry.severity}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewEntry(prev => ({ ...prev, severity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa - Sintomas leves, não interferem nas atividades</SelectItem>
                    <SelectItem value="medium">Média - Sintomas moderados, algum desconforto</SelectItem>
                    <SelectItem value="high">Alta - Sintomas intensos, interferem significativamente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Descreva detalhes sobre os sintomas, possíveis causas, medicamentos tomados, etc."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading || !newEntry.symptoms?.length}>
                {loading ? 'Salvando...' : 'Registrar Sintomas'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Symptom History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sintomas ({symptomHistory.length})</CardTitle>
            <CardDescription>
              Seus registros anteriores de sintomas e condições climáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {symptomHistory.length > 0 ? (
              <div className="space-y-4">
                {symptomHistory.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{formatDate(entry.date)}</span>
                          <Badge className={`${getSeverityColor(entry.severity)} text-white text-xs`}>
                            {getSeverityText(entry.severity)}
                          </Badge>
                        </div>
                        {entry.weather && (
                          <div className="text-sm text-gray-600">
                            Clima: {Math.round(entry.weather.weather?.main?.temp || 0)}°C, 
                            {entry.weather.weather?.main?.humidity || 0}% umidade, 
                            UV {entry.weather.uv?.value || 0}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Excluir
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Sintomas:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {entry.notes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Observações:</Label>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum Sintoma Registrado
                </h3>
                <p className="text-gray-500">
                  Comece registrando seus sintomas para identificar padrões relacionados ao clima.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {symptomHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Resumo dos seus registros de sintomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {symptomHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Total de Registros</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(symptomHistory.reduce((sum, entry) => 
                      sum + entry.symptoms.length, 0) / symptomHistory.length)}
                  </div>
                  <div className="text-sm text-gray-600">Sintomas por Registro</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const allSymptoms = symptomHistory.flatMap(entry => entry.symptoms);
                      const symptomCounts: { [key: string]: number } = {};
                      allSymptoms.forEach(symptom => {
                        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                      });
                      const mostCommon = Object.entries(symptomCounts)
                        .sort(([,a], [,b]) => b - a)[0];
                      return mostCommon ? mostCommon[0] : 'N/A';
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Sintoma Mais Comum</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Data */}
        {symptomHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Baixe seus dados para compartilhar com profissionais de saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  const data = JSON.stringify(symptomHistory, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `historico-sintomas-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              >
                Exportar Histórico (JSON)
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
