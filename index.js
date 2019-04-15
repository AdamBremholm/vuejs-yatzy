const store = new Vuex.Store({
  state: {
    dice: [],
    scoreCard: [
      {
        field: "ettor",
        value: 0
      },
      {
        field: "tvår",
        value: 0
      },
      {
        field: "treor",
        value: 0
      },
      {
        field: "fyror",
        value: 0
      },
      {
        field: "femor",
        value: 0
      },
      {
        field: "sexor",
        value: 0
      },
      {
        field: "bonus",
        value: 0
      },
      {
        field: "summa",
        value: 0
      },
      {
        field: "par",
        value: 0
      },
      {
        field: "två-par",
        value: 0
      },
      {
        field: "tretal",
        value: 0
      },
      {
        field: "fyrtal",
        value: 0
      },
      {
        field: "liten stege",
        value: 0
      },
      {
        field: "stor stege",
        value: 0
      },
      {
        field: "kåk",
        value: 0
      },
      {
        field: "chans",
        value: 0
      },
      {
        field: "yatzy",
        value: 0
      },
      {
        field: "totalt",
        value: 0
      },

    ]
  },

  getters: {},

  mutations: {}
});

//Ska skriva ut varje fält i scorecardet
const Item = {
  props: ["it"],
  template: `
          <div >
              {{it.field}},{{it.value}}
          </div>
      `
};
// Skriver ut varje tärning i tärningsfältet, ska även hålla design för tärningarna
const Die = {
  props: ["di"],

  template: `<div>
      {{di.value}}
      </div>
      `
};
// Ska hålla actionknappsfältet
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
    }
  },
  methods: {
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
    },
    scoreCard() {
      return this.$store.state.scoreCard;
    }
  },
  template: `
        <div>
            <item-selector v-for="i, index in scoreCard" v-bind:it="i" :key="index"></item-selector>
        </div>
    `,
  components: {
    "item-selector": Item
  }
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
