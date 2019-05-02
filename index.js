const store = new Vuex.Store({
  state: {
    dice: [],
    scoreCard: [],
    rollsLeft: 3,
    activeItem: [],
    playedItems: [],
    isMobile: false,
    rollingInProgress: false,
    victoryScreen: false,
    animation: false
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
    checkEndGame: state => {
      return state.playedItems.length === 15 ? true : false;
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
      if (
        getters.sortByDesDice[0] != 0 &&
        getters.sortByDesDice[4] == getters.sortByDesDice[0]
      ) {
        results = 50;
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
    //Gör en aggregate array på hur många antal det finns av varje dice. Måst ha med state även fast den inte används.
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
    initScoreCard(state) {
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
          state.scoreCard.push({
            id: indexPlusOne,
            field: fieldArray[index],
            value: 0,
            locked: true,
            unlockable: false,
            selectable: false
          });
        } else {
          state.scoreCard.push({
            id: indexPlusOne,
            field: fieldArray[index],
            value: 0,
            locked: false,
            unlockable: true,
            selectable: true
          });
        }
      }
    },
    //Lägger in 5 tärningar
    initDice(state) {
      for (let index = 0; index < 5; index++) {
        state.dice.push({
          id: index,
          value: 0,
          locked: false
        });
      }
    },

    changeDieValue(state, payload) {
      state.dice[payload.index].value = payload.value;
    },
    toggleIsMobile(state, payload) {
      if (payload === true) state.isMobile = true;
      else state.isMobile = false;
    },
    //Kollar så att tärningarna har ett värde och att dom inte rullas innan låset går igenom.
    toggleLockDice(state, payload) {
      let index = state.dice.findIndex(x => x.id === payload);
      if (state.dice[index].value != 0 && state.rollingInProgress === false)
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
    pushToPlayedItems(state) {
      if (state.activeItem.length > 0) {
        state.playedItems.push(state.activeItem[0]);
      }
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
    toggleAnimation(state) {
      state.animation = !state.animation;
    },
    resetDice(state) {
      state.dice.forEach(d => {
        d.value = 0;
        d.locked = false;
      });
    }
  },
  //Lägger i actions pga async. rollingInProgress fixar så att vi inte räknar ut medan tärningarna rullas.  Kör 7 rolls sen klar och kör decrementRollsLeft
  actions: {
    rollDice({ commit, state, getters }) {
      if (state.rollsLeft > 0) {
        // Rensar locked tärning om man rollar tärningen
        if (getters.activeItemExists) {
          commit("unlockItem", state.activeItem[0].id - 1);
        }
        state.dice.forEach(d => {
          if (!d.locked) {
            state.rollingInProgress = true;
            var i = 0;
            var id = setInterval(frame, 75);
            //settar random värde på tärningen
            function frame() {
              if (i == 7) {
                clearInterval(id);
                state.rollingInProgress = false;
              } else {
                commit("changeDieValue", {
                  index: d.id,
                  value: Math.floor(Math.random() * 6) + 1
                });
                i++;
              }
            }
          }
        });

        commit("decrementRollsLeft");
      }
    },

    nextRound({ state, commit, getters, dispatch }) {
      if (getters.activeItemExists) {
        //Nollar tärningarna så man inte kan klicka på något
        commit("resetDice");
        //Fixar deeplock på det aktiva itemet i scorecardet och nollställer activeItemArrayen set available rolls to 3 again
        commit("deepLock");
        commit("pushToPlayedItems");
        commit("popActiveItem");
        commit("restoreRollsLeft");
        if (getters.checkEndGame) {
          dispatch("presentVictoryScreen");
        }
      }
    },

    resetGame({ state, commit }) {
      state.scoreCard.splice(0, state.scoreCard.length);
      state.playedItems.splice(0, state.playedItems.length);
      commit("initScoreCard");
    },

    presentVictoryScreen({ commit, state, getters, dispatch }) {
      state.victoryScreen = true;
      setTimeout(() => {
        dispatch("resetGame");
        state.victoryScreen = false;
      }, 4500);
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
  template: `<div class="header">Adams Yatzy App | Totala Poäng: {{totalScore}} 
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
  <p class="title">Adams Yatzy App | Totala Poäng: {{totalScore}} </p>
  <p class="nav">
  <router-link to="/rules">Hur man spelar</router-link> |
  <router-link to="/">Till spelet</router-link>
  </p>
      </div>`
};

const Victory = {
  computed: {
    totalScore() {
      return this.$store.getters.calculateTotalScore;
    }
  },

  template: `<div>
  <div class="victory">
Yatzy Royale!<br>
Dina sammanlagda poäng blev:  {{totalScore}} !<br>
Spelet kommer att startas om inom kort...
      </div class="victory">
      </div>`
};

const Sidebar = {
  template: `<div class="sidebar"> 
  <div class="rules">
  <h2>Hur man spelar</h2>
  <p>Börja med att slå tärningarna och se vad för resultat de visar. Tärningar du vill behålla kan du låsa genom att klicka på dem. Rullar du tärningarna igen behåller de låsta tärningarna sina värden.</p>
  <p>Programmet räknar fram hur mycket du får om du lägger en viss kombination. Valbara kombinationer blinkar.</p>
  <p>När du har valt kombination väljer du knappen "Lås in vald kombination" för att fortsätta till nästa runda.<p>
  <p>När alla fält är tagna är spelet slut.</p>

  <h2>Kontroller</h2>
  <p>Du styr spelet med hjälp av musen och tangentbordet. Kör du på en telefon klickar du på knapparna.</p>
  <p>Knapp 1,2,3,4 och 5 låser respektive tärning från vänster. Mellanslag rullar tärningarna och Enter går vidare till nästa runda när det är möjligt.</p>
 
  <h2>Länk till regler för spelet</h2>
  <a href="https://sv.wikipedia.org/wiki/Yatzy">Yatzy regler på svenska</a>
  </div class="rules">
  
  </div>`
};

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
      if (!this.di.locked && store.state.rollsLeft === 3)
        return "di " + "di" + idPlusOne;
      else if (store.state.rollingInProgress && !this.di.locked) return "di " + "di" + idPlusOne;
      else if (!this.di.locked && this.$store.state.animation === false)
        return "blink-infinite pointer di " + "di" + idPlusOne;
      else if (!this.di.locked && this.$store.state.animation === true)
        return "blink-infinite-two pointer di " + "di" + idPlusOne;
      else return "di orange-background pointer " + "di" + idPlusOne;
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
      if (this.di.locked === true) {
        store.commit("toggleAnimation");
      }
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
    // Om det är tre rolls kvar( då det inteska gå att setta något i scorecard, visa inga feta siffror)
    // Om item inte är låst, visar bold vilket vetyder att det går att klicka på den samt blinka den
    // Om animation ändras byt klass på animation (är samma men detta är för att resetta)
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
      else if (
        !this.isInfo &&
        this.it.locked === false &&
        this.rollingInProgress === true
      )
        return "vl bold orange pointer";
      else if (
        !this.isInfo &&
        this.it.locked === false &&
        this.rollingInProgress === false &&
        this.$store.state.animation === false
      )
        return "vl bold orange blink-infinite pointer";
      else if (
        !this.isInfo &&
        this.it.locked === false &&
        this.rollingInProgress === false &&
        this.$store.state.animation === true
      )
        return "vl bold orange blink-infinite-two pointer";
      else if (!this.isInfo && this.it.selectable === false) return "vl";
      else if (!this.isInfo && this.it.unlockable === false) return "vl";
      else if (!this.isInfo && this.it.locked === true)
        return "vl orange-background pointer";
    },
    // prettier-ignore
    //Kollar att scorecardet så att värdet inte är låst. Släpper dock igenom summa, bonus och total eftersom dessa alltid ska räknas ut.
    displayScore() {
      if (this.$store.state.rollingInProgress && this.$store.state.scoreCard[this.it.id-1].selectable === true) 
      return this.$store.state.scoreCard[this.it.id-1].value;
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
    },
    rollingInProgress() {
      return this.$store.state.rollingInProgress;
    }
  },
  methods: {
    // 1. Kollar först att det finns tärningar eller att den håller på att rulla så att man inte lockar innan man har rollat
    // 2. Ser om det redan finns ett activeItem och att det inte är samma id som det man klickade på, isåfall låser den upp det först innan den lägger in det nya.
    // 3. Lägger in värdet med setScoreAndLock
    // 4. Om det är samma id på det aktiva itemet som det man klickar på vill vi enbart låsa upp fältet och inte lägga in något nytt.
    toggleLockToScoreCard() {
      store.commit("toggleAnimation");
      if (this.getRollsLeft != 3 && this.rollingInProgress === false) {
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
          <div v-else-if="isInfo">Få 63p i den här kolumnen för att få en extra 50p bonus!</div>
 
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
        <div class="cbvl cb1">Kombination</div>
        <div class="cbvl vl1">Poäng</div>
        <div class="cbvl cb2">Kombination</div>
        <div class="cbvl vl2">Poäng</div>
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
    },
    checkEndGame() {
      return this.$store.getters.checkEndGame;
    },
    rollingInProgress() {
      return this.$store.state.rollingInProgress;
    },
    animation() {
      return this.$store.state.animation;
    },
    classObject() {
      console.log("classobject running");
      if (this.ahOneSlot && !this.activeItemExists && this.getRollsLeft === 0) {
        console.log('1')
        return "info";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft === 3 &&
        this.animation === false
      ) {
        return "info blink-infinite pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft === 3 &&
        this.animation === true
      ) {
        return "info blink-infinite-two pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft > 0 &&
        this.rollingInProgress
      ) {
        return "info pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft > 0 &&
        this.animation === false
      ) {
        return "info blink-infinite pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft > 0 &&
        this.animation === true
      ) {
        return "info blink-infinite-two pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft === 0 &&
        this.activeItemExists &&
        this.animation === false
      ) {
        return "info blink-infinite pointer";
      } else if (
        this.ahOneSlot &&
        this.getRollsLeft === 0 &&
        this.activeItemExists &&
        this.animation === true
      ) {
        return "info blink-infinite-two pointer";
      } else return "";
    }
  },

  methods: {
    rollDice() {
      store.dispatch("rollDice");
    },
    //togglar till true i två sekunder.
    logName() {
      console.log("you pressed enter");
    },
    decrementRollsLeft() {
      store.commit("decrementRollsLeft");
    },
    nextRound() {
      this.$store.dispatch("nextRound");
    }
  },
  template: `
  <div v-bind:class="{'ah-one-slot black-border' : ahOneSlot, 'action-holder' : ahTwoSlot}"> 
            <div v-if="!activeItemExists && getRollsLeft===0" v-bind:class="classObject"> Välj kombination innan du fortsätter!</div>
            <div v-else-if="ahOneSlot && getRollsLeft===3" v-bind:class="classObject" v-on:click="rollDice">Slå tärningarna, {{getRollsLeft}} kast kvar</div>
            <div v-else-if="ahOneSlot && getRollsLeft>0 && rollingInProgress" v-bind:class="classObject" v-on:click="rollDice">Slå tärningarna här eller välj kombination ovan, {{getRollsLeft}} kast kvar</div>
            <div v-else-if="ahOneSlot && getRollsLeft>0" v-bind:class="classObject" v-on:click="rollDice">Slå tärningarna här eller välj kombination ovan, {{getRollsLeft}} kast kvar</div>
            <div v-else-if="getRollsLeft===0 && activeItemExists" v-bind:class="classObject" v-on:click="nextRound">Lås in vald kombination</div>

            <div v-if="activeItemExists && getRollsLeft!=0 && animation === false" class="roll blink-infinite pointer" v-on:click="rollDice">Slå tärningarna, {{getRollsLeft}} kast kvar</div>
            <div v-else-if="activeItemExists && getRollsLeft!=0 && animation === true" class="roll blink-infinite-two pointer" v-on:click="rollDice">Slå tärningarna, {{getRollsLeft}} kast kvar</div>
            <div v-if="getRollsLeft!=3 && getRollsLeft!=0 && activeItemExists && animation === false" class="next blink-infinite pointer" v-on:click="nextRound">Lås in vald kombination</div>
            <div v-if="getRollsLeft!=3 && getRollsLeft!=0 && activeItemExists && animation === true" class="next blink-infinite-two pointer" v-on:click="nextRound">Lås in vald kombination</div>
               
   </div>`
};

const RulesMobile = {
  template: ` <div>
  <div class="rule-nav">
  <p>
  <router-link to="/rules">Hur man spelar</router-link> |
  <router-link to="/">Till Spelet</router-link>
  </p>
  </div>
  
  <sidebar-holder></sidebar-holder>
  </div>
  `,

  components: {
    "sidebar-holder": Sidebar
  }
};

const Container = {
  computed: {
    isMobile() {
      return this.$store.state.isMobile;
    },
    victoryScreen() {
      return this.$store.state.victoryScreen;
    },
    classObject() {
      if (this.victoryScreen) return "victory-container";
      else return "container";
    }
  },
  methods: {},

  template: `
  <div>
  <transition name="fade">
  <section v-if="!victoryScreen" v-bind:class="classObject">

  <header-holder v-if="!isMobile && !victoryScreen">Yatzy, Totals. </header-holder>
                <header-holder-mobile v-else-if="isMobile && !victoryScreen">Yatzy, Totals. </header-holder-mobile>
                <sidebar-holder v-if="!isMobile && !victoryScreen"></sidebar-holder>
                <score-card v-if="!victoryScreen">Score Card</score-card>
                <dice-holder v-if="!victoryScreen">"Dice Holder</dice-holder>
                <action-holder v-if="!victoryScreen">Action Holder</action-holder>
                </section>
                </transition>
                <transition name="fade">
  <victory-holder v-if="victoryScreen" v-bind:class="classObject">></victory-holder>
  </transition>
               
                </div>
  `,
  components: {
    "dice-holder": DiceHolder,
    "action-holder": Actions,
    "header-holder": Header,
    "header-holder-mobile": HeaderMobile,
    "sidebar-holder": Sidebar,
    "rules-mobile": RulesMobile,
    "victory-holder": Victory
  }
};

const routes = [
  { path: "/rules", component: RulesMobile },
  { path: "/", component: Container }
];

const router = new VueRouter({
  routes
});

const app = new Vue({
  store: store,
  el: "#app",
  router,
  computed: {
    activeItemExists() {
      return this.$store.getters.activeItemExists;
    },
    isMobile() {
      return this.$store.state.isMobile;
    }
  },
  // Som media query men för vue komponenter.
  methods: {
    detectMobile() {
      if (window.innerWidth <= 870) {
        store.commit("toggleIsMobile", true);
      } else {
        store.commit("toggleIsMobile", false);
      }
    },
    startKeyEventListener() {
      var current = this;
      window.addEventListener("keyup", function(event) {
        // Space för att rolla enter för att gå till nästa runda och siffror för att låsa tärningar.
        // Om det inte finns några rolls kvar blir båda space och enter nästa runda.
        if (event.key === " ") {
          if (store.state.rollsLeft === 0) current.nextRound();
          else store.dispatch("rollDice");
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
      window.addEventListener("resize", () => {
        if (
          current.$store.state.isMobile === false &&
          window.innerWidth <= 870
        ) {
          store.commit("toggleIsMobile", true);
        } else if (
          current.$store.state.isMobile === true &&
          window.innerWidth > 870
        ) {
          store.commit("toggleIsMobile", false);
        }
      });
    },

    nextRound() {
      this.$store.dispatch("nextRound");
    }
  },
  //Kör när vuen skapas
  mounted() {
    this.$store.commit("initDice");
    this.$store.commit("initScoreCard");
    this.startKeyEventListener();
    this.detectMobile();
    this.startResizeListener();
  },
  beforeCreated() {
    this.detectMobile();
  },
  components: {
    "container-holder": Container,
    "victory-holder": Victory
  }
});
