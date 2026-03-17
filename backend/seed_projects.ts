import { query } from './src/config/db';

async function seed() {
  const projects = [
    {
      title: 'Python Web Scraper',
      description: 'Build a tool that extracts product prices from e-commerce websites and saves them to a CSV file.',
      technology: 'Python',
      difficulty: 'Beginner',
      estimated_hours: 4,
      steps: [
        'Setup a virtual environment and install BeautifulSoup and requests.',
        'Research the target website structure and identify data points.',
        'Implement the scraping logic and handle pagination.',
        'Export the collected data to a structured CSV format.'
      ],
      skills: ['Python', 'Web Scraping', 'Data Processing']
    },
    {
      title: 'React Task Manager',
      description: 'Create a modern task management application with drag-and-drop support and persistent storage.',
      technology: 'React',
      difficulty: 'Intermediate',
      estimated_hours: 10,
      steps: [
        'Initialize a React project with Vite.',
        'Design the UI using Tailwind CSS.',
        'Implement drag-and-drop functionality using dnd-kit or react-beautiful-dnd.',
        'Integrate Firebase or Supabase for real-time data persistence.'
      ],
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management']
    },
    {
      title: 'AI Image Generator',
      description: 'Develop a web interface for generating images from text prompts using OpenAI or Stability AI APIs.',
      technology: 'Next.js',
      difficulty: 'Advanced',
      estimated_hours: 15,
      steps: [
        'Setup a Next.js 14 project with App Router.',
        'Implement API routes to communicate with the OpenAI DALL-E 3 API.',
        'Build a responsive frontend for prompt input and image display.',
        'Add features for saving and sharing generated images.'
      ],
      skills: ['Next.js', 'API Integration', 'Generative AI', 'Cloud Storage']
    },
    {
      title: 'REST API with Express',
      description: 'Build a secure and scalable RESTful API for a blog platform with authentication.',
      technology: 'Node.js',
      difficulty: 'Intermediate',
      estimated_hours: 8,
      steps: [
        'Setup Express.js and TypeScript.',
        'Implement JWT-based authentication.',
        'Design a MySQL database schema using Prisma.',
        'Create CRUD endpoints for posts and comments.'
      ],
      skills: ['Node.js', 'Express', 'MySQL', 'JWT']
    }
  ];

  console.log('Seeding projects...');
  for (const p of projects) {
    await query(
      `INSERT INTO projects (title, description, technology, difficulty, estimated_hours, steps_json, skills_required_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.title, p.description, p.technology, p.difficulty, p.estimated_hours, JSON.stringify(p.steps), JSON.stringify(p.skills)]
    );
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
