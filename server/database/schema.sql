CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  password VARCHAR(1028)
) ENGINE = INNODB;
 
CREATE TABLE board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
 
CREATE TABLE list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  board_id INT,
  position BIGINT,
  FOREIGN KEY (board_id) REFERENCES board(id)
);
 
CREATE TABLE card (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  list_id INT,
  position BIGINT,
  FOREIGN KEY (list_id) REFERENCES list(id)
);
 