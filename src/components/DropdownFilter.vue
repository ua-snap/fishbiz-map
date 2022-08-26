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

<style lang="scss" scoped></style>

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
