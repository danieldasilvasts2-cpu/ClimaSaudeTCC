"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  saveFamilyProfiles, 
  getFamilyProfiles,
  getWeatherData,
  getCurrentLocation,
  analyzeHealthRisks,
  type HealthProfile,
  type HealthRisk 
} from '@/lib/utils';
import Link from 'next/link';

const commonConditions = [
  'Asma', 'Bronquite', 'Artrite', 'Hipertensão', 'Diabetes', 'Enxaqueca'
];

const relationships = [
  'Filho(a)', 'Cônjuge', 'Pai/Mãe', 'Avô/Avó', 'Irmão/Irmã', 'Outro'
];

interface FamilyMember extends HealthProfile {
  relationship: string;
  currentRisks?: HealthRisk[];
}

export default function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    age: 0,
    relationship: '',
    conditions: [],
    medications: [],
    allergies: [],
    sensitivities: {
      temperature: 'normal',
      humidity: 'normal',
      airQuality: 'normal',
      uv: 'normal'
    }
  });

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      const profiles = getFamilyProfiles();
      setFamilyMembers(profiles);
    } catch (err) {
      setError('Erro ao carregar dados da família');
    } finally {
      setLoading(false);
    }
  };

  const handleConditionToggle = (condition: string) => {
    setNewMember(prev => ({
      ...prev,
      conditions: prev.conditions?.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...(prev.conditions || []), condition]
    }));
  };

  const addFamilyMember = () => {
    try {
      if (!newMember.name?.trim() || !newMember.age || !newMember.relationship) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const member: FamilyMember = {
        id: Date.now().toString(),
        name: newMember.name,
        age: newMember.age,
        relationship: newMember.relationship,
        conditions: newMember.conditions || [],
        medications: newMember.medications || [],
        allergies: newMember.allergies || [],
        sensitivities: newMember.sensitivities || {
          temperature: 'normal',
          humidity: 'normal',
          airQuality: 'normal',
          uv: 'normal'
        }
      };

      const updatedMembers = [...familyMembers, member];
      setFamilyMembers(updatedMembers);
      saveFamilyProfiles(updatedMembers);

      setNewMember({
        name: '',
        age: 0,
        relationship: '',
        conditions: [],
        medications: [],
        allergies: [],
        sensitivities: {
          temperature: 'normal',
          humidity: 'normal',
          airQuality: 'normal',
          uv: 'normal'
        }
      });
      setIsAddingMember(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    }
  };

  const deleteFamilyMember = (memberId: string) => {
    const updatedMembers = familyMembers.filter(member => member.id !== memberId);
    setFamilyMembers(updatedMembers);
    saveFamilyProfiles(updatedMembers);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4">
        <div className="max-w-6xl mx-auto text-center py-8">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-bold text-gray-600">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modo Família</h1>
              <p className="text-gray-600 mt-1">Gerencie perfis de saúde de seus dependentes</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddingMember(true)}>
                Adicionar Membro
              </Button>
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
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{familyMembers.length}</div>
              <div className="text-sm text-gray-600">Membros da Família</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">
                {familyMembers.reduce((sum, member) => sum + (member.currentRisks?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Alertas Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {familyMembers.filter(member => (member.currentRisks?.length || 0) === 0).length}
              </div>
              <div className="text-sm text-gray-600">Sem Riscos</div>
            </CardContent>
          </Card>
        </div>

        {familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{member.name}</span>
                        <Badge variant="outline">{member.relationship}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {member.age} anos
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteFamilyMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {member.conditions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Condições:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.conditions.map((condition, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum Membro da Família
              </h3>
              <p className="text-gray-500 mb-4">
                Adicione membros da família para monitorar a saúde de todos.
              </p>
              <Button onClick={() => setIsAddingMember(true)}>
                Adicionar Primeiro Membro
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Membro da Família</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo membro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={newMember.name || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do membro"
                  />
                </div>
                <div>
                  <Label>Idade *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={newMember.age || ''}
                    onChange={(e) => setNewMember(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Relacionamento *</Label>
                <Select
                  value={newMember.relationship || ''}
                  onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condições de Saúde</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newMember.conditions?.includes(condition) || false}
                        onCheckedChange={() => handleConditionToggle(condition)}
                      />
                      <Label className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                  Cancelar
                </Button>
                <Button onClick={addFamilyMember}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
