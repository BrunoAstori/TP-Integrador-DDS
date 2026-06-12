import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./src/db/test.db",
    logging: false
});

export default sequelize;