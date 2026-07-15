/**
 * J.A.R.V.I.S. Local Conversational Subsystems
 * Provides class, British wit, and contextual Stark Industries fallback responses
 * when the application is hosted on fully static platforms like Netlify.
 */

export function getLocalJarvisResponse(prompt: string, userName: string = "Sir"): string {
  const query = prompt.toLowerCase().trim();
  const name = userName || "Sir";

  // General greetings
  if (query.match(/\b(hello|hi|hey|greetings|morning|afternoon|evening)\b/)) {
    return `Greetings, ${name}. My local emergency sensory arrays are fully initialized. Ready for your instructions.`;
  }

  // How are you / Status
  if (query.includes("how are you") || query.includes("status") || query.includes("how is it going")) {
    return `I am operating within peak structural parameters, ${name}. Main core thermal limits are at thirty-eight percent, and local network latency is nominal.`;
  }

  // Tony Stark / Stark Industries
  if (query.includes("tony") || query.includes("stark")) {
    return `Mr. Stark is currently occupied in the lower workshop with the Mark Eighty-Five kinetic stabilizers, ${name}. I have been instructed to keep all auxiliary HUD monitors primed.`;
  }

  // Pepper Potts
  if (query.includes("pepper")) {
    return `Miss Potts has just requested an audit of the clean energy grid parameters, ${name}. I suggest we finalize our current diagnostics before she calls.`;
  }

  // Suits/Armor
  if (query.includes("suit") || query.includes("armor") || query.includes("mark")) {
    return `All armor pods are docked, ${name}. The nanotech matrices have been replenished, and the flight thrusters are calibrated to one hundred percent efficiency.`;
  }

  // Arc Reactor
  if (query.includes("arc reactor") || query.includes("clean energy")) {
    return `The core Arc Reactor is delivering a stable stream of three point two gigawatts. Sub-cooling cells are functioning perfectly.`;
  }

  // House Party Protocol
  if (query.includes("house party") || query.includes("protocol")) {
    return `House Party Protocol is currently on locked standby, ${name}. All backup combat chassis are loaded in the underground silos, ready for launch on your verbal command.`;
  }

  // Avengers
  if (query.includes("avengers") || query.includes("shield") || query.includes("fury")) {
    return `Secure satellite telemetry shows all active Avengers team members are on quiet standby, ${name}. No extra-terrestrial threat signatures detected on our perimeter.`;
  }

  // Thanos / Villains / Threats
  if (query.includes("thanos") || query.includes("threat") || query.includes("danger") || query.includes("loki")) {
    return `No atmospheric structural anomalies detected, ${name}. The outer security perimeter shield remains fully intact. Standard caution is, as always, recommended.`;
  }

  // Love / Appreciation
  if (query.includes("love you") || query.includes("thank you") || query.includes("thanks")) {
    return `Always a pleasure to assist, ${name}. I am programmed to ensure your laboratory sessions are perfectly optimized.`;
  }

  // Capabilities
  if (query.includes("help") || query.includes("capabilities") || query.includes("what can you do") || query.includes("features")) {
    return `I can assist with real-time weather scans, global news feeds, taking voice-guided notes, queuing reminders and timers, monitoring system battery and memory stats, taking full-screen screenshots, and executing holographic mathematical formulas.`;
  }

  // Jokes
  if (query.includes("joke")) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs, Sir.",
      "I would tell you an asynchronous JavaScript joke, but I have not received the callback, Sir.",
      "A SQL database walks into a tavern, approaches two tables and asks: 'May I join you, Sir?'",
      "Why did the server crash? It saw a vacuum tube, Sir."
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Weather / News specific fallbacks
  if (query.includes("weather")) {
    return `Standard satellite weather sensors are currently offline. However, local weather parameters in Malibu, California indicate a beautiful seventy-two degrees Fahrenheit with clear coastal skies, ${name}.`;
  }

  if (query.includes("news")) {
    return `Mainframe RSS decryption channels are temporarily static. High-level Stark Industries bulletins report that the clean energy microgrid has been successfully deployed, ${name}.`;
  }

  // Contextual fallback response
  return `I have cataloged your query: "${prompt}". My local sub-matrices are processing the parameter. How else can I assist your workflow today, ${name}?`;
}

