require("dotenv").config({ path: `${process.cwd()}/.env` });

module.exports = {
  development: {
    username: process.env.DB_USERM,
    password: process.env.DB_PASSM,
    database: process.env.DB_NAMEM,
    host: process.env.DB_HOSTM,
    dialect: "postgres",
    logging: false,
    port: process.env.DB_PORTD,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // For self-signed certs
      },
    },

  },
  production: {
    username: process.env.DB_USERD,
    password: process.env.DB_PASSD,
    database: process.env.DB_NAMED,
    host: process.env.DB_HOSTD,
    port: process.env.DB_PORTD,
    dialect: "postgres",
    logging: false, // Disable logging
  },
  test: {
    username: process.env.DB_USERD,
    password: process.env.DB_PASSD,
    database: process.env.DB_NAMED,
    host: process.env.DB_HOSTP,
    dialect: "mysql",
  },
  // production: {
  //   username: "root",
  //   password: process.env.DB_PASSD,
  //   database: "database_production",
  //   host: "127.0.0.1",
  //   dialect: "mysql",
  // },
};
