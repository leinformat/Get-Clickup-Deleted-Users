import axios from "axios";
import { emails } from "./emails.js";
import { config } from "./config.js";

const { CLICKUP_API_KEY, TEAM_ID } = config;

const urls = {
    team: `https://api.clickup.com/api/v2/team/${TEAM_ID}`,
    user: `https://api.clickup.com/api/v2/team/${TEAM_ID}/user/61492190`,
    tasks:`https://api.clickup.com/api/v2/team/${TEAM_ID}/task`,
    task:`https://api.clickup.com/api/v2/task/86dvx0c4t?&team_id=${TEAM_ID}`
}

const Axios = axios.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: CLICKUP_API_KEY,
  },
});

export const gettingTasks = async () => {
  const foundUsers = {};

  const batchSize = 100;
  let page = 0;
  let lastPage = false;
  
  while (!lastPage) {
    try {
      // Generate 100 promises to fetch data from the API parallelly
      const requests = Array.from({ length: batchSize }, (_, i) =>
        Axios.get(`${urls.tasks}?subtasks=true&include_closed=true&page=${page + i}`)
      );
  
      // Execute all the promises in parallel
      const responses = await Promise.all(requests);

      // Iterate over the responses
      for (const req of responses) {
        const response = req.data;
        console.log(`Procesando página -> ${response.current_page}`);
        
        // Iterate over the emails array
        for (const email of emails) {
          if (!foundUsers[email]) {
            const user = response.tasks.find(task =>
              task.creator.email.toLowerCase().includes(email.toLowerCase())
            );
  
            if (user) {
              foundUsers[email] = user.creator.id;
            }
          }
        }
        
        console.log(`Usuarios Encontrados ->`,foundUsers);

        // If any page is the last page, set lastPage to true
        if (response.last_page === true) {
          lastPage = true;
        }
      }

      // Forware to the next batch of pages
      page += batchSize;
      console.log(`Batch de páginas ${page - batchSize} a ${page - 1} completado.`);
  
    } catch (error) {
      console.error("Error al obtener datos de la API:", error);
      break;
    }
  }

  console.log(`Users encontrados:`,foundUsers);
};

gettingTasks();
