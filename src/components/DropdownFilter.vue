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
  .vs__search {
    background: none;
    border: none;
    &:focus {
      border: none;
      font-size: inherit;
      padding: 6px 12px;
    }
  }
  button:hover {
    background: none;
    color: inherit;
    border: none;
    text-decoration: none;
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
