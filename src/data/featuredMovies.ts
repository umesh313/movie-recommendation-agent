export interface FeaturedMovie {
  rank: number;
  title: string;
  year: number;
  imdbRating: number;
  votes: string;
}

export const featuredMovies: FeaturedMovie[] = [
  { rank: 1, title: "Knives Out", year: 2019, imdbRating: 7.9, votes: "880K" },
  { rank: 2, title: "Mulholland Drive", year: 2001, imdbRating: 7.9, votes: "429K" },
  { rank: 3, title: "Arrival", year: 2016, imdbRating: 7.9, votes: "866K" },
  { rank: 4, title: "Iron Man", year: 2008, imdbRating: 7.9, votes: "1.2M" },
  { rank: 5, title: "Avatar", year: 2009, imdbRating: 7.9, votes: "1.5M" },
  { rank: 6, title: "Bohemian Rhapsody", year: 2018, imdbRating: 7.9, votes: "648K" },
  { rank: 7, title: "Edge of Tomorrow", year: 2014, imdbRating: 7.9, votes: "806K" },
  { rank: 8, title: "Apocalypto", year: 2006, imdbRating: 7.9, votes: "360K" },
  { rank: 9, title: "Mystic River", year: 2003, imdbRating: 7.9, votes: "523K" },
  { rank: 10, title: "Children of Men", year: 2006, imdbRating: 7.9, votes: "567K" },
  { rank: 11, title: "Thor: Ragnarok", year: 2017, imdbRating: 7.9, votes: "897K" },
  { rank: 12, title: "Harry Potter and the Prisoner of Azkaban", year: 2004, imdbRating: 7.9, votes: "768K" },
  { rank: 13, title: "The Perks of Being a Wallflower", year: 2012, imdbRating: 7.9, votes: "598K" },
  { rank: 14, title: "Guardians of the Galaxy Vol. 3", year: 2023, imdbRating: 7.9, votes: "473K" },
  { rank: 15, title: "Star Trek", year: 2009, imdbRating: 7.9, votes: "639K" },
  { rank: 16, title: "Perfect Days", year: 2023, imdbRating: 7.9, votes: "107K" },
  { rank: 17, title: "Almost Famous", year: 2000, imdbRating: 7.9, votes: "315K" },
  { rank: 18, title: "Jojo Rabbit", year: 2019, imdbRating: 7.9, votes: "489K" },
  { rank: 19, title: "The Holdovers", year: 2023, imdbRating: 7.9, votes: "262K" },
  { rank: 20, title: "In Bruges", year: 2008, imdbRating: 7.9, votes: "494K" },
  { rank: 21, title: "Life of Pi", year: 2012, imdbRating: 7.9, votes: "701K" },
  { rank: 22, title: "Zack Snyder's Justice League", year: 2021, imdbRating: 7.9, votes: "474K" },
  { rank: 23, title: "Fantastic Mr. Fox", year: 2009, imdbRating: 7.9, votes: "306K" },
  { rank: 24, title: "District 9", year: 2009, imdbRating: 7.9, votes: "753K" },
  { rank: 25, title: "X-Men: Days of Future Past", year: 2014, imdbRating: 7.9, votes: "789K" },
  { rank: 26, title: "Dallas Buyers Club", year: 2013, imdbRating: 7.9, votes: "549K" },
  { rank: 27, title: "Wonder", year: 2017, imdbRating: 7.9, votes: "197K" },
  { rank: 28, title: "Puss in Boots: The Last Wish", year: 2022, imdbRating: 7.9, votes: "226K" },
  { rank: 29, title: "Boyhood", year: 2014, imdbRating: 7.9, votes: "382K" },
  { rank: 30, title: "Shoplifters", year: 2018, imdbRating: 7.9, votes: "96K" },
  { rank: 31, title: "4 Months 3 Weeks and 2 Days", year: 2007, imdbRating: 7.9, votes: "66K" },
  { rank: 32, title: "Dancer in the Dark", year: 2000, imdbRating: 7.9, votes: "124K" },
  { rank: 33, title: "Hero", year: 2002, imdbRating: 7.9, votes: "194K" },
  { rank: 34, title: "The Wrestler", year: 2008, imdbRating: 7.9, votes: "331K" },
  { rank: 35, title: "Amour", year: 2012, imdbRating: 7.9, votes: "111K" },
  { rank: 36, title: "Togo", year: 2019, imdbRating: 7.9, votes: "62K" },
  { rank: 37, title: "The Raid 2", year: 2014, imdbRating: 7.9, votes: "139K" },
  { rank: 38, title: "Nine Queens", year: 2000, imdbRating: 7.9, votes: "63K" },
  { rank: 39, title: "The Sea Inside", year: 2004, imdbRating: 7.9, votes: "89K" },
  { rank: 40, title: "Icarus", year: 2017, imdbRating: 7.9, votes: "58K" },
  { rank: 41, title: "Short Term 12", year: 2013, imdbRating: 7.9, votes: "96K" },
  { rank: 42, title: "The Chorus", year: 2004, imdbRating: 7.9, votes: "72K" },
  { rank: 43, title: "About Elly", year: 2009, imdbRating: 7.9, votes: "61K" },
  { rank: 44, title: "Bowling for Columbine", year: 2002, imdbRating: 7.9, votes: "152K" },
  { rank: 45, title: "Exit Through the Gift Shop", year: 2010, imdbRating: 7.9, votes: "70K" },
  { rank: 46, title: "Baby", year: 2015, imdbRating: 7.9, votes: "63K" },
  { rank: 47, title: "No Man's Land", year: 2001, imdbRating: 7.9, votes: "51K" },
  { rank: 48, title: "Airlift", year: 2016, imdbRating: 7.9, votes: "62K" },
  { rank: 49, title: "The Batman", year: 2022, imdbRating: 7.8, votes: "931K" },
  { rank: 50, title: "The Gentlemen", year: 2019, imdbRating: 7.8, votes: "458K" },
];

