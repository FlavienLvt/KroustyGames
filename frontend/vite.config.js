import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080, // Set the port to 8080
    host: true, // Allow access from the network (optional)
  },
});