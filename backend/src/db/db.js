import { Sequelize } from "sequelize";

const isTest = process.env.NODE_ENV === 'test';

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: isTest ? "./src/db/test.db" : "./src/db/ejemplo_sqlite.db",
    logging: false
});

export default sequelize;