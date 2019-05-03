//Programflöde:
//1 : Vue, vuex och router skaps upp. Vue kör detectMobile för att se skärmstorleken och anpassar vilka components som ska visas efter detta.
//2 : Arrayer med tärningar och scoreCard fylls med data. (se init-metoderna).
//3 : De olika arrayerna loopas sedan igenom i komponenter där olika värden sätts beroende på om t.ex. tärningarna är låste, fält klickade på eller inte.
//4 : I scorecardfältet körs metoderna från getters i store som räknar ut möjliga värden på fälten beroende på nuvarande tärningskombinationer.
//5 : Om man väljer att låsa in fältet läggs det in som ett låst värde i scorecard samt att itemet pushas till played Items.
//6.: När played Items är full körs victory screen och programmet resettas.
//7 : Det finns även en komponent för "hur man spelar" som finns med automatiskt i desktop och via klick från router-länk i headern på mobile.
//8 : Det finns diverse metoder som ska underlätta för spelarn att se vilka fält som är möjliga att klicka på (mouseover pointer och blinkande)
//    Samt att fälten ändrar färg när man togglar dom.

För att köra sidan, kör index.html i webbläsaren.
Den ligger även uppe på https://adambremholm.github.io
