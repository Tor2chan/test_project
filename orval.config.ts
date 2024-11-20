import { defineConfig } from "orval";

export default defineConfig({
  evo: {
    output: {
      mode: "tags",
      schemas: "./src/app/models/base",
      target: "./src/app/services/base/endpoints.ts",
      mock: false, // enable/disable test mock generation
      // I recommend enabling this option if you generate an api client
      prettier: true, // recommended if you use prettier
      clean: false, // recreate the whole folder (avoid outdated files)
      client: "angular",
    },
    input: {
      // use your own Swagger url: http://server:port/context-path/v3/api-docs
      target: "http://localhost:28080/operationapi/v3/api-docs",
    },
  },
});