export function getFeaturedMoviesByGenre(genreKeywords: string[]): FeaturedMovie[] {
  const lowerKeywords = genreKeywords.map(k => k.toLowerCase());
  
  // Map genres to movies that typically fit those categories
  const genreMovieMap: Record<string, string[]> = {
    'action': ['Iron Man', 'Thor: Ragnarok', 'The Batman', 'Edge of Tomorrow', 'Avatar', 'Star Trek', 'X-Men: Days of Future Past', "Zack Snyder's Justice League", 'The Raid 2'],
    'sci-fi': ['Arrival', 'Avatar', 'Edge of Tomorrow', 'Children of Men', 'Star Trek', 'District 9', 'X-Men: Days of Future Past', "Zack Snyder's Justice League"],
    'science fiction': ['Arrival', 'Avatar', 'Edge of Tomorrow', 'Children of Men', 'Star Trek', 'District 9', 'X-Men: Days of Future Past', "Zack Snyder's Justice League"],
    'comedy': ['Knives Out', 'Jojo Rabbit', 'The Holdovers', 'In Bruges', 'Fantastic Mr. Fox', 'The Gentlemen', 'Guardians of the Galaxy Vol. 3', 'Thor: Ragnarok'],
    'drama': ['Mystic River', 'Boyhood', 'Dallas Buyers Club', 'The Wrestler', 'Amour', 'Shoplifters', '4 Months 3 Weeks and 2 Days', 'The Sea Inside', 'Wonder', 'The Perks of Being a Wallflower', 'Short Term 12', 'About Elly'],
    'thriller': ['Knives Out', 'Mulholland Drive', 'In Bruges', 'The Batman', 'The Gentlemen', 'Nine Queens', 'No Man\'s Land'],
    'horror': ['Dancer in the Dark', 'Apocalypto'],
    'animation': ['Fantastic Mr. Fox', 'Puss in Boots: The Last Wish', 'Guardians of the Galaxy Vol. 3'],
    'fantasy': ['Harry Potter and the Prisoner of Azkaban', 'Avatar', 'Fantastic Mr. Fox', 'Life of Pi', 'Thor: Ragnarok'],
    'romance': ['About Elly', 'Almost Famous', 'The Perks of Being a Wallflower'],
    'musical': ['Bohemian Rhapsody'],
    'biography': ['Bohemian Rhapsody', 'Dallas Buyers Club', 'The Wrestler', 'Togo'],
    'sport': ['The Wrestler'],
    'war': ['Apocalypto', 'Airlift'],
    'documentary': ['Icarus', 'Bowling for Columbine', 'Exit Through the Gift Shop'],
    'crime': ['Knives Out', 'Mystic River', 'The Gentlemen', 'Nine Queens', 'The Batman', 'In Bruges'],
    'mystery': ['Knives Out', 'Mulholland Drive', 'In Bruges', 'The Batman'],
    'adventure': ['Avatar', 'Life of Pi', 'Star Trek', 'Harry Potter and the Prisoner of Azkaban', 'Guardians of the Galaxy Vol. 3', 'Thor: Ragnarok'],
    'family': ['Wonder', 'Harry Potter and the Prisoner of Azkaban', 'Fantastic Mr. Fox', 'Puss in Boots: The Last Wish'],
    'international': ['Shoplifters', '4 Months 3 Weeks and 2 Days', 'Hero', 'Amour', 'About Elly', 'The Chorus', 'Nine Queens', 'The Sea Inside', 'No Man\'s Land', 'Airlift', 'Baby'],
    'foreign': ['Shoplifters', '4 Months 3 Weeks and 2 Days', 'Hero', 'Amour', 'About Elly', 'The Chorus', 'Nine Queens', 'The Sea Inside', 'No Man\'s Land', 'Airlift', 'Baby'],
    'korean': [],
    'spanish': [],
    'french': ['Amour', 'The Chorus'],
    'bollywood': ['Airlift', 'Baby'],
    'indian': ['Airlift', 'Baby', 'Hero'],
  };

  let matchedTitles: string[] = [];
  
  for (const keyword of lowerKeywords) {
    // Check for exact matches and partial matches
    for (const [genre, movies] of Object.entries(genreMovieMap)) {
      if (genre.includes(keyword) || keyword.includes(genre)) {
        matchedTitles = [...matchedTitles, ...movies];
      }
    }
  }

  // Remove duplicates and return featured movies that match
  const uniqueTitles = [...new Set(matchedTitles)];
  return featuredMovies.filter(movie => uniqueTitles.includes(movie.title));
}

export function getFeaturedMoviesByRating(minRating: number = 7.8, maxRating: number = 7.9): FeaturedMovie[] {
  return featuredMovies.filter(movie => 
    movie.imdbRating >= minRating && movie.imdbRating <= maxRating
  );
}

export function getRandomFeaturedMovies(count: number = 5): FeaturedMovie[] {
  const shuffled = [...featuredMovies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getShuffledFeaturedMovies(count: number = 10): FeaturedMovie[] {
  // Create a copy of the movies array and shuffle it using Fisher-Yates algorithm
  const shuffled = [...featuredMovies];
  
  // Fisher-Yates shuffle - ensures true randomness
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the requested number of movies
  return shuffled.slice(0, count);
}
