Below is the detailed markdown plan outlining every change and dependent file required for the health-focused weather app (implemented as a Progressive Web App using the existing Next.js codebase). The plan covers API integration, UI pages, error handling, notifications, and styling.

---

**1. Environment Setup and Configuration**

- Create a new file:  
  **.env.local**  
  - Add your free OpenWeatherMap API key:  
  ```env
  OPENWEATHERMAP_API_KEY=YOUR_FREE_API_KEY
  ```  
- In **next.config.ts**, ensure any PWA plugins (if used) and environment variable exposures are configured so that sensitive keys remain server-side.

---

**2. API Integration for Weather Data**

- **File:** `src/app/api/weather/route.ts`  
  - Create a serverless GET endpoint that accepts query parameters (`lat` and `lon`).  
  - Use error handling (try/catch) and return a JSON response with appropriate HTTP status codes.  
  - Example code snippet:
  ```typescript
  import { NextResponse } from 'next/server';

  export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');

      if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
      }

      const apiKey = process.env.OPENWEATHERMAP_API_KEY;
      const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      const response = await fetch(weatherAPIUrl);
      if (!response.ok) throw new Error('Weather data fetch failed');

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- **File:** `src/lib/utils.ts`  
  - Add a helper function `getWeatherData(lat, lon)` that fetches data from your API route.
  ```typescript
  export async function getWeatherData(lat: number, lon: number) {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  ```

---

**3. Health Profile Registration**

- **File:** `src/app/profile/page.tsx`  
  - Create a form page for users to register their health profiles (e.g., name, age, diseases, condiciones).  
  - Use local component state for form handling and basic validation; show error messages when needed.  
- Optionally, create a reusable component:  
  **File:** `src/components/ProfileForm.tsx`  
  - Encapsulate the form UI and validation logic.  
  - Use modern typography and spacing (leveraging the styles in `src/app/globals.css`).

---

**4. Alerts Page Implementation**

- **File:** `src/app/alerts/page.tsx`  
  - Build an alerts page that queries the weather API (via `getWeatherData`) and cross-references the user’s health profile.  
  - Use a list component (e.g., an AlertList built using your `src/components/ui` primitives) to display each alert with a brief description.  
  - Implement error boundaries and loading states.

---

**5. Reports Page (Daily & Weekly)**

- **File:** `src/app/reports/page.tsx`  
  - Create charts and textual summaries using the available chart UI component (found in `src/components/ui/chart.tsx`).  
  - Display simulated or fetched historical data in both daily and weekly formats.  
  - Provide fallback UI on failure to fetch or process data.

---

**6. Symptom History Page**

- **File:** `src/app/history/page.tsx`  
  - Provide a form for users to report current symptoms and a list to display past submissions.  
  - Validate inputs and handle errors gracefully (e.g., missing descriptions).  
  - Optionally store data locally or simulate a history list using React state.

---

**7. Prevention Tips Page**

- **File:** `src/app/tips/page.tsx`  
  - Render educational prevention tips (e.g., stay hydrated, use sunscreen, avoid critical hours) with clean typography and spacing.  
  - Use an `<img>` tag for a relevant illustration with a placeholder URL:
  ```html
  <img src="https://placehold.co/800x600?text=Preventative+hydration+and+sun+protection+tips+illustration" 
       alt="Detailed+illustration+of+preventative+hydration+and+sun+protection+tips+in+a+minimal+design+layout" 
       onerror="this.onerror=null;this.src='fallback.png';" />
  ```

---

**8. Family Mode Page**

- **File:** `src/app/family/page.tsx`  
  - Allow the primary user to add and manage dependent profiles; include forms and list views.  
  - Handle validation errors and state updates in real time.

---

**9. Educational Content Page**

- **File:** `src/app/education/page.tsx`  
  - Display curated educational content about climate and health using clear headings, paragraphs, and proper spacing.  
  - Use simple, modern UI components and ensure text is legible on all devices.

---

**10. Dashboard/Home Page**

- **File:** `src/app/page.tsx`  
  - Update the home page to include a summary dashboard: current weather (using geolocation to fetch data), recent alerts, and quick links to profile and report pages.  
  - Use the browser’s Geolocation API and handle permissions gracefully with fallback locations if permission is denied.

---

**11. PWA and Push Notifications Integration**

- **Manifest File:** `public/manifest.json`  
  - Create or update the manifest with app name, short_name, start_url, display settings, theme_color, etc.
- **Service Worker:** `public/service-worker.js`  
  - Configure caching strategies and add event listeners to handle push notifications.
- **Push Notifications Component:**  
  **File:** `src/components/Notifications.tsx`  
  - In this component, on mount, request Notification permission and register the service worker.  
  - Listen for push messages and display them using the Notification API.
  - Include error handling if the browser does not support notifications.

---

**12. Global Styles & UI Enhancements**

- **File:** `src/app/globals.css`  
  - Update typography, spacing, and color variables to create a modern, responsive layout.  
  - Ensure all custom pages and UI components follow a consistent visual language.
- Use built-in UI components from `src/components/ui` for spacing, buttons, typography, and forms.

---

**13. Error Handling & Testing**

- Create an error boundary component:  
  **File:** `src/components/ErrorBoundary.tsx`  
  - Wrap major page components in this boundary to catch rendering errors.
- Test API endpoints using curl commands (e.g., a curl GET to `/api/weather` with lat/lon parameters) and validate response codes, times, and JSON content.
- Validate PWA functionality and push notifications in supported browsers.

---

**14. Documentation and Final Adjustments**

- Update **README.md** to include:  
  - Setup instructions (environment variables, obtaining the API key)  
  - How to run and test the PWA in development and production mode  
  - Notes on enabling push notifications and geolocation.  
- Perform manual tests to ensure responsive UI, proper error messages, and correct API behavior.

---

Summary:
- Environment and API integration files (.env.local, next.config.ts, and `src/app/api/weather/route.ts`) are set up with error handling.
- New pages for profile registration, alerts, reports, symptom history, prevention tips, family mode, and education are created in the Next.js app directory.
- UI improvements use modern typography and layout with custom components from `src/components/ui` and updated global styles.
- A service worker, manifest, and push notifications are integrated to enable full PWA functionality.
- Error boundaries and thorough documentation in README.md ensure best practices and ease of maintenance.
