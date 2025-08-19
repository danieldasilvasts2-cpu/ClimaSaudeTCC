import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Weather Data Fetching
export async function getWeatherData(lat: number, lon: number) {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Falha ao buscar dados meteorológicos');
    }
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar dados meteorológicos:', error);
    throw error;
  }
}

// Health Profile Types
export interface HealthProfile {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  medications: string[];
  allergies: string[];
  sensitivities: {
    temperature: 'low' | 'normal' | 'high';
    humidity: 'low' | 'normal' | 'high';
    airQuality: 'low' | 'normal' | 'high';
    uv: 'low' | 'normal' | 'high';
  };
  emergencyContact?: string;
}

// Health Risk Types
export interface HealthRisk {
  level: 'low' | 'medium' | 'high';
  type: 'temperature' | 'humidity' | 'airQuality' | 'uv';
  message: string;
}

// Health Risk Analysis
export function analyzeHealthRisks(weatherData: any, profile: HealthProfile) {
  const risks: HealthRisk[] = [];
  const recommendations: string[] = [];

  if (!weatherData?.weather) return { risks, recommendations };

  const temp = weatherData.weather.main.temp;
  const humidity = weatherData.weather.main.humidity;
  const uvIndex = weatherData.uv?.value || 0;
  const aqi = weatherData.airPollution?.list?.[0]?.main?.aqi || 1;

  // Temperature Analysis
  if (temp > 35 && profile.sensitivities.temperature === 'high') {
    risks.push({
      level: 'high',
      type: 'temperature',
      message: 'Temperatura muito alta para seu perfil de sensibilidade'
    });
    recommendations.push('Evite exposição ao sol entre 10h e 16h');
    recommendations.push('Mantenha-se hidratado bebendo água regularmente');
  }

  if (temp < 10 && profile.conditions.includes('asma')) {
    risks.push({
      level: 'medium',
      type: 'temperature',
      message: 'Temperatura baixa pode agravar sintomas de asma'
    });
    recommendations.push('Use roupas adequadas para o frio');
    recommendations.push('Mantenha medicação de emergência próxima');
  }

  // UV Index Analysis
  if (uvIndex > 6) {
    risks.push({
      level: uvIndex > 8 ? 'high' : 'medium',
      type: 'uv',
      message: `Índice UV ${uvIndex > 8 ? 'muito alto' : 'alto'} - risco de queimaduras`
    });
    recommendations.push('Use protetor solar FPS 30+');
    recommendations.push('Use chapéu e óculos de sol');
  }

  // Air Quality Analysis
  if (aqi > 3 && (profile.conditions.includes('asma') || profile.conditions.includes('bronquite'))) {
    risks.push({
      level: 'high',
      type: 'airQuality',
      message: 'Qualidade do ar ruim pode agravar condições respiratórias'
    });
    recommendations.push('Evite atividades ao ar livre');
    recommendations.push('Use máscara se necessário sair');
  }

  // Humidity Analysis
  if (humidity > 80 && profile.conditions.includes('artrite')) {
    risks.push({
      level: 'medium',
      type: 'humidity',
      message: 'Alta umidade pode aumentar dores articulares'
    });
    recommendations.push('Mantenha ambientes secos em casa');
    recommendations.push('Considere exercícios leves de alongamento');
  }

  return { risks, recommendations };
}

// Geolocation Helper
export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        // Fallback to São Paulo coordinates
        console.warn('Erro de geolocalização, usando localização padrão:', error);
        resolve({ lat: -23.5505, lon: -46.6333 }); // São Paulo
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Local Storage Helpers
export function saveHealthProfile(profile: HealthProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('healthProfile', JSON.stringify(profile));
  }
}

export function getHealthProfile(): HealthProfile | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('healthProfile');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

export function saveFamilyProfiles(profiles: HealthProfile[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('familyProfiles', JSON.stringify(profiles));
  }
}

export function getFamilyProfiles(): HealthProfile[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('familyProfiles');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

// Symptom History
export interface SymptomEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: 'low' | 'medium' | 'high';
  notes: string;
  weather?: any;
}

export function saveSymptomEntry(entry: SymptomEntry) {
  if (typeof window !== 'undefined') {
    const existing = getSymptomHistory();
    existing.unshift(entry);
    // Keep only last 100 entries
    const limited = existing.slice(0, 100);
    localStorage.setItem('symptomHistory', JSON.stringify(limited));
  }
}

export function getSymptomHistory(): SymptomEntry[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('symptomHistory');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

// Date Formatting
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(date));
}
