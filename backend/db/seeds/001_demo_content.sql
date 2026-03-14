INSERT INTO users (id, email, password_hash, name)
VALUES
  (
    1001,
    'student@ked.dev',
    '$2a$12$G2j6V2Jy2FFXu/cpLUulmuEeGd2C17C0XJRyc4R0iiL6Ar0xV2P2G',
    'Demo Student'
  )
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  name = VALUES(name);

INSERT INTO subjects (id, title, slug, description, thumbnail_url, category, instructor_name, is_published)
VALUES
  (
    2001,
    'Java Foundations',
    'java-foundations',
    'Start with syntax, variables, control flow, and object-oriented basics in a clean sequence.',
    'https://img.youtube.com/vi/grEKMHGYyns/hqdefault.jpg',
    'Programming',
    'Aarav Mehta',
    1
  ),
  (
    2002,
    'Python for Beginners',
    'python-for-beginners',
    'Learn Python fundamentals with short guided lessons and milestone-based progress.',
    'https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg',
    'Programming',
    'Nisha Rao',
    1
  ),
  (
    2003,
    'Machine Learning Essentials',
    'machine-learning-essentials',
    'Build intuition for supervised learning, model evaluation, and practical workflows.',
    'https://img.youtube.com/vi/ukzFI9rgwfU/hqdefault.jpg',
    'AI',
    'Rohan Iyer',
    1
  ),
  (
    2004,
    'React UI Essentials',
    'react-ui-essentials',
    'Build modern interfaces with components, props, hooks, and practical UI patterns.',
    'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
    'Frontend',
    'Ishita Kapoor',
    1
  ),
  (
    2005,
    'Node.js API Bootcamp',
    'nodejs-api-bootcamp',
    'Learn routing, middleware, controllers, and API design with Node and Express.',
    'https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg',
    'Backend',
    'Dev Malhotra',
    1
  ),
  (
    2006,
    'SQL From Zero',
    'sql-from-zero',
    'Understand queries, joins, aggregates, and schema design with hands-on examples.',
    'https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg',
    'Database',
    'Mira Sen',
    1
  ),
  (
    2007,
    'Data Structures Basics',
    'data-structures-basics',
    'Cover arrays, linked lists, stacks, queues, trees, and the reasoning behind them.',
    'https://img.youtube.com/vi/RBSGKlAvoiM/hqdefault.jpg',
    'Programming',
    'Aditya Nair',
    1
  ),
  (
    2008,
    'System Design Starters',
    'system-design-starters',
    'Start thinking about scale, latency, caching, queues, and service boundaries.',
    'https://img.youtube.com/vi/UzLMhqg3_Wc/hqdefault.jpg',
    'Architecture',
    'Neha Bansal',
    1
  ),
  (
    2009,
    'Git and Collaboration',
    'git-and-collaboration',
    'Master branches, commits, rebases, pull requests, and collaborative workflows.',
    'https://img.youtube.com/vi/RGOj5yH7evk/hqdefault.jpg',
    'Tools',
    'Karan Sethi',
    1
  ),
  (
    2010,
    'TypeScript Practical Guide',
    'typescript-practical-guide',
    'Use types, interfaces, unions, and narrowing to write safer application code.',
    'https://img.youtube.com/vi/30LWjhZzg50/hqdefault.jpg',
    'Programming',
    'Sana Joseph',
    1
  ),
  (
    2011,
    'Docker for Developers',
    'docker-for-developers',
    'Containerize apps, understand images, layers, networks, and clean dev workflows.',
    'https://img.youtube.com/vi/3c-iBn73dDE/hqdefault.jpg',
    'DevOps',
    'Rahul Bedi',
    1
  ),
  (
    2012,
    'Prompting for Builders',
    'prompting-for-builders',
    'Learn structured prompting, evaluation habits, and ways to integrate AI into products.',
    'https://img.youtube.com/vi/dOxUroR57xs/hqdefault.jpg',
    'AI',
    'Tanya Arora',
    1
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  slug = VALUES(slug),
  description = VALUES(description),
  thumbnail_url = VALUES(thumbnail_url),
  category = VALUES(category),
  instructor_name = VALUES(instructor_name),
  is_published = VALUES(is_published);

INSERT INTO sections (id, subject_id, title, order_index)
VALUES
  (3001, 2001, 'Java Basics', 1),
  (3002, 2001, 'Object-Oriented Thinking', 2),
  (3003, 2002, 'Python Setup', 1),
  (3004, 2002, 'Core Syntax', 2),
  (3005, 2003, 'ML Foundations', 1),
  (3006, 2003, 'Model Evaluation', 2),
  (3007, 2004, 'React Core', 1),
  (3008, 2005, 'API Fundamentals', 1),
  (3009, 2006, 'Query Basics', 1),
  (3010, 2007, 'Linear Structures', 1),
  (3011, 2008, 'Foundations', 1),
  (3012, 2009, 'Version Control', 1),
  (3013, 2010, 'Type System', 1),
  (3014, 2011, 'Docker Core', 1),
  (3015, 2012, 'Prompt Design', 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  order_index = VALUES(order_index);

INSERT INTO videos (id, section_id, title, description, youtube_url, order_index, duration_seconds)
VALUES
  (
    4001,
    3001,
    'Intro to Java',
    'What Java is, where it is used, and how this course is structured.',
    'https://www.youtube.com/watch?v=grEKMHGYyns',
    1,
    480
  ),
  (
    4002,
    3001,
    'Variables and Data Types',
    'Primitive types, variables, and simple examples.',
    'https://www.youtube.com/watch?v=GoXwIVyNvX0',
    2,
    620
  ),
  (
    4003,
    3002,
    'Classes and Objects',
    'See how Java groups state and behavior using classes.',
    'https://www.youtube.com/watch?v=pTB0EiLXUC8',
    1,
    700
  ),
  (
    4004,
    3003,
    'Installing Python and Running Your First Script',
    'Get Python running locally and understand the REPL versus files.',
    'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    1,
    530
  ),
  (
    4005,
    3004,
    'Conditionals and Loops',
    'Build flow control with if, while, and for.',
    'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ',
    1,
    610
  ),
  (
    4006,
    3004,
    'Functions and Lists',
    'Start organizing logic and working with collections.',
    'https://www.youtube.com/watch?v=rfscVS0vtbw',
    2,
    840
  ),
  (
    4007,
    3005,
    'What Is Machine Learning?',
    'Understand problems, labels, features, and the idea of learning from data.',
    'https://www.youtube.com/watch?v=ukzFI9rgwfU',
    1,
    540
  ),
  (
    4008,
    3006,
    'Training, Validation, and Test Splits',
    'Learn why we split data and what each split tells us.',
    'https://www.youtube.com/watch?v=0Lt9w-BxKFQ',
    1,
    660
  ),
  (
    4009,
    3006,
    'Precision, Recall, and Accuracy',
    'Choose metrics that actually match the product goal.',
    'https://www.youtube.com/watch?v=85dtiMz9tSo',
    2,
    590
  ),
  (
    4010,
    3007,
    'React Components and JSX',
    'Start with the mental model behind React components and the JSX syntax.',
    'https://www.youtube.com/watch?v=bMknfKXIFA8',
    1,
    720
  ),
  (
    4011,
    3007,
    'State, Props, and Hooks',
    'Understand how local state and props shape reusable user interfaces.',
    'https://www.youtube.com/watch?v=SqcY0GlETPk',
    2,
    640
  ),
  (
    4012,
    3008,
    'Express Routing Basics',
    'Build your first endpoints and understand how requests move through Express.',
    'https://www.youtube.com/watch?v=Oe421EPjeBE',
    1,
    700
  ),
  (
    4013,
    3008,
    'Controllers and Middleware',
    'Organize backend logic into reusable middleware and focused route handlers.',
    'https://www.youtube.com/watch?v=l8WPWK9mS5M',
    2,
    620
  ),
  (
    4014,
    3009,
    'SELECT, WHERE, and ORDER BY',
    'Learn the core query building blocks you use every day in SQL.',
    'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    1,
    690
  ),
  (
    4015,
    3009,
    'JOINS Made Practical',
    'Connect related tables and understand when to use each kind of join.',
    'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
    2,
    610
  ),
  (
    4016,
    3010,
    'Arrays, Stacks, and Queues',
    'Build intuition for storage, access patterns, and classic interview structures.',
    'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    1,
    760
  ),
  (
    4017,
    3010,
    'Trees and Traversal',
    'Understand node-based structures and the common traversal strategies.',
    'https://www.youtube.com/watch?v=oSWTXtMglKE',
    2,
    680
  ),
  (
    4018,
    3011,
    'Scalability and Bottlenecks',
    'Start seeing where systems break and how architecture choices relieve pressure.',
    'https://www.youtube.com/watch?v=UzLMhqg3_Wc',
    1,
    710
  ),
  (
    4019,
    3011,
    'Caching and Queues',
    'Understand two of the most common tools used in reliable large systems.',
    'https://www.youtube.com/watch?v=Nsjsiz2A9mg',
    2,
    650
  ),
  (
    4020,
    3012,
    'Commits, Branches, and Pull Requests',
    'Learn the collaboration habits that keep Git history clean and useful.',
    'https://www.youtube.com/watch?v=RGOj5yH7evk',
    1,
    560
  ),
  (
    4021,
    3012,
    'Rebase and Resolve Conflicts',
    'Move beyond the basics and clean up history without losing your work.',
    'https://www.youtube.com/watch?v=FdZecVxzJbk',
    2,
    530
  ),
  (
    4022,
    3013,
    'Why TypeScript Helps',
    'See how static types reduce bugs and improve confidence while refactoring.',
    'https://www.youtube.com/watch?v=30LWjhZzg50',
    1,
    630
  ),
  (
    4023,
    3013,
    'Interfaces, Unions, and Narrowing',
    'Use TypeScript features that show up in real application code every day.',
    'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    2,
    670
  ),
  (
    4024,
    3014,
    'Images, Containers, and Layers',
    'Learn the fundamentals behind Docker images and reproducible runtime environments.',
    'https://www.youtube.com/watch?v=3c-iBn73dDE',
    1,
    700
  ),
  (
    4025,
    3014,
    'Docker Compose for Local Development',
    'Bring multiple services together with a clean local environment setup.',
    'https://www.youtube.com/watch?v=Qw9zlE3t8Ko',
    2,
    620
  ),
  (
    4026,
    3015,
    'Prompt Structure That Works',
    'Break prompts into role, task, constraints, context, and output format.',
    'https://www.youtube.com/watch?v=dOxUroR57xs',
    1,
    580
  ),
  (
    4027,
    3015,
    'Prompt Iteration and Evaluation',
    'Tighten outputs by testing, reviewing, and refining prompting patterns.',
    'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    2,
    540
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  youtube_url = VALUES(youtube_url),
  order_index = VALUES(order_index),
  duration_seconds = VALUES(duration_seconds);
