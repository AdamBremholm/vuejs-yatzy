const store = new Vuex.Store({
  state: {
    dices: [
      {
        value: 1
      },
      {
        value: 2
      },
      {
        value: 3
      },
      {
        value: 4
      },
      {
        value: 5
      },
      {
        value: 6
      }
    ]
  },

  getters: {},

  mutations: {}
});

//Ska skriva ut varje fält i scorecardet
const Item = {
  props: ["di"],
  template: `
          <div >
              {{di.value}}
          </div>
      `
};

//Ska skriva ut de rullade tärningarna längst ner i appen
const DiceHolder = {
    computed: {
        dices() {
          return this.$store.state.dices;
        }
      },
    template: `
    <div>
            <div v-for="d, index in dices" v-bind:di="d" v-bind:key="index">{{d.value}}</div>
        </div>
    `
}


Vue.component("scoreCard", {
  computed: {
    dices() {
      return this.$store.state.dices;
    }
  },
  template: `
        <div>
            <item-selector v-for="d, index in dices" v-bind:di="d" v-bind:key="index"></item-selector>
        </div>
    `,
  components: {
    "item-selector": Item
  }
});

const app = new Vue({
    store,
  el: "#app",
});
