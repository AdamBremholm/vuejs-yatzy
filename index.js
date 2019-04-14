const store = new Vuex.Store({
  state: {
    dice: []
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

const Die = {
  props: ["di"],

  template: `<div>
      {{di.value}}
      </div>
      `
};

const Actions = {
  template: `
          <div >
              roll, next
          </div>
      `
};

//Ska skriva ut de rullade tärningarna längst ner i appen
const DiceHolder = {
  computed: {
    dice() {
      return this.$store.state.dice;
    },
  },
  methods : {
    roll(d) {
      //Kollar om tärningen är låst och om inte rollar om den, returnerar värdet på tärningen.
      if (!d.locked) {
        d.value = Math.floor(Math.random() * 6) + 1;
      }
      return d.value;
    }
  },
  template: `
    <div>
            <die v-for="d in dice" v-bind:di="d" :key="d.id">{{roll(d)}}</die>
  
        </div>
    `,
  components: {
    die: Die
  }
};

Vue.component("scoreCard", {
  computed: {
    dice() {
      return this.$store.state.dice;
    }
  },
  template: `
        <div>
            <item-selector v-for="d in dice" v-bind:di="d" :key="d.id"></item-selector>
        </div>
    `,
  components: {
    "item-selector": Item
  } //Kollar om tärninge
});

const app = new Vue({
  store,
  el: "#app",
  methods: {
    //Lägger in 5 tärningar i vuex store
    initDice() {
      for (let index = 0; index < 5; index++) {
        store.state.dice.push({
          id: index,
          value: 0,
          locked: false
        });
      }
    }
  },
  //Kör när vuen skapas
  mounted() {
    this.initDice();
  },
  components: {
    "dice-holder": DiceHolder,
    "action-holder": Actions
  }
});
