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

<style lang="scss" scoped>
// We need to adjust the CSS a little bit so that
// the combo boxes work properly with WP's styling.

// The box/dropbown itself...
:deep(input[type="search"]) {
  &::placeholder {
    color: #000;
  }
  &:focus {
    font-size: 14px;
    border-radius: 0;
    color: #000;
  }
  padding: 0 7px;
  transition: initial;
  border: 1px solid transparent;
  width: 0;
}

// Font fixups for the sub-menus...
:deep(ul) {
  font-size: 14px;
  color: #000;
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
