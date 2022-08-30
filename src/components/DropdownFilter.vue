<template>
  <div>
    <v-select
      :placeholder="placeholder"
      :options="options"
      :reduce="options => options.slug"
      v-model="selection"
      label="name"
    ></v-select>
  </div>
</template>

<style lang="scss">
.vs__selected + .vs__search {
  display: none;
}
.v-select {
  .vs__selected {
    padding: 5px 10px;
  }
  &.vs--open.vs--single {
    .vs__dropdown-menu {
      margin: 0;
    }
    .vs__selected {
      position: static;
    }
  }
  .vs__fade-enter-active,
  .vs__fade-leave-active {
    &.vs__dropdown-menu {
      margin: 0;
    }
  }
  .vs__search {
    background: none;
    border: none;
    &:focus {
      border: none;
      font-size: inherit;
      padding: 6px 12px;
    }
  }
  .vs__search {
    font-size: 14px;
    padding: 6px 12px;
  }
}
button {
  font-size: 16px;
  padding: 8px 14px;
  background: #0074d9;
  transition: all 0.3s;
  border: 0;
  border-radius: 0.4rem;
  color: #fff;
  cursor: pointer;
  box-shadow: inset 0 0 0 99rem rgba(255, 255, 255, 0);
  &:hover {
    text-decoration: none;
    border: 0;
    box-shadow: inset 0 0 0 99rem rgba(255, 255, 255, 0.2);
  }
}
</style>

<script>
export default {
  name: 'DropdownFilter',
  props: ['placeholder', 'options', 'mutation', 'value'],
  data() {
    return {
      selection: this.selected,
    }
  },
  created() {
    this.selection = this.value
  },
  update() {
    this.selection = this.value
  },
  watch: {
    value: function () {
      this.selection = this.value
    },
    selection: function () {
      this.$store.commit(this.mutation, this.selection)
    },
  },
}
</script>
