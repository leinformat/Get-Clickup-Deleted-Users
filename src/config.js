import dotenv from "dotenv";
dotenv.config();

export const config = {
    CLICKUP_API_KEY: process.env.CLICKUP_API_KEY,
    TEAM_ID: process.env.TEAM_ID,
};