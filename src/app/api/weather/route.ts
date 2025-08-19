import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Parâmetros lat e lon são obrigatórios' }, 
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    
    if (!apiKey || apiKey === 'demo_key_replace_with_real_key') {
      return NextResponse.json(
        { error: 'Chave da API não configurada. Obtenha uma chave gratuita em https://openweathermap.org/api' }, 
        { status: 500 }
      );
    }

    // Fetch current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error('Falha ao buscar dados meteorológicos');
    }
    
    const weatherData = await weatherResponse.json();

    // Fetch UV Index data
    const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const uvResponse = await fetch(uvUrl);
    const uvData = uvResponse.ok ? await uvResponse.json() : { value: 0 };

    // Fetch Air Pollution data
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const airResponse = await fetch(airUrl);
    const airData = airResponse.ok ? await airResponse.json() : { list: [{ main: { aqi: 1 }, components: {} }] };

    // Combine all data
    const combinedData = {
      weather: weatherData,
      uv: uvData,
      airPollution: airData,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(combinedData);
  } catch (error: any) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
