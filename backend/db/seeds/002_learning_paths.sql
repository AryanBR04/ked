-- Sample Learning Paths
INSERT IGNORE INTO learning_paths (id, title, description, technology, difficulty) VALUES
(1, 'Python Developer Path', 'Master Python from basics to advanced frameworks and real-world applications.', 'Python', 'Beginner to Advanced'),
(2, 'Frontend Developer Path', 'Learn HTML, CSS, JavaScript, and React to build modern, responsive web interfaces.', 'React', 'Beginner to Intermediate'),
(3, 'Data Analyst Path', 'Learn SQL, Excel, Python for data analysis, and data visualization tools.', 'Data Analysis', 'Beginner to Intermediate'),
(4, 'DevOps Engineer Path', 'Master Linux, Docker, Kubernetes, CI/CD, and Cloud basics for infrastructure engineering.', 'DevOps', 'Intermediate');

-- You can add realistic playlist IDs for these paths, but replacing these with some known good playlist IDs or placeholder IDs.
-- Let's use some example playlist IDs (you might want to replace these with actual popular YouTube playlist IDs if available).
-- For this seed, we'll use placeholder or common IDs.

-- Python Path Steps
INSERT IGNORE INTO learning_path_steps (path_id, step_order, step_title, playlist_id) VALUES
(1, 1, 'Python Basics', 'PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU'),
(1, 2, 'Object Oriented Programming', 'PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc'),
(1, 3, 'Data Structures', 'PL2_aWCzGMAwI3W_JlcBbtYTwiQSsZA8pu'),
(1, 4, 'APIs with Flask', 'PL-osiE80TeTbhxHLsU2kVcpJ_k8ls8Z2I');

-- Frontend Path Steps
INSERT IGNORE INTO learning_path_steps (path_id, step_order, step_title, playlist_id) VALUES
(2, 1, 'HTML & CSS Basics', 'PLr6-GrHUlVf_ZNmuQSXdS197Oyr1L9sPB'),
(2, 2, 'JavaScript Fundamentals', 'PLsyeobzWxl7qtP8Lo9TReqUMkiOpPBILN'),
(2, 3, 'React JS for Beginners', 'PLC3y8-rCajCgKzyA-YqX2o55A9o5-P-gE'),
(2, 4, 'Advanced DOM Manipulation', 'PL4cUxeGkcC9gfoIgnXVzcjmc0z2UksT_E');

-- Data Analyst Path Steps
INSERT IGNORE INTO learning_path_steps (path_id, step_order, step_title, playlist_id) VALUES
(3, 1, 'SQL for Data Analysis', 'PLUaB-1hjhk8HQnEV40YmOqLp4A7yE8v0v'),
(3, 2, 'Python Data Science (Pandas)', 'PL-osiE80TeTsWmV9i9c58mdDZAskcbX7_'),
(3, 3, 'Tableau Basics', 'PLUaB-1hjhk8GsEaP1oQd6gZ_X7L8G8d1y');

-- DevOps Engineer Path Steps
INSERT IGNORE INTO learning_path_steps (path_id, step_order, step_title, playlist_id) VALUES
(4, 1, 'Linux Basics', 'PLtK75qxsQaMLZSo7KL-PmiRarU7hrpnwK'),
(4, 2, 'Docker for Beginners', 'PLhW3qG5bs-L99pCJZ749G5uKYt1cAKvjW'),
(4, 3, 'Kubernetes Crash Course', 'PLy7NrYWoggjwPggqtfsI_zMAwvGzfSqWg'),
(4, 4, 'CI/CD with GitHub Actions', 'PLr6-GrHUlVf8yL8c1gPrt3s4bK0U2qOeg');
