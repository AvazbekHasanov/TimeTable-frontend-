<script setup>

</script>

<template>
  <div class="sidebar">
    <div class="sidebar-section">
      <h2 class="sidebar-header">Menyular</h2>
      <ul class="sidebar-menu">
        <li><router-link to="/" class="menu-link">TimeTable</router-link></li>
        <li><router-link to="/teacher-schedule" class="menu-link">O'qituvchilar dars jadvali</router-link></li>
        <li><router-link to="/add-teacher" class="menu-link">Darsga o'qituvchi biriktirish</router-link></li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="css">
.sidebar {
  width: 15%;
  background: linear-gradient(135deg, #4a90e2, #005792);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Enables vertical scrolling */
  height: 100vh; /* Ensures it takes the full viewport height */
}

/* Sidebar Content */
.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-header {
  font-size: 20px;
  margin-bottom: 15px;
  color: #fff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-link {
  display: block;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  font-size: 16px;
  border-radius: 5px;
  transition: background 0.3s ease, color 0.3s ease;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #eaf9ff;
}

</style>
