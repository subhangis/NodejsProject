const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Fetchroutes = require("./routes/userRoutes.js");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Swagger setup
const swaggerOptions = {
      definition: {
          openapi: "3.0.0",
          info: {
              title: "Express API with Swagger",
              version: "1.0.0",
              description: "API documentation for Express app",
          },
          servers: [
              {
                  url: `http://localhost:${PORT}`, // Dynamically sets correct server URL
                  description: "Local server",
              },
          ],
          components: {
              securitySchemes: {
                  BearerAuth: {
                      type: "http",
                      scheme: "bearer",
                      bearerFormat: "JWT",
                  },
              },
          },
      },
      tags: [
            {
                name: "Users",
                description: "Operations related to user management",
            }
      ],
      apis: ["./routes/*.js"], // Ensure this points to the correct route files
  };

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB and start the server
mongoose
    .connect(MONGOURL)
    .then(() => {
        console.log("Database connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((error) => console.log("Database connection error:", error));

// Routes
app.use("/", Fetchroutes);
