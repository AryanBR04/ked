-- Career Tracks seed data
INSERT IGNORE INTO career_tracks (id, title, description, difficulty, estimated_duration) VALUES
(1, 'Frontend Developer', 'Learn HTML, CSS, JavaScript, React and build production-ready UI components and full web applications.', 'Beginner → Advanced', '3 months'),
(2, 'Backend Developer', 'Master Node.js, Express, databases, REST APIs, and server-side architecture.', 'Intermediate', '4 months'),
(3, 'Data Analyst', 'Master SQL, Python, Excel, and Data Visualization tools to derive actionable insights from data.', 'Beginner → Intermediate', '3 months'),
(4, 'AI Engineer', 'Learn Machine Learning, Deep Learning, NLP, and build and deploy AI models.', 'Intermediate → Advanced', '5 months'),
(5, 'DevOps Engineer', 'Master Linux, Docker, Kubernetes, CI/CD, and cloud infrastructure automation.', 'Intermediate', '4 months'),
(6, 'Full Stack Developer', 'Combine Frontend and Backend skills to build complete web applications end to end.', 'Intermediate → Advanced', '6 months');

-- Frontend Developer steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(1, 1, 'HTML Fundamentals', 'PLr6-GrHUlVf_ZNmuQSXdS197Oyr1L9sPB'),
(1, 2, 'CSS Layout and Flexbox', 'PL4cUxeGkcC9i3FXJSUfmsNOx8E7u6UuhG'),
(1, 3, 'JavaScript Basics', 'PLsyeobzWxl7qtP8Lo9TReqUMkiOpPBILN'),
(1, 4, 'React Development', 'PLC3y8-rCajCgKzyA-YqX2o55A9o5-P-gE'),
(1, 5, 'Build a Portfolio Project', NULL);

-- Backend Developer steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(2, 1, 'JavaScript for Backend', 'PLsyeobzWxl7qtP8Lo9TReqUMkiOpPBILN'),
(2, 2, 'Node.js Fundamentals', 'PL4cUxeGkcC9gj91eA3Otdk_TpoSF6FEQM'),
(2, 3, 'Express.js REST APIs', 'PL55RiY5tL51q4D-B63KBnygU6opNPFk_q'),
(2, 4, 'MySQL Database Design', 'PLUaB-1hjhk8HQnEV40YmOqLp4A7yE8v0v'),
(2, 5, 'Authentication and Security', NULL);

-- Data Analyst steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(3, 1, 'SQL for Data Analysis', 'PLUaB-1hjhk8HQnEV40YmOqLp4A7yE8v0v'),
(3, 2, 'Python Fundamentals', 'PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU'),
(3, 3, 'Pandas and Data Wrangling', 'PL-osiE80TeTsWmV9i9c58mdDZAskcbX7_'),
(3, 4, 'Data Visualization', NULL),
(3, 5, 'Capstone Data Project', NULL);

-- AI Engineer steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(4, 1, 'Python for ML', 'PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU'),
(4, 2, 'Machine Learning Fundamentals', NULL),
(4, 3, 'Deep Learning with PyTorch', NULL),
(4, 4, 'Natural Language Processing', NULL),
(4, 5, 'Deploy AI Models', NULL);

-- DevOps Engineer steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(5, 1, 'Linux Fundamentals', 'PLtK75qxsQaMLZSo7KL-PmiRarU7hrpnwK'),
(5, 2, 'Docker and Containers', 'PLhW3qG5bs-L99pCJZ749G5uKYt1cAKvjW'),
(5, 3, 'Kubernetes Orchestration', 'PLy7NrYWoggjwPggqtfsI_zMAwvGzfSqWg'),
(5, 4, 'CI/CD Pipelines', NULL),
(5, 5, 'Cloud Infrastructure (AWS)', NULL);

-- Full Stack Developer steps
INSERT IGNORE INTO career_track_steps (track_id, step_order, step_title, playlist_id) VALUES
(6, 1, 'HTML & CSS Essentials', 'PLr6-GrHUlVf_ZNmuQSXdS197Oyr1L9sPB'),
(6, 2, 'JavaScript Full Course', 'PLsyeobzWxl7qtP8Lo9TReqUMkiOpPBILN'),
(6, 3, 'React Frontend', 'PLC3y8-rCajCgKzyA-YqX2o55A9o5-P-gE'),
(6, 4, 'Node.js Backend', 'PL4cUxeGkcC9gj91eA3Otdk_TpoSF6FEQM'),
(6, 5, 'Databases and Deployment', NULL);
