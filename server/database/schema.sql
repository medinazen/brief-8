

create table board (
  id int auto_increment primary key,
  title varchar(255),
  user_id int,
  foreign key (user_id) references user(id)
);

create table list (
  id int auto_increment primary key,
  title varchar(255),
  board_id int,
  position int,
  foreign key (board_id) references board(id)
);

create table card (
  id int auto_increment primary key,
  title varchar(255),
  description text,
  list_id int,
  position int,
  foreign key (list_id) references list(id)
);
CREATE TABLE user(
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    password VARCHAR(1028)
) ENGINE = INNODB;