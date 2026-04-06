import databaseClient from "../../database/client";

export const setupTestDB = async () => {
  await databaseClient.query(`
    CREATE TABLE IF NOT EXISTS user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      firstname VARCHAR(255),
      lastname VARCHAR(255),
      password VARCHAR(1028)
    ) ENGINE=INNODB
  `);
};

export const clearTestDB = async () => {
  await databaseClient.query("DELETE FROM user");
};

export const closeTestDB = async () => {
  await databaseClient.end();
};