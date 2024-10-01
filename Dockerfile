   # Dockerfile
   FROM node:14

   # Buat direktori kerja di dalam container
   WORKDIR /usr/src/app

   # Salin package.json dan package-lock.json
   COPY package*.json ./

   # Install dependensi
   RUN npm install

   # Salin kode aplikasi
   COPY . .

   # Ekspose port yang akan digunakan oleh aplikasi
   EXPOSE 3000

   # Jalankan aplikasi
   CMD ["node", "app.js"]