const store = new Vuex.Store({
  state: {
    dice: [],
    scoreCard: [],
    rollsLeft: 3,
    activeItem: [],
    isMobile: false
  },
  getters: {
    activeItemId: (state, getters) => {
      if (getters.activeItemExists) return state.activeItem[0].id;
      else return -1;
    },
    activeItemExists: state => {
      if (state.activeItem.length > 0) return true;
      else return false;
    },
    getOpenSlots: state => {
      return state.scoreCard.filter(item => item.value === 0);
    },

    //Hämtar enbart ut värdet från tärningarna och returnerar till ny array
    diceValues: state => {
      results = [];
      state.dice.forEach(d => {
        results.push(d.value);
      });
      return results;
    },
    //Sorterar med högsta tal först
    sortByDesDice: (state, getters) => {
      let sortedArray = [];
      sortedArray = getters.diceValues.slice().sort(function(a, b) {
        return b - a;
      });
      return sortedArray;
    },
    sortByAscDice: (state, getters) => {
      let sortedArray = [];
      sortedArray = getters.diceValues.slice().sort(function(a, b) {
        return a - b;
      });
      return sortedArray;
    },
    // Hämtar summan av num som man skickar in som inparameter. Om objektet är undefined (dvs kunde inte hittas returneras 0)
    calculateNumbers: (state, getters) => num => {
      let sum = 0;
      let aggregateObj = { number: num, count: 0 };
      let temp = {};
      temp = getters.calculateAggregate.find(d => d.number === num);
      if (typeof temp != "undefined") aggregateObj = temp;
      sum = aggregateObj.number * aggregateObj.count;
      return sum;
    },
    scoreCardValues: state => {
      let results = [];
      state.scoreCard.forEach(s => {
        results.push(s.value);
      });
      return results;
    },
    scoreCardValuesForNumbers: state => {
      let results = [];
      state.scoreCard.forEach(s => {
        if (s.id < 7) results.push(s.value);
      });
      return results;
    },
    calculateTotalScore: (state, getters) => {
      let result = 0;
      if (getters.scoreCardValues.length != 0)
        result = getters.scoreCardValues.reduce(
          (partial_sum, a) => partial_sum + a
        );

      return result;
    },
    calculatePartialScore: (state, getters) => {
      let result = 0;
      result = getters.scoreCardValuesForNumbers.reduce(
        (partial_sum, a) => partial_sum + a
      );

      return result;
    },
    calculateBonus: (state, getters) => {
      if (getters.calculatePartialScore >= 63) return 50;
      else return 0;
    },
    //Räknar ut värdet på par genom att gå igenom den sorterade arrayen och se om samma tal finns efter.
    //Returnerar det talet*2 för att få fram parets värde i spelet.
    calculatePairs: (state, getters) => {
      var results = 0;
      for (var i = 0; i < getters.sortByDesDice.length - 1; i++) {
        if (getters.sortByDesDice[i + 1] == getters.sortByDesDice[i]) {
          results = getters.sortByDesDice[i];
          break;
        }
      }
      return results * 2;
    },
    calculateThreeOfAKind: (state, getters) => {
      var results = 0;
      for (var i = 0; i < getters.sortByDesDice.length - 1; i++) {
        if (
          getters.sortByDesDice[i + 1] == getters.sortByDesDice[i] &&
          getters.sortByDesDice[i + 2] == getters.sortByDesDice[i + 1]
        ) {
          results = getters.sortByDesDice[i];
          break;
        }
      }
      return results * 3;
    },
    calculateFourOfAKind: (state, getters) => {
      var results = 0;
      for (var i = 0; i < getters.sortByDesDice.length - 1; i++) {
        if (getters.sortByDesDice[i + 3] == getters.sortByDesDice[i]) {
          results = getters.sortByDesDice[i];
          break;
        }
      }
      return results * 4;
    },
    calculateYatzy: (state, getters) => {
      var results = 0;
      for (var i = 0; i < getters.sortByDesDice.length - 1; i++) {
        if (
          getters.sortByDesDice[i] != 0 &&
          getters.sortByDesDice[i + 4] == getters.sortByDesDice[i]
        ) {
          results = 50;
          break;
        }
      }
      return results;
    },
    //Kollar om nästkommande är par, om par hoppa ett extra steg för att undvika att ta med triss som ett tvåpar.
    calculateTwoPairs: (state, getters) => {
      var results = [];
      for (var i = 0; i < getters.sortByDesDice.length - 1; i++) {
        if (getters.sortByDesDice[i + 1] == getters.sortByDesDice[i]) {
          results.push(getters.sortByDesDice[i]);
          results.push(getters.sortByDesDice[i + 1]);
          i++;
        }
      }
      //Kollar att det är mer än 3 (4) i results arrayen. Dvs att det är tvåpar.
      if (results.length > 3 && results[0] != results[3]) {
        //Metod för att addera alla värden i results arrayen. Kollar att längden är större än 4 eller högre så vi vet att det
        //är två-par
        return results.reduce((partial_sum, a) => partial_sum + a);
      } else return 0;
    },

    calculateFullHouse: (state, getters) => {
      let aggregate = getters.calculateAggregate;
      let threeOfAKind = 0;
      let pair = 0;
      let sum = 0;
      for (let i = 0; i < aggregate.length; i++) {
        if (aggregate[i].count === 3) {
          threeOfAKind = aggregate[i].number * 3;
        }
        if (aggregate[i].count === 2) {
          pair = aggregate[i].number * 2;
        }
      }
      if (threeOfAKind > 0 && pair > 0) sum = threeOfAKind + pair;

      return sum;
    },
    //Ser om det är stege genom att kolla om nästa steg i sortarede arrayen är 1 siffra högre än den förra.
    //Kollar om stor eller liten genom att se antalet 6:or.
    calculateStraight: (state, getters) => size => {
      let array = getters.sortByAscDice;
      for (let i = 0; i < array.length - 1; i++) {
        if (array[i + 1] != array[i] + 1) {
          return 0;
        }
      }
      if (getters.calculateNumbers(6) === 0 && size === "small") return 15;
      else if (getters.calculateNumbers(1) === 0 && size === "large") return 20;
      else return 0;
    },
    calculateChance: (state, getters) => {
      let array = getters.diceValues;
      return array.reduce((partial_sum, a) => partial_sum + a);
    },
    //Mockdata that can be used for testing functions that use aggregate
    mockdataArray: state => {
      let mockArray = [{ number: 4, count: 3 }, { number: 3, count: 2 }];
      return mockArray;
    },
    //mockarray for testing functions that are using number arrays
    mockNumberArray: state => {
      let mockArray = [2, 3, 4, 5, 6];
      return mockArray;
    },
    calculateAggregate: (state, getters) => {
      let aggregate = [];
      let current = null;
      let cnt = 0;

      for (let i = 0; i <= getters.sortByDesDice.length; i++) {
        if (getters.sortByDesDice[i] != current) {
          if (cnt > 0) {
            aggregate.push({ number: current, count: cnt });
          }
          current = getters.sortByDesDice[i];
          cnt = 1;
        } else {
          cnt++;
        }
      }
      return aggregate;
    },
    displayPossibleScores: (state, getters) => {
      for (let index = 0; index < getters.getOpenSlots.length; index++) {}
    }
  },
  mutations: {
    rollDice(state) {
      if (state.rollsLeft > 0) {
        // Rensar locked tärning om man rollar tärningen
        if (store.getters.activeItemExists) {
          store.commit("unlockItem", state.activeItem[0].id - 1);
        }

        state.dice.forEach(d => {
          if (!d.locked) {
            d.value = Math.floor(Math.random() * 6) + 1;
          }
        });

        store.commit("decrementRollsLeft");
      }
    },
    toggleIsMobile(state, payload) {
      if(payload===true)
      state.isMobile = true;
      else
      state.isMobile = false;
    },
    toggleLockDice(state, payload) {
      let index = state.dice.findIndex(x => x.id === payload);
      if (state.dice[index].value != 0)
        state.dice[index].locked = !state.dice[index].locked;
    },
    setScoreAndLock(state, payload) {
      //Kollar att det inte redan finns ett active item eftersom vi bara ska kunna låsa ett fält per runda.
      if (state.activeItem.length === 0) {
        state.scoreCard[payload.index].value = payload.value;
        state.scoreCard[payload.index].locked = true;
        state.activeItem.push(state.scoreCard[payload.index]);
        //Tar bort activeitem från scorecardet och lägger in det nya itemet.
      }
    },
    //kollar att itemet som ska låsas upp matchas med den som ligger i activeItem. Låser upp, nollar och tar bort activeItemen från arrayen
    unlockItem(state, payload) {
      if (
        state.activeItem[0].id === state.scoreCard[payload].id &&
        state.scoreCard[payload].unlockable === true
      ) {
        state.scoreCard[payload].locked = false;
        state.scoreCard[payload].value = 0;
        state.activeItem.pop();
      }
    },
    deepLock(state) {
      //När next klickas i ska det itemet som är locked bli unlockable = false, spara locked item i en array med 1 plats activeItem?
      //fixar så id motsvarar index i scorecard arrayen
      let id = state.activeItem[0].id - 1;
      state.scoreCard[id].unlockable = false;
    },
    popActiveItem(state) {
      state.activeItem.pop();
    },
    restoreRollsLeft(state) {
      state.rollsLeft = 3;
    },
    decrementRollsLeft(state) {
      if (state.rollsLeft > 0) state.rollsLeft--;
    },
    resetDice(state) {
      state.dice.forEach(d => {
        d.value = 0;
        d.locked = false;
      });
    },
    resetGame(state) {
      mutations.resetDice;
    }
  }
});

const Header = {
  computed: {
    scoreCard() {
      return this.$store.state.scoreCard;
    },
    totalScore() {
      return this.$store.getters.calculateTotalScore;
    }
  },
  template: `<div class="header">Adams Yatzy App | Score: {{totalScore}} 
      </div>`
};

const HeaderMobile = {
  computed: {
    scoreCard() {
      return this.$store.state.scoreCard;
    },
    totalScore() {
      return this.$store.getters.calculateTotalScore;
    }
  },
  template: `<div class="header">
  <p class="title">Adams Yatzy App | Score: {{totalScore}} </p>
  <p class="nav">
  <router-link to="/rules">Rules</router-link> |
  <router-link to="/">Game</router-link>
  </p>
      </div>`
};

const Sidebar = {

 
  template: `<div class="sidebar"> 
  <div class="rules">
  <h1>Spelregler</h1>
  <p> Varje gång en spelare står i tur har denne rätt till tre tärningskast, dock behöver inte alla kast utnyttjas. Spelaren väljer själv vilka tärningar som skall kastas om, och poängsumman införs i ett protokoll. Varje rad i protokollet motsvarar en regel som tärningarna måste uppfylla för att räknas. Till exempel på raden "femmor" får man endast skriva in poängen från de tärningar som visar fem prickar.</p>
  <p>Ordningen i protokollet behöver nödvändigtvis inte följas, men spelet blir dock mer slumpstyrt om protokollordningen följs. Denna typ av spel kallas "tvång". Spelet kan också spelas som "halvtvång". Då spelas övre delen av protokollet fritt och när alla spelare spelat klart den delen av halvan spelas undre delen av protokollet, och den totala poängsumman räknas sedan samman.</p>
  <h2>Förklaringar</h2>
  <ul>
  <li>För att få bonus måste spelaren få minst 63 poäng i de sex översta villkoren (detta motsvarar i genomsnitt tre av varje villkor). Bonus ger alltid 50 poäng oavsett poängsumman.</li>
  <li>För att få yatzy skall alla tärningarna visa lika siffror. Yatzy ger alltid 50 poäng oavsett vilken siffra som tärningarna visar.</li>
  <li>För att få liten stege (stege ibland kallat straight[2]) skall tärningarna visa siffrorna 1, 2, 3, 4 och 5. Detta ger 15 poäng.</li>
  <li>För att få stor stege skall tärningarna visa siffrorna 2, 3, 4, 5 och 6. Detta ger 20 poäng.</li>
  <li>För att få kåk skall tre av tärningarna visa ett och samma tal, samtidigt som övriga två ska visa ett och samma tal. Exempelvis 6, 6, 6, 4 och 4.</li>
  <li>Chans innebär att man ska få så högt tal som möjligt när samtliga tärningsprickar räknas samman.</li>
  <li>Spelet har 15 villkor att uppfylla. Detta kan maximalt ge 374 poäng.
  </li>


  </ul>
  </div class="rules">
  
  </div>`  
}

// Skriver ut varje tärning i tärningsfältet, ska även hålla design för tärningarna
const Die = {
  props: ["di"],
  store,
  computed: {
    id() {
      return this.di.id;
    },
    classObject() {
      let idPlusOne = this.di.id + 1;
      if (!this.di.locked) return "di " + "di" + idPlusOne;
      else return "di orange-background " + "di" + idPlusOne;
    },
    getDieUnicode() {
      if (this.di.value === 1) return "&#9856;";
      else if (this.di.value === 2) return "&#9857;";
      else if (this.di.value === 3) return "&#9858;";
      else if (this.di.value === 4) return "&#9859;";
      else if (this.di.value === 5) return "&#9860;";
      else if (this.di.value === 6) return "&#9861;";
      else return "";
    }
  },
  methods: {
    toggleLockDice(id) {
      store.commit("toggleLockDice", id);
    }
  },

  template: `<div v-bind:class="classObject" v-html="getDieUnicode" v-on:click="toggleLockDice(id)">
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
  template: `
    <div class="dice-holder">
            <die v-for="d in dice" v-bind:di="d" :key="d.id"></die>
        </div>
    `,
  components: {
    die: Die
  }
};

//Ska skriva ut varje fält i scorecardet
const Item = {
  props: ["it"],
  store,

  computed: {
    //Ser till att om det är info fältet så ska den bli klass rr istället för rw
    classObject: function() {
      if (this.isInfo) {
        return "rr " + "rw" + this.it.id;
      } else return "rw " + "rw" + this.it.id;
    },
    // Visar field med vanlig text
    // Om det är tre rolls kvar( inte  ska gå att setta något i scorecard, visa inga feta siffror)
    // Om item inte är låst, visar bold vilket vetyder att det går att klicka på den
    // Om item är selectable false (fält som inte går att trycka på), displayas de vanligt
    // Om item är är oupplåsbart, visa det med vanlig text,
    // Annars visa det nuvarande itemet med orange border.
    classObjectSubItem: function() {
      if (!this.isInfo && this.getRollsLeft === 3 && this.it.locked === true) {
        return "vl";
      } else if (
        !this.isInfo &&
        this.getRollsLeft === 3 &&
        this.it.locked === false
      )
        return "vl bold orange";
      else if (!this.isInfo && this.it.locked === false)
        return "vl bold orange";
      else if (!this.isInfo && this.it.selectable === false) return "vl";
      else if (!this.isInfo && this.it.unlockable === false) return "vl";
      else if (!this.isInfo && this.it.locked === true)
        return "vl orange-background";
    },
    // prettier-ignore
    //Kollar att scorecardet så att värdet inte är låst. Släpper dock igenom summa, bonus och total eftersom dessa alltid ska räknas ut.
    displayScore() {
      if (this.$store.state.scoreCard[this.it.id-1].locked === false || this.$store.state.scoreCard[this.it.id-1].selectable === false){
      switch (this.it.field) {
        case "ettor" : return this.calculateNumbersOne
        case "tvåor" : return this.calculateNumbersTwo 
        case "treor" : return this.calculateNumbersThree 
        case "fyror" : return this.calculateNumbersFour
        case "femmor" :return this.calculateNumbersFive 
        case "sexor" : return this.calculateNumbersSix 
        case "bonus" : return this.calculateBonus 
        case "del-summa" : return this.calculatePartialScore 
        case "par" : return this.calculatePairs 
        case "två-par" : return this.calculateTwoPairs
        case "triss" : return this.calculateThreeOfAKind
        case "fyrtal" : return this.calculateFourOfAKind
        case "liten-stege" : return this.calculateSmallStraight
        case "stor-stege" :return this.calculateLargeStraight
        case "kåk" : return this.calculateFullHouse
        case "chans" :return this.calculateChance
        case "yatzy" : return this.calculateYatzy
        default: return 0
      }
      
    } else 
    return this.$store.state.scoreCard[this.it.id-1].value;
    },
    activeItemId() {
      return this.$store.getters.activeItemId;
    },
    activeItemExists() {
      return this.$store.getters.activeItemExists;
    },
    calculateNumbersOne() {
      return this.$store.getters.calculateNumbers(1);
    },
    calculateNumbersTwo() {
      return this.$store.getters.calculateNumbers(2);
    },
    calculateNumbersThree() {
      return this.$store.getters.calculateNumbers(3);
    },
    calculateNumbersFour() {
      return this.$store.getters.calculateNumbers(4);
    },
    calculateNumbersFive() {
      return this.$store.getters.calculateNumbers(5);
    },
    calculateNumbersSix() {
      return this.$store.getters.calculateNumbers(6);
    },
    calculateBonus() {
      return this.$store.getters.calculateBonus;
    },
    calculatePairs() {
      return this.$store.getters.calculatePairs;
    },
    calculateThreeOfAKind() {
      return this.$store.getters.calculateThreeOfAKind;
    },
    calculateTwoPairs() {
      return this.$store.getters.calculateTwoPairs;
    },
    scoreCardValuesForNumbers() {
      return this.$store.getters.scoreCardValuesForNumbers;
    },
    calculateFourOfAKind() {
      return this.$store.getters.calculateFourOfAKind;
    },
    calculateFullHouse() {
      return this.$store.getters.calculateFullHouse;
    },
    calculateSmallStraight() {
      return this.$store.getters.calculateStraight("small");
    },
    calculateLargeStraight() {
      return this.$store.getters.calculateStraight("large");
    },
    calculateYatzy() {
      return this.$store.getters.calculateYatzy;
    },
    calculatePartialScore() {
      return this.$store.getters.calculatePartialScore + "/63";
    },
    calculateTotalScore() {
      return this.$store.getters.calculateTotalScore;
    },
    calculateChance() {
      return this.$store.getters.calculateChance;
    },
    getRollsLeft() {
      return this.$store.state.rollsLeft;
    },
    isInfo() {
      return this.it.field === "info" ? true : false;
    }
  },
  methods: {
    // 1. Kollar först att det finns tärningar så att man inte lockar innan man har rollat
    // 2. Ser om det redan finns ett activeItem och att det inte är samma id som det man klickade på, isåfall låser den upp det först innan den lägger in det nya.
    // 3. Lägger in värdet med setScoreAndLock
    // 4. Om det är samma id på det aktiva itemet som det man klickar på vill vi enbart låsa upp fältet och inte lägga in något nytt.
    toggleLockToScoreCard() {
      if (this.getRollsLeft != 3) {
        if (this.activeItemExists && this.activeItemId != this.it.id) {
          let index = this.activeItemId - 1;
          store.commit("unlockItem", index);
        }
        if (this.$store.state.scoreCard[this.it.id - 1].locked === false) {
          let payload = { index: this.it.id - 1, value: this.displayScore };
          store.commit("setScoreAndLock", payload);
        } else if (this.activeItemExists && this.activeItemId === this.it.id) {
          let index = this.activeItemId - 1;
          store.commit("unlockItem", index);
        }
      }
    }
  },

  template: `
         <div v-bind:class="classObject" v-on:click="toggleLockToScoreCard">
          <div v-if="!isInfo" class="fi">{{it.field}}</div>
          <div v-else-if="isInfo">Get 63p in this column to unlock 50p bonus!</div>

          <div v-if="!isInfo" v-bind:class="classObjectSubItem">{{displayScore}}</div>
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

// Håller actionknappsfältet med roll knapp och hur många rolls det kvarfunktion
const Actions = {
  store,
  computed: {
    getOpenSlots() {
      return this.$store.getters.getOpenSlots;
    },
    getRollsLeft() {
      return this.$store.state.rollsLeft;
    },
    activeItemExists() {
      if (this.$store.state.activeItem.length > 0) return true;
      else return false;
    },
    ahOneSlot() {
      if (
        !this.activeItemExists ||
        this.getRollsLeft === 0 ||
        this.getRollsLeft === 3
      )
        return true;
      else return false;
    },
    ahTwoSlot() {
      return !this.ahOneSlot;
    },
    activeItem() {
      return this.$store.state.activeItem;
    }
  },

  methods: {
    rollDice() {
      store.commit("rollDice");
    },
    logName() {
      console.log("you pressed enter");
    },
    decrementRollsLeft() {
      store.commit("decrementRollsLeft");
    },
    nextRound() {
      if (this.activeItemExists) {
        //Nollar tärningarna så man inte kan klicka på något
        store.commit("resetDice");
        //Fixar deeplock på det aktiva itemet i scorecardet och nollställer activeItemArrayen set available rolls to r again
        store.commit("deepLock");
        store.commit("popActiveItem");
        store.commit("restoreRollsLeft");
      }
    }
  },
  template: `
  <div v-bind:class="{'ah-one-slot black-border' : ahOneSlot, 'action-holder' : ahTwoSlot}"> 
            <div v-if="!activeItemExists && getRollsLeft===0" class="info"> Assign your slot before continueing</div>
            <div v-else-if="ahOneSlot && getRollsLeft!=0" class="info" v-on:click="rollDice" v-on:keyup.enter="rollDice">roll: {{getRollsLeft}} left</div>
            <div v-else-if="getRollsLeft===0 && activeItemExists" class="info" v-on:click="nextRound">Play</div>

            <div v-if="activeItemExists && getRollsLeft!=0" class="roll" v-on:click="rollDice">roll: {{getRollsLeft}} left</div>
            <div v-if="getRollsLeft!=3 && getRollsLeft!=0 && activeItemExists" class="next" v-on:click="nextRound">Play</div>
               
   </div>`
};

const RulesMobile = {

  template: ` <div>
  <div class="rule-nav">
  <p>
  <router-link to="/rules">Rules</router-link> |
  <router-link to="/">Game</router-link>
  </p>
  </div>
  
  <sidebar-holder></sidebar-holder>
  </div>
  `,

  components: {
    "sidebar-holder" : Sidebar,
  }
}

const Container = {
  
  computed: {
    isMobile(){
      return this.$store.state.isMobile;
    }
  },

  template: `<section class="container">
  <header-holder v-if="!isMobile">Yatzy, Totals. </header-holder>
                <header-holder-mobile v-else>Yatzy, Totals. </header-holder-mobile>
                <sidebar-holder v-if="!isMobile"></sidebar-holder>
                <score-card>Score Card</score-card>
                <dice-holder>Dice Holder</dice-holder>
                <action-holder>Action Holder</action-holder>
                </section>
  `,
  components: {
    "dice-holder": DiceHolder,
    "action-holder": Actions,
    "header-holder": Header,
    "header-holder-mobile": HeaderMobile,
    "sidebar-holder" : Sidebar,
    "rules-mobile" : RulesMobile
  }
}

const routes = [
  { path: '/rules', component: RulesMobile },
  { path: '/', component: Container }
]

const router = new VueRouter({
  routes
  
})

const app = new Vue({
  store: store,
  el: "#app",
  router,
  computed: {
    activeItemExists() {
      return this.$store.getters.activeItemExists;
    },
    isMobile(){
      return this.$store.state.isMobile;
    }
  
  },
  methods: {

    detectMobile() {
      if(window.innerWidth <= 600) {
        store.commit('toggleIsMobile', true)
      } else {
        store.commit('toggleIsMobile', false)
     }
  },
    
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
    nextRound() {
      if (this.activeItemExists) {
        //Nollar tärningarna så man inte kan klicka på något
        store.commit("resetDice");
        //Fixar deeplock på det aktiva itemet i scorecardet och nollställer activeItemArrayen set available rolls to r again
        store.commit("deepLock");
        store.commit("popActiveItem");
        store.commit("restoreRollsLeft");
      }
    },
    startKeyEventListener() {
      var current = this;
      window.addEventListener("keyup", function(event) {
        // Space för att rolla enter för att gå till nästa runda och siffror för att låsa tärningar.
        // Om det inte finns några rolls kvar blir båda space och enter nästa runda.
        if (event.key === " ") {
          if (store.state.rollsLeft === 0) current.nextRound();
          else store.commit("rollDice");
        } else if (event.key === "Enter") {
          current.nextRound();
        } else if (event.key === "1") {
          store.commit("toggleLockDice", 0);
        } else if (event.key === "2") {
          store.commit("toggleLockDice", 1);
        } else if (event.key === "3") {
          store.commit("toggleLockDice", 2);
        } else if (event.key === "4") {
          store.commit("toggleLockDice", 3);
        } else if (event.key === "5") {
          store.commit("toggleLockDice", 4);
        }
      });
    },

    startResizeListener() {
      var current = this;
      window.addEventListener("resize", ()=> {
        if(current.$store.state.isMobile===false && window.innerWidth <= 600 ) {
          store.commit('toggleIsMobile', true)
        } else if (current.$store.state.isMobile===true && window.innerWidth > 600) {
          store.commit('toggleIsMobile', false)
       }
      });
    },

    initScoreCard() {
      let fieldArray = [
        "ettor",
        "tvåor",
        "treor",
        "fyror",
        "femmor",
        "sexor",
        "del-summa",
        "bonus",
        "info",
        "par",
        "två-par",
        "triss",
        "fyrtal",
        "liten-stege",
        "stor-stege",
        "kåk",
        "chans",
        "yatzy"
      ];
      //Lägger så att bonus del-summa och totalt är låsta.
      for (let index = 0; index < fieldArray.length; index++) {
        let indexPlusOne = index + 1;
        if (
          fieldArray[index] === "bonus" ||
          fieldArray[index] === "del-summa" ||
          fieldArray[index] === "info"
        ) {
          store.state.scoreCard.push({
            id: indexPlusOne,
            field: fieldArray[index],
            value: 0,
            locked: true,
            unlockable: false,
            selectable: false
          });
        } else {
          store.state.scoreCard.push({
            id: indexPlusOne,
            field: fieldArray[index],
            value: 0,
            locked: false,
            unlockable: true,
            selectable: true
          });
        }
      }
    }
  },
  //Kör när vuen skapas
  mounted() {
    this.initDice();
    this.initScoreCard();
    this.startKeyEventListener();
    this.detectMobile();
    this.startResizeListener();
    
  },
  components: {
    "dice-holder": DiceHolder,
    "action-holder": Actions,
    "header-holder": Header,
    "header-holder-mobile": HeaderMobile,
    "sidebar-holder" : Sidebar,
    "container-holder" : Container
  }
});


