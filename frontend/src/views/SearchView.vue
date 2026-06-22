<template>
    <div>
      <h1>Résultats de recherche</h1>
      <p>Vous avez recherché : "{{ $route.query.q }}"</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchView',
  }
  </script>