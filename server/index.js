
import express from "express";
const PORT = process.env.PORT;
import chatRoutes from "./routes/chatRoutes.js";


const server = express();
server.use(express.json());
server.use("/api/v1", chatRoutes);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

