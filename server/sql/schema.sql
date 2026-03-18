CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('aptitude','coding','mixed') NOT NULL,
  duration INT NOT NULL,
  company VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  test_id BIGINT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  type ENUM('mcq','coding') NOT NULL,
  options_json JSON NULL,
  correct_answer TEXT NULL,
  test_cases_json JSON NULL,
  PRIMARY KEY (id),
  KEY idx_questions_test_id (test_id),
  CONSTRAINT fk_questions_test_id FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS study_materials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(250) NOT NULL,
  company VARCHAR(200) NOT NULL,
  type ENUM('pdf','video','article') NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_study_materials_company (company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contest_tests (
  contest_id BIGINT UNSIGNED NOT NULL,
  test_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (contest_id, test_id),
  KEY idx_contest_tests_test_id (test_id),
  CONSTRAINT fk_contest_tests_contest_id FOREIGN KEY (contest_id) REFERENCES contests (id) ON DELETE CASCADE,
  CONSTRAINT fk_contest_tests_test_id FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contest_participants (
  contest_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contest_id, user_id),
  KEY idx_contest_participants_user_id (user_id),
  CONSTRAINT fk_contest_participants_contest_id FOREIGN KEY (contest_id) REFERENCES contests (id) ON DELETE CASCADE,
  CONSTRAINT fk_contest_participants_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS test_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  test_id BIGINT UNSIGNED NOT NULL,
  test_title VARCHAR(200) NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_test_results_user_id (user_id),
  KEY idx_test_results_test_id (test_id),
  CONSTRAINT fk_test_results_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_test_results_test_id FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS test_result_answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  result_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  answer TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_test_result_answers_result_id (result_id),
  KEY idx_test_result_answers_question_id (question_id),
  CONSTRAINT fk_test_result_answers_result_id FOREIGN KEY (result_id) REFERENCES test_results (id) ON DELETE CASCADE,
  CONSTRAINT fk_test_result_answers_question_id FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alumni_posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  author_user_id BIGINT UNSIGNED NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_company VARCHAR(200) NOT NULL,
  title VARCHAR(250) NOT NULL,
  content TEXT NOT NULL,
  test_duration_mins INT UNSIGNED NULL,
  aptitude_questions INT UNSIGNED NULL,
  aptitude_difficulty VARCHAR(20) NULL,
  coding_questions INT UNSIGNED NULL,
  coding_difficulty VARCHAR(20) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alumni_posts_created_at (created_at),
  CONSTRAINT fk_alumni_posts_author_user_id FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alumni_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id BIGINT UNSIGNED NOT NULL,
  author_user_id BIGINT UNSIGNED NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_alumni_comments_post_id (post_id),
  CONSTRAINT fk_alumni_comments_post_id FOREIGN KEY (post_id) REFERENCES alumni_posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_alumni_comments_author_user_id FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alumni_likes (
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  KEY idx_alumni_likes_user_id (user_id),
  CONSTRAINT fk_alumni_likes_post_id FOREIGN KEY (post_id) REFERENCES alumni_posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_alumni_likes_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
