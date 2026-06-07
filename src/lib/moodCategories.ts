import type { MoodCategory } from "@/types/movie";

export const moodCategories: MoodCategory[] = [
  {
    id: "mind-bending",
    name: "Mind-Bending",
    description: "Films that challenge your perception of reality",
    icon: "🧠",
    associatedGenres: [878, 9648, 53], // Sci-Fi, Mystery, Thriller
    keywords: ["mind-bending", "psychological", "surreal", "twist", "cerebral", "thought-provoking"],
  },
  {
    id: "feel-good",
    name: "Feel-Good",
    description: "Uplifting movies that leave you smiling",
    icon: "😊",
    associatedGenres: [35, 10749, 16], // Comedy, Romance, Animation
    keywords: ["feel-good", "uplifting", "heartwarming", "happy", "cheerful", "wholesome"],
  },
  {
    id: "emotional",
    name: "Emotional",
    description: "Deeply moving films that touch your heart",
    icon: "💔",
    associatedGenres: [18], // Drama
    keywords: ["emotional", "moving", "touching", "poignant", "heartfelt", "tearjerker"],
  },
  {
    id: "date-night",
    name: "Date Night",
    description: "Perfect movies for a romantic evening",
    icon: "🌹",
    associatedGenres: [10749, 35], // Romance, Comedy
    keywords: ["date night", "romantic", "romance", "couples", "anniversary"],
  },
  {
    id: "family-friendly",
    name: "Family Friendly",
    description: "Great for watching with the whole family",
    icon: "👨‍👩‍👧‍👦",
    associatedGenres: [16, 10751, 12], // Animation, Family, Adventure
    keywords: ["family", "kids", "children", "all ages", "wholesome"],
  },
  {
    id: "heartwarming",
    name: "Heartwarming",
    description: "Stories that restore your faith in humanity",
    icon: "🤗",
    associatedGenres: [18, 10751], // Drama, Family
    keywords: ["heartwarming", "inspiring", "uplifting", "hopeful", "touching"],
  },
  {
    id: "dark-intense",
    name: "Dark & Intense",
    description: "Gripping films with dark themes and tension",
    icon: "🌑",
    associatedGenres: [80, 53, 27], // Crime, Thriller, Horror
    keywords: ["dark", "intense", "gritty", "disturbing", "heavy", "bleak"],
  },
  {
    id: "horror",
    name: "Horror",
    description: "Terrifying films to scare you senseless",
    icon: "😱",
    associatedGenres: [27], // Horror
    keywords: ["horror", "scary", "terrifying", "creepy", "haunting", "spooky"],
  },
  {
    id: "thriller",
    name: "Thriller",
    description: "Edge-of-your-seat suspenseful experiences",
    icon: "😰",
    associatedGenres: [53, 80], // Thriller, Crime
    keywords: ["thriller", "suspenseful", "tense", "gripping", "edge-of-seat"],
  },
  {
    id: "motivational",
    name: "Motivational",
    description: "Films that inspire you to take action",
    icon: "💪",
    associatedGenres: [18, 36], // Drama, History
    keywords: ["motivational", "inspiring", "determined", "perseverance", "triumph"],
  },
  {
    id: "inspirational",
    name: "Inspirational",
    description: "Stories that elevate your spirit",
    icon: "✨",
    associatedGenres: [18, 36, 10752], // Drama, History, War
    keywords: ["inspirational", "uplifting", "triumphant", "heroic", "noble"],
  },
  {
    id: "action-packed",
    name: "Action-Packed",
    description: "Adrenaline-fueled excitement from start to finish",
    icon: "💥",
    associatedGenres: [28, 12], // Action, Adventure
    keywords: ["action", "explosive", "adrenaline", "exciting", "thrilling", "stunts"],
  },
  {
    id: "suspenseful",
    name: "Suspenseful",
    description: "Keep you guessing until the very end",
    icon: "🔍",
    associatedGenres: [9648, 53], // Mystery, Thriller
    keywords: ["suspenseful", "mystery", "puzzle", "whodunit", "twists"],
  },
  {
    id: "comfort",
    name: "Comfort Movies",
    description: "Your go-to movies for a cozy night in",
    icon: "🍿",
    associatedGenres: [35, 10749, 18], // Comedy, Romance, Drama
    keywords: ["comfort", "cozy", "rewatch", "familiar", "relaxing"],
  },
  {
    id: "sad-beautiful",
    name: "Sad But Beautiful",
    description: "Melancholic masterpieces that move you deeply",
    icon: "🌧️",
    associatedGenres: [18, 10749], // Drama, Romance
    keywords: ["sad", "melancholy", "beautiful", "poetic", "bittersweet", "tragic"],
  },
];

export function getMoodById(id: string): MoodCategory | undefined {
  return moodCategories.find((m) => m.id === id);
}

export function getMoodsByKeywords(keywords: string[]): MoodCategory[] {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  const scoredMoods = moodCategories.map((mood) => {
    let score = 0;
    for (const keyword of lowerKeywords) {
      if (mood.keywords.some((k) => k.includes(keyword) || keyword.includes(k))) {
        score++;
      }
      if (mood.name.toLowerCase().includes(keyword)) {
        score += 2;
      }
    }
    return { mood, score };
  });

  return scoredMoods
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.mood);
}

export function getMoodGenres(moodIds: string[]): number[] {
  const genreSet = new Set<number>();
  for (const moodId of moodIds) {
    const mood = getMoodById(moodId);
    if (mood) {
      for (const genre of mood.associatedGenres) {
        genreSet.add(genre);
      }
    }
  }
  return Array.from(genreSet);
}

export function getAllMoodKeywords(): string[] {
  return moodCategories.flatMap((m) => m.keywords);
}