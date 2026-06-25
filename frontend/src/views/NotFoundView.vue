<template>
    <div>
      <h1>404 - Page non trouvée</h1>
      <p>La page que vous recherchez n'existe pas.</p>
      <router-link to="/">Retour à l'accueil</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView',
  }
  </script>