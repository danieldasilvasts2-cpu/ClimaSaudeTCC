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
  saveHealthProfile, 
  getHealthProfile, 
  type HealthProfile 
} from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const commonConditions = [
  'Asma',
  'Bronquite',
  'Artrite',
  'Hipertensão',
  'Diabetes',
  'Enxaqueca',
  'Rinite Alérgica',
  'Sinusite',
  'Problemas Cardíacos',
  'Problemas de Pele',
  'Osteoporose',
  'Fibromialgia'
];

const commonAllergies = [
  'Pólen',
  'Ácaros',
  'Poeira',
  'Pelos de Animais',
  'Mofo',
  'Produtos Químicos',
  'Perfumes',
  'Alimentos',
  'Medicamentos',
  'Látex'
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<HealthProfile>({
    id: '',
    name: '',
    age: 0,
    conditions: [],
    medications: [],
    allergies: [],
    sensitivities: {
      temperature: 'normal',
      humidity: 'normal',
      airQuality: 'normal',
      uv: 'normal'
    },
    emergencyContact: ''
  });
  
  const [customCondition, setCustomCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customMedication, setCustomMedication] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing profile
    const existingProfile = getHealthProfile();
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Generate new ID for new profile
      setProfile(prev => ({ ...prev, id: Date.now().toString() }));
    }
  }, []);

  const handleConditionToggle = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const handleAllergyToggle = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !profile.conditions.includes(customCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        conditions: [...prev.conditions, customCondition.trim()]
      }));
      setCustomCondition('');
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !profile.allergies.includes(customAllergy.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, customAllergy.trim()]
      }));
      setCustomAllergy('');
    }
  };

  const addCustomMedication = () => {
    if (customMedication.trim() && !profile.medications.includes(customMedication.trim())) {
      setProfile(prev => ({
        ...prev,
        medications: [...prev.medications, customMedication.trim()]
      }));
      setCustomMedication('');
    }
  };

  const removeItem = (array: string[], item: string, field: keyof HealthProfile) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!profile.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (profile.age < 1 || profile.age > 120) {
        throw new Error('Idade deve estar entre 1 e 120 anos');
      }

      // Save profile
      saveHealthProfile(profile);
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Perfil Salvo!</h2>
            <p className="text-gray-600 mb-4">
              Seu perfil de saúde foi salvo com sucesso. Redirecionando...
            </p>
            <Link href="/">
              <Button>Ir para Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfil de Saúde</h1>
              <p className="text-gray-600 mt-1">Configure seu perfil para receber alertas personalizados</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados pessoais para personalização dos alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Idade *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    placeholder="Sua idade"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergency">Contato de Emergência</Label>
                <Input
                  id="emergency"
                  value={profile.emergencyContact || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Telefone de contato de emergência"
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Condições de Saúde</CardTitle>
              <CardDescription>
                Selecione suas condições médicas para alertas específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={profile.conditions.includes(condition)}
                      onCheckedChange={() => handleConditionToggle(condition)}
                    />
                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Input
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  placeholder="Adicionar condição personalizada"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCondition())}
                />
                <Button type="button" onClick={addCustomCondition} variant="outline">
                  Adicionar
                </Button>
              </div>

              {profile.conditions.length > 0 && (
                <div className="space-y-2">
                  <Label>Condições Selecionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="cursor-pointer">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeItem(profile.conditions, condition, 'conditions')}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle>Alergias</CardTitle>
              <CardDescription>
                Informe suas alergias para alertas de qualidade do ar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAllergies.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={profile.allergies.includes(allergy)}
                      onCheckedChange={() => handleAllergyToggle(allergy)}
                    />
                    <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Input
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Adicionar alergia personalizada"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                />
                <Button type="button" onClick={addCustomAllergy} variant="outline">
                  Adicionar
                </Button>
              </div>

              {profile.allergies.length > 0 && (
                <div className="space-y-2">
                  <Label>Alergias Selecionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy) => (
                      <Badge key={allergy} variant="secondary" className="cursor-pointer">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeItem(profile.allergies, allergy, 'allergies')}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos</CardTitle>
              <CardDescription>
                Liste os medicamentos que você usa regularmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={customMedication}
                  onChange={(e) => setCustomMedication(e.target.value)}
                  placeholder="Nome do medicamento"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomMedication())}
                />
                <Button type="button" onClick={addCustomMedication} variant="outline">
                  Adicionar
                </Button>
              </div>

              {profile.medications.length > 0 && (
                <div className="space-y-2">
                  <Label>Medicamentos:</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.medications.map((medication) => (
                      <Badge key={medication} variant="secondary" className="cursor-pointer">
                        {medication}
                        <button
                          type="button"
                          onClick={() => removeItem(profile.medications, medication, 'medications')}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sensitivities */}
          <Card>
            <CardHeader>
              <CardTitle>Sensibilidades</CardTitle>
              <CardDescription>
                Configure sua sensibilidade a diferentes fatores climáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sensibilidade à Temperatura</Label>
                  <Select
                    value={profile.sensitivities.temperature}
                    onValueChange={(value: 'low' | 'normal' | 'high') => 
                      setProfile(prev => ({
                        ...prev,
                        sensitivities: { ...prev.sensitivities, temperature: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sensibilidade à Umidade</Label>
                  <Select
                    value={profile.sensitivities.humidity}
                    onValueChange={(value: 'low' | 'normal' | 'high') => 
                      setProfile(prev => ({
                        ...prev,
                        sensitivities: { ...prev.sensitivities, humidity: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sensibilidade à Qualidade do Ar</Label>
                  <Select
                    value={profile.sensitivities.airQuality}
                    onValueChange={(value: 'low' | 'normal' | 'high') => 
                      setProfile(prev => ({
                        ...prev,
                        sensitivities: { ...prev.sensitivities, airQuality: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sensibilidade ao UV</Label>
                  <Select
                    value={profile.sensitivities.uv}
                    onValueChange={(value: 'low' | 'normal' | 'high') => 
                      setProfile(prev => ({
                        ...prev,
                        sensitivities: { ...prev.sensitivities, uv: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
