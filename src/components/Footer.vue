<template>
  <div class="footer">
    <div class="columns">
      <div class="col">
        <h3 class="col-header">Links</h3>
        <ul class="linklist">
          <li>Link 1</li>
        </ul>
      </div>

      <div class="col">
        <h3 class="col-header">Links</h3>
        <ul class="linklist">
          <li>Link 1</li>
        </ul>
      </div>

      <div class="col">
        <h3 class="col-header">Links</h3>
        <ul class="linklist">
          <li>Link 1</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style lang="scss" scoped>
div.footer {
  width: 100%;
  background: #101010;
  padding: 10px 0 24px 0;

  div.columns {
    display: flex;
    flex-flow: row;
    justify-content: space-evenly;

    .col {
      display: flex;
      flex-flow: column;

      .col-header { text-align: center; }
    }
  }

  ul {
      list-style-type: none;
      padding: 0;
  }
}
</style>