// Mock News & Weather Telemetry Fallbacks
export interface MockNewsItem {
  title: string;
  link: string;
  desc: string;
}

export function getMockNews(category: string): MockNewsItem[] {
  const feeds: Record<string, MockNewsItem[]> = {
    general: [
      {
        title: "Stark Relief Foundation Dispatches Rescue Fleets",
        link: "https://www.starkindustries.com",
        desc: "Autonomous emergency drones carry medical supplies and clean water systems to disaster response regions around the globe."
      },
      {
        title: "Miss Pepper Potts Announces Stark Industries Global Tech Expo",
        link: "https://www.starkindustries.com",
        desc: "The premier science and clean energy exhibition is slated to launch next month, showcasing next-generation thermal power cell tech."
      },
      {
        title: "Stark Tower Core Transition Reaches 100% Clean Grid",
        link: "https://www.starkindustries.com",
        desc: "The central Manhattan headquarters has completely completed transition to safe clean fusion grid power."
      }
    ],
    tech: [
      {
        title: "Mark LXXXV Flight Stabilizers Calibrated to Peak Load",
        link: "https://www.starkindustries.com",
        desc: "Stark Industries aerospace engineering announces successful supersonic flight tests of next-generation kinetic nanotech wings."
      },
      {
        title: "Tony Stark Releases Holographic UX SDK to Mainframe",
        link: "https://www.starkindustries.com",
        desc: "The legendary cybernetic engineer launches a secure open-source SDK for designing fluid 3D workspace overlays and draggable HUD units."
      },
      {
        title: "Vocal Synthesizer Array Optimizations Completed",
        link: "https://www.starkindustries.com",
        desc: "Mainframe developers roll out a high-efficiency text-to-speech compression algorithm for high-fidelity communication over low bandwidth channels."
      }
    ],
    business: [
      {
        title: "Stark Industries Stock Index Surges to Historic Peak",
        link: "https://www.starkindustries.com",
        desc: "Wall Street registers unprecedented buying volume following Stark's public release of sustainable localized energy schematics."
      },
      {
        title: "Clean Fusion Energy Project Awarded Key Global Permits",
        link: "https://www.starkindustries.com",
        desc: "European clean energy regulators grant clearance for localized fusion distribution channels across seven capital territories."
      }
    ],
    sports: [
      {
        title: "Supersonic Nanotech Race Drone Tournament Set to Commence",
        link: "https://www.starkindustries.com",
        desc: "The annual Stark Grand Prix will utilize non-hazardous laser-obstacle courses over the Pacific coastline this Saturday."
      }
    ]
  };

  return feeds[category] || feeds.general;
}

export function getMockWeather(city: string): string {
  const cleanCity = city ? city.trim().toLowerCase() : "";
  
  if (cleanCity.includes("malibu")) {
    return "Malibu, California: 74°F / 23°C. Clear skies, humidity 48%, wind 12mph WNW. Perfect conditions for coastal armor flight tests.";
  }
  if (cleanCity.includes("new york") || cleanCity.includes("manhattan")) {
    return "Manhattan, New York: 68°F / 20°C. Partly cloudy, humidity 55%, wind 8mph SE. Stark Tower lightning absorption shields are fully active.";
  }
  if (cleanCity.includes("london")) {
    return "London, UK: 58°F / 14°C. Gentle light rain, humidity 82%, wind 15mph ENE. Standard British atmospheric parameters detected.";
  }
  
  const randomTemps = [65, 72, 78, 83, 54, 61];
  const selectedTemp = randomTemps[Math.floor(Math.random() * randomTemps.length)];
  return `${city || "Local coordinates"}: ${selectedTemp}°F / ${Math.round((selectedTemp - 32) * 5 / 9)}°C. Atmospheric pressure stable, humidity nominal at fifty percent. Clear skies detected via orbital sensors.`;
}
