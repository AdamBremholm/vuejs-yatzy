const store = new Vuex.Store({
  state: {
    dice: [],
    scoreCard: [
      { id : 1,
        field: "ettor",
        value: 0
      },
      {
        id : 2,
        field: "tvår",
        value: 0
      },
      { 
        id : 3,
        field: "treor",
        value: 0
      },
      {
        id : 4,
        field: "fyror",
        value: 0
      },
      {
        id : 5,
        field: "femor",
        value: 0
      },
      { id : 6,
        field: "sexor",
        value: 0
      },
      { id : 7,
        field: "bonus",
        value: 0
      },
      { id : 8,
        field: "summa",
        value: 0
      },
      { id : 9,
        field: "par",
        value: 0
      },
      { id : 10,
        field: "två-par",
        value: 0
      },
      { id : 11,
        field: "tretal",
        value: 0
      },
      { id : 12,
        field: "fyrtal",
        value: 0
      },
      { id : 13,
        field: "liten stege",
        value: 0
      },
      { id : 14,
        field: "stor stege",
        value: 0
      },
      { id : 15,
        field: "kåk",
        value: 0
      },
      { id : 16,
        field: "chans",
        value: 0
      },
      { id : 17,
        field: "yatzy",
        value: 0
      },
      { id : 18,
        field: "totalt",
        value: 0
      }
    ]
  },

  getters: {},

  mutations: {}
});

//Ska skriva ut varje fält i scorecardet
const Item = {
  props: ["it"],
  computed: {
    classObject: function () {
      return "rw " + "rw" + this.it.id;
    }
    },
  template: `
         <div v-bind:class="classObject">
          <div class="fi">{{it.field}}</div>
          <div class="vl">{{it.value}}</div>
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
    <div class="dice-holder">
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
        <div class="score-card">
        <div class="cbhd">Combo</div>
        <div class="vlhd">Value</div>
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
