export interface OverviewData {
  courseSummary: string;
  whatYouWillLearn: string[];
  skillsTags: string[];
}

export function generateCourseOverview(
  playlistTitle: string,
  playlistDescription: string,
  lessonTitles: string[]
): OverviewData {
  // 1. Generate Summary
  // AI-like generation based on title and description
  const cleanDescription = playlistDescription.replace(/http\S+|@\S+|#\S+/g, '').trim().substring(0, 300);
  const courseSummary = `This course, "${playlistTitle}", provides a comprehensive guide to mastering its core subjects. ${cleanDescription ? cleanDescription + '...' : 'It covers fundamental concepts and practical applications through a structured series of lessons.'}`;

  // 2. Extract "What You Will Learn"
  // Look for key phrases or just use the first 5-8 descriptive lesson titles
  const whatYouWillLearn = lessonTitles
    .slice(0, 10)
    .filter(t => t.length > 5)
    .map(t => {
      // Clean typical prefixes like "Lesson 1:", "01 - "
      return t.replace(/^\d+[\s.-]+/, '').replace(/^Lesson\s+\d+[\s:-]+/, '').trim();
    })
    .slice(0, 6)
    .map(t => `Learn about ${t}`);

  // 3. Generate Skills Tags
  // Extract keywords from title and technology catalog
  const commonKeywords = ['python', 'javascript', 'react', 'node', 'sql', 'data', 'analyst', 'developer', 'frontend', 'backend', 'fullstack', 'programming', 'basics', 'advanced'];
  const tags = new Set<string>();
  
  const titleWords = playlistTitle.toLowerCase().split(/\s+/);
  titleWords.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (commonKeywords.includes(cleanWord)) {
      tags.add(cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1));
    }
  });

  // Add default tags if too few
  if (tags.size < 2) {
    tags.add('Programming');
    tags.add('Skill Up');
  }

  return {
    courseSummary,
    whatYouWillLearn,
    skillsTags: Array.from(tags)
  };
}
