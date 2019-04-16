const store = new Vuex.Store({
  state: {
    dice: [],
    scoreCard: []
  },

  getters: {},

  mutations: {}
});

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

//Ska skriva ut varje fält i scorecardet
const Item = {
  props: ["it"],
  computed: {
    classObject: function() {
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
        <div class="cbvl cb1">Combo</div>
        <div class="cbvl vl1">Value</div>
        <div class="cbvl cb2">Combo</div>
        <div class="cbvl vl2">Value</div>
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
    },
    initScoreCard() {
      let fieldArray = [
        "ettor",
        "tvåor",
        "treor",
        "fyror",
        "femmor",
        "sexor",
        "bonus",
        "summa",
        "par",
        "två-par",
        "triss",
        "fyrtal",
        "liten-stege",
        "stor-stege",
        "kåk",
        "chans",
        "yatzy",
        "total"
      ];
      for (let index = 0; index < fieldArray.length; index++) {
        let indexPlusOne = index + 1;
        store.state.scoreCard.push({
          id: indexPlusOne,
          field: fieldArray[index],
          value: 0
        });
      }
    }
  },
  //Kör när vuen skapas
  mounted() {
    this.initDice();
    this.initScoreCard();
  },
  components: {
    "dice-holder": DiceHolder,
    "action-holder": Actions
  }
});
