<template>
  <div class="table-responsive">
    <table :id="id" class="table align-middle bg-white" :class="tableClass">
      <thead>
        <slot name="head" />
      </thead>

      <tbody>
        <template v-for="(item, index) in paginatedItems" :key="index">
          <slot name="body" :item="item" :index="index" />
        </template>
      </tbody>
    </table>

    <!-- Paginación opcional -->
    <nav
      v-if="rowsPerPage && pageCount > 1"
      class="mt-3 d-flex justify-content-center"
      aria-label="Page navigation"
    >
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="currentPage--">
          <a class="page-link" href="#">Anterior</a>
        </li>
        <li
          class="page-item"
          v-for="page in pageCount"
          :key="page"
          :class="{ active: page === currentPage }"
          @click="currentPage = page"
        >
          <a class="page-link" href="#">{{ page }}</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === pageCount }"
          @click="currentPage++"
        >
          <a class="page-link" href="#">Siguiente</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  id?: string;
  tableClass?: string;
  items: any[];
  search?: string;
  searchKey?: string;
  rowsPerPage?: number;
}>();

const currentPage = ref(1);

const filteredItems = computed(() => {
  if (!props.search || !props.searchKey) return props.items;
  return props.items.filter((item) => {
    const value = item[props.searchKey!];
    return String(value).toLowerCase().includes(props.search!.toLowerCase());
  });
});

const pageCount = computed(() => {
  if (!props.rowsPerPage) return 1;
  return Math.ceil(filteredItems.value.length / props.rowsPerPage);
});

const paginatedItems = computed(() => {
  if (!props.rowsPerPage) return filteredItems.value;
  const start = (currentPage.value - 1) * props.rowsPerPage;
  return filteredItems.value.slice(start, start + props.rowsPerPage);
});
</script>

<style lang="scss" scoped>
.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: separate;
  border-spacing: 0 3px;
}

thead {
  background-color: #747d7a; /* Gris oscuro */
  color: white;
  font-weight: bold;
}

thead th {
  text-align: center;
  padding: 0.5rem;
  vertical-align: middle;
  background-color: #747d7a;
  color: white;
}

tbody td {
  background-color: white;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
}

/* MOBILE MODE - Card like rows */
@media screen and (max-width: 768px) {
  table {
    border-collapse: separate;
    border-spacing: 0 1rem;
  }

  thead {
    display: none !important;
  }

  tbody tr {
    display: block;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #fff;
    margin-bottom: 1rem;
  }

  td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  td::before {
    content: attr(data-th);
    font-weight: 600;
    text-transform: uppercase;
    color: #6c757d;
    flex: 1;
    text-align: left;
  }

  td:last-child {
    border-bottom: none;
  }

  td > *:not(:first-child) {
    flex: 1;
    text-align: right;
  }

  .btn-group {
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: flex-end;
  }
}
</style>
