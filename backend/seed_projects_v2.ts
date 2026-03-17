import { execute } from "./src/config/db";

const projects = [
  // Python Projects
  {
    title: "Python CLI Tool",
    description: "Build a command-line interface tool that automates system tasks.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 4,
    skills_required: ["Python", "Argparse", "FS"],
    steps: ["Setup environment", "Define CLI arguments", "Implement file operations", "Add help documentation"]
  },
  {
    title: "REST API Server",
    description: "Create a fast and scalable REST API using Flask or FastAPI.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 10,
    skills_required: ["Python", "FastAPI", "SQLAlchemy"],
    steps: ["Design API endpoints", "Setup database models", "Implement CRUD operations", "Add authentication"]
  },
  {
    title: "Web Scraper",
    description: "Extract data from websites using BeautifulSoup and Selenium.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 8,
    skills_required: ["Python", "BeautifulSoup", "Research"],
    steps: ["Inspect target website", "Handle pagination", "Clean extracted data", "Export to CSV/JSON"]
  },
  {
    title: "Data Analyzer",
    description: "Analyze large datasets using Pandas and NumPy.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 12,
    skills_required: ["Python", "Pandas", "Matplotlib"],
    steps: ["Load dataset", "Handle missing values", "Perform statistical analysis", "Visualize trends"]
  },
  {
    title: "File Organizer",
    description: "A script to organize files in a directory based on extensions.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 3,
    skills_required: ["Python", "OS Module", "IO"],
    steps: ["Define directory path", "Classify extensions", "Move files to folders", "Add logging"]
  },
  {
    title: "Password Manager",
    description: "A secure CLI tool to store and manage your passwords.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 6,
    skills_required: ["Python", "Cryptography", "SQLite"],
    steps: ["Setup master password", "Implement encryption", "Store encrypted data", "CLI interface"]
  },
  {
    title: "Weather App (CLI)",
    description: "Fetch and display weather information using an API.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 4,
    skills_required: ["Python", "Requests", "API"],
    steps: ["Get API key", "Process JSON data", "Format output", "Error handling"]
  },
  {
    title: "Markdown to HTML Converter",
    description: "Convert markdown files into clean, semantic HTML.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 5,
    skills_required: ["Python", "Regex", "HTML"],
    steps: ["Read MD file", "Map markdown tags", "Generate HTML string", "Write to output file"]
  },
  {
    title: "Expense Tracker (CLI)",
    description: "Manage your daily expenses via the terminal.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 5,
    skills_required: ["Python", "CSV", "Data Management"],
    steps: ["Capture expense input", "Calculate totals", "Generate monthly summary", "Persistence"]
  },
  {
    title: "Simple Chatbot",
    description: "Build a rule-based chatbot for basic interactions.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 6,
    skills_required: ["Python", "NLP Basics", "Logic"],
    steps: ["Define intents", "Match patterns", "Process responses", "Loop interaction"]
  },
  {
    title: "Image Metadata Extractor",
    description: "Extract EXIF data from images using Python libraries.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 5,
    skills_required: ["Python", "Pillow", "Exif"],
    steps: ["Load image file", "Extract tags", "Format details", "Display info"]
  },
  {
    title: "URL Shortener (API)",
    description: "Build a backend service that generates short URLs.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 8,
    skills_required: ["Python", "Redis", "FastAPI"],
    steps: ["Setup hashing logic", "Store in Redis", "Redirect endpoint", "API key protection"]
  },
  {
    title: "Stock Price Notifier",
    description: "Get email alerts when a stock price reaches a limit.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 7,
    skills_required: ["Python", "OAuth", "API Integration"],
    steps: ["Fetch stock data", "Check price threshold", "Setup SMTP/Email", "Schedule script"]
  },
  {
    title: "System Resource Monitor",
    description: "Track CPU and Memory usage in real-time.",
    technology: "Python",
    difficulty: "Intermediate",
    estimated_hours: 6,
    skills_required: ["Python", "psutil", "Visualization"],
    steps: ["Monitor stats", "Display in dashboard", "Alert on high usage", "Logging"]
  },
  {
    title: "Unit Converter",
    description: "A flexible tool to convert between various units.",
    technology: "Python",
    difficulty: "Beginner",
    estimated_hours: 4,
    skills_required: ["Python", "Math", "Logic"],
    steps: ["Define conversion rates", "User input", "Calculate result", "Support multiple types"]
  },

  // JavaScript Projects
  {
    title: "Todo App",
    description: "The classic todo application with local storage persistence.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 4,
    skills_required: ["Javascript", "DOM", "Local Storage"],
    steps: ["Build UI", "Implement add/delete", "Add persistent storage", "Filtering functionality"]
  },
  {
    title: "Weather Dashboard",
    description: "Fetch dynamic weather data and update the UI in real-time.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 6,
    skills_required: ["Javascript", "Fetch API", "DOM"],
    steps: ["Setup OpenWeather API", "Search functionality", "Dynamic background icons", "5-day forecast"]
  },
  {
    title: "API Data Viewer",
    description: "Build a tool that fetches and visualizes data from any public API.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 8,
    skills_required: ["Javascript", "Asynchronous JS", "Styling"],
    steps: ["Input API URL", "Display JSON data", "Implement search/filter", "Responsive grid layout"]
  },
  {
    title: "Chat Application",
    description: "A real-time chat app using WebSockets.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 15,
    skills_required: ["Javascript", "Socket.io", "Node.js"],
    steps: ["Setup server", "Emit messages", "Display online users", "Add chat rooms"]
  },
  {
    title: "Calculator (Neumorphic)",
    description: "Build a fully functional calculator with a modern neumorphic design.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 5,
    skills_required: ["Javascript", "CSS Grid", "Logic"],
    steps: ["HTML structure", "Neumorphic styling", "Math logic", "Keyboard support"]
  },
  {
    title: "Typing Speed Tester",
    description: "Measure words per minute and accuracy.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 6,
    skills_required: ["Javascript", "Timer logic", "String manipulation"],
    steps: ["Generate random text", "Start timer on input", "Calculate WPM/Accuracy", "Show results"]
  },
  {
    title: "Quiz App",
    description: "Educational quiz with multiple categories and a score tracker.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 7,
    skills_required: ["Javascript", "State management", "JSON"],
    steps: ["Define questions", "Timer logic", "Progress track", "Final score screen"]
  },
  {
    title: "Dynamic Form Validator",
    description: "Real-time client-side validation for complex forms.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 4,
    skills_required: ["Javascript", "Regex", "Events"],
    steps: ["Input event listeners", "Regex checks", "Show/hide error messages", "Password strength"]
  },
  {
    title: "Recipe Search Engine",
    description: "Search for recipes by ingredients using an API.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 10,
    skills_required: ["Javascript", "Fetch API", "UI Design"],
    steps: ["Recipe API integration", "Filter by diet", "Detail view modal", "Bookmarks"]
  },
  {
    title: "Movie Seat Booking",
    description: "Select movie and seats, calculate price, and persist choice.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 5,
    skills_required: ["Javascript", "DOM", "Local Storage"],
    steps: ["Seat grid UI", "Click selection", "Calculate total", "Save to storage"]
  },
  {
    title: "Flashcards App",
    description: "Memorization tool with flip animations.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 6,
    skills_required: ["Javascript", "CSS Animations", "DOM"],
    steps: ["Card flip logic", "Add new cards", "Delete cards", "Study mode"]
  },
  {
    title: "Pomodoro Timer",
    description: "A productivity timer with custom work/break intervals.",
    technology: "JavaScript",
    difficulty: "Beginner",
    estimated_hours: 5,
    skills_required: ["Javascript", "setInterval", "Audio API"],
    steps: ["Timer circular display", "Play/Pause/Reset", "Sound notifications", "Custom settings"]
  },
  {
    title: "Expense Tracker (Web)",
    description: "Visual expense tracker with charts.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 9,
    skills_required: ["Javascript", "Chart.js", "Logic"],
    steps: ["Data entry form", "History list", "Dynamic pie chart", "Income/Expense balance"]
  },
  {
    title: "Kanban Board",
    description: "Drag-and-drop task management tool.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 12,
    skills_required: ["Javascript", "Drag and Drop API", "Styling"],
    steps: ["Define columns", "Draggable items", "Column drop zones", "Local persistence"]
  },
  {
    title: "Music Player UI",
    description: "Build the interface and basic logic for a music player.",
    technology: "JavaScript",
    difficulty: "Intermediate",
    estimated_hours: 8,
    skills_required: ["Javascript", "Audio API", "Animations"],
    steps: ["Play/Pause logic", "Progress seek bar", "Playlist management", "Volume control"]
  },

  // React Projects
  {
    title: "Task Manager",
    description: "A feature-rich Trello-like task manager built with React.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 14,
    skills_required: ["React", "Custom Hooks", "Context API"],
    steps: ["Architecture planning", "State management", "Drag and drop integration", "Backend sync"]
  },
  {
    title: "Dashboard UI",
    description: "A premium admin dashboard with data visualizations and analytics.",
    technology: "React",
    difficulty: "Advanced",
    estimated_hours: 20,
    skills_required: ["React", "Chart.js", "Responsive Design"],
    steps: ["Setup layout components", "Integrate data charts", "Implement dark mode", "Add interactive filtering"]
  },
  {
    title: "Portfolio Website",
    description: "Create a modern, high-performance portfolio to showcase your work.",
    technology: "React",
    difficulty: "Beginner",
    estimated_hours: 12,
    skills_required: ["React", "Framer Motion", "Next.js"],
    steps: ["Design homepage", "Project gallery", "Contact form", "SEO optimization"]
  },
  {
    title: "E-commerce Store Mockup",
    description: "A full e-commerce checkout flow with cart management.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 18,
    skills_required: ["React", "Redux", "Payment APIs"],
    steps: ["Product listing", "Cart functionality", "Stripe integration", "Checkout logic"]
  },
  {
    title: "Notes Taking App",
    description: "Build a Google Keep clone with rich text support.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 12,
    skills_required: ["React", "TipTap", "Firebase"],
    steps: ["Rich text editor", "Tagging system", "Real-time sync", "Archive/Search"]
  },
  {
    title: "Social Media Feed",
    description: "Build an Instagram/Twitter feed mockup.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 15,
    skills_required: ["React", "Infinite Scroll", "Media handling"],
    steps: ["Post component", "Like/Comment logic", "Profile view", "Image uploading"]
  },
  {
    title: "Cryptocurrency Tracker",
    description: "Track real-time prices of top cryptocurrencies.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 10,
    skills_required: ["React", "CoinGecko API", "Axios"],
    steps: ["Price list", "Individual coin graphs", "Portfolio tracking", "Alerts"]
  },
  {
    title: "Real Estate Listing App",
    description: "A property search app with map integration.",
    technology: "React",
    difficulty: "Advanced",
    estimated_hours: 25,
    skills_required: ["React", "Leaflet/Google Maps", "Filtering"],
    steps: ["Map view integration", "Search by location", "Image slider", "Contact agent form"]
  },
  {
    title: "Workout Logger",
    description: "Track your sets, reps, and PRs over time.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 12,
    skills_required: ["React", "LocalStorage", "Charting"],
    steps: ["Exercise database", "Log session", "Progress graphs", "Rest timer"]
  },
  {
    title: "Component Library UI",
    description: "Build an interactive UI for your own React components.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 10,
    skills_required: ["React", "Tailwind", "Documentation"],
    steps: ["Button variations", "Modal systems", "Form controls", "Interactive playground"]
  },
  {
    title: "Video Streaming UI",
    description: "Build a Netflix or Disney+ clone interface.",
    technology: "React",
    difficulty: "Advanced",
    estimated_hours: 22,
    skills_required: ["React", "Video.js", "Complex layouts"],
    steps: ["Hero slider", "Browse by genre", "Video player integration", "User profiles"]
  },
  {
    title: "Blog Platform",
    description: "A full-stack blog with MDX support.",
    technology: "React",
    difficulty: "Advanced",
    estimated_hours: 20,
    skills_required: ["React", "Next.js", "MDX"],
    steps: ["Content filtering", "Comments system", "Admin post dashboard", "Analytics integration"]
  },
  {
    title: "Event Booking App",
    description: "Book tickets for upcoming tech conferences.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 14,
    skills_required: ["React", "Calendar API", "QR Code gen"],
    steps: ["Listing events", "Seat selection", "Ticketing", "Email confirmation"]
  },
  {
    title: "GitHub Explorer",
    description: "Search users and explore their repositories.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 11,
    skills_required: ["React", "GitHub API", "Data fetching"],
    steps: ["User search", "Repository cards", "Activity graphs", "Topic search"]
  },
  {
    title: "Slack Clone UI",
    description: "Real-time communication design with sidebar and channels.",
    technology: "React",
    difficulty: "Intermediate",
    estimated_hours: 16,
    skills_required: ["React", "WebSockets", "Channel state"],
    steps: ["Channel navigation", "Message thread", "Direct messaging UI", "Emote reactions"]
  }
];

async function seed() {
  console.log("Seeding expanded projects...");
  
  // Clear existing if needed or just append
  // await execute("DELETE FROM projects");

  for (const project of projects) {
    await execute(
      `
      INSERT INTO projects (
        title, description, technology, difficulty, estimated_hours, skills_required_json, steps_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        difficulty = VALUES(difficulty),
        estimated_hours = VALUES(estimated_hours),
        skills_required_json = VALUES(skills_required_json),
        steps_json = VALUES(steps_json)
      `,
      [
        project.title,
        project.description,
        project.technology,
        project.difficulty,
        project.estimated_hours,
        JSON.stringify(project.skills_required),
        JSON.stringify(project.steps)
      ]
    );
  }
  console.log(`Seeded ${projects.length} projects successfully.`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
