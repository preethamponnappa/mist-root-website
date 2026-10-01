/**
 * The six recipes, as data.
 *
 * Read by the brewing index, by each /brewing/<method> page, and by the build
 * when it assembles the route list and the sitemap — which is why this file
 * holds no JSX and no asset imports: Node loads it directly.
 *
 * The illustration is named rather than imported; the pages map the name to a
 * component from src/components/Icons.jsx.
 */
import { coffeeById } from './business.js';

export const METHODS = [
  {
    id: 'pour-over',
    name: 'Pour Over',
    drawing: 'PourOverDrawing',
    tagline: 'For the lot you want to hear clearly.',
    grind: 'Medium-fine',
    grindPos: 42,
    ratio: '1 : 16',
    dose: '20 g / 320 g',
    temp: '92 °C',
    time: '3:15–3:30',
    bestCoffeeId: 'highland-reserve',
    body: 'A cone strips a coffee of anywhere to hide. If a lot has a jasmine tail or a mineral edge, this is where you will find it — and if it has a flaw, this is where that shows up too. We cup on a V60 for exactly that reason.',
    steps: [
      { t: '0:00', d: 'Rinse the paper with boiling water, discard, add 20 g of grounds and level the bed.' },
      { t: '0:00–0:30', d: 'Bloom with 50 g. Swirl once, gently, until the surface goes matte. Wait.' },
      { t: '0:30–1:30', d: 'Pour to 200 g in slow concentric circles. Never touch the wall of the paper.' },
      { t: '1:30–2:30', d: 'Pour to 300 g. Give the brewer one last swirl to flatten the bed.' },
      { t: '2:30–3:30', d: 'Pour to 320 g and wait for the drawdown to complete. If it finished before 3:15 go finer; after 3:30, coarser.' },
    ],
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    drawing: 'AeroPressDrawing',
    tagline: 'The one that travels, and forgives.',
    grind: 'Fine-medium',
    grindPos: 28,
    ratio: '1 : 13',
    dose: '17 g / 220 g',
    temp: '90 °C',
    time: '2:10',
    bestCoffeeId: 'highland-arabica',
    body: 'Immersion plus a little pressure. Lower temperature than you think, because the contact is total — 90 °C keeps the sweetness in place instead of pulling it bitter. Inverted, always, whatever the internet says.',
    steps: [
      { t: '0:00', d: 'Inverted. 17 g in, 220 g of 90 °C water straight down the middle.' },
      { t: '0:10', d: 'Stir five times, north-south. Cap with a rinsed paper filter.' },
      { t: '0:10–1:30', d: 'Leave it. Do not agitate, do not fidget with it.' },
      { t: '1:30', d: 'Flip onto the cup and press, slowly, over thirty to forty seconds.' },
      { t: '2:10', d: 'Stop the moment you hear the hiss. Everything after the hiss is regret.' },
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    drawing: 'FrenchPressDrawing',
    tagline: 'Weight, texture, and no ceremony.',
    grind: 'Coarse',
    grindPos: 78,
    ratio: '1 : 15',
    dose: '40 g / 600 g',
    temp: '96 °C',
    time: '8:00',
    bestCoffeeId: 'forest-reserve',
    body: 'The only method that keeps every oil the roast produced. It will not give you clarity and it is not trying to. What it gives you is body — the closest thing to drinking the coffee the way the cupping table drinks it.',
    steps: [
      { t: '0:00', d: '40 g coarse, 600 g of water just off the boil, poured hard to break the bed.' },
      { t: '4:00', d: 'Break the crust with a spoon, then skim the foam and floaters off the top.' },
      { t: '4:00–8:00', d: 'Lid on, plunger resting on the surface. Do not press yet.' },
      { t: '8:00', d: 'Press slowly to just below the surface — never all the way to the bottom.' },
      { t: '8:30', d: 'Decant everything immediately. Coffee left on the grounds turns to ash.' },
    ],
  },
  {
    id: 'moka-pot',
    name: 'Moka Pot',
    drawing: 'MokaPotDrawing',
    tagline: 'The one most Indian kitchens already own.',
    grind: 'Fine-medium',
    grindPos: 24,
    ratio: '1 : 8',
    dose: '18 g / 150 g',
    temp: 'Pre-boiled',
    time: '4:00',
    bestCoffeeId: 'estate-robusta',
    body: 'Unfairly maligned, usually because people start it cold and walk away. Fill the boiler with water that has already boiled, keep the flame low, and take it off the heat the moment the stream turns pale. Done properly it is closer to a rich filter coffee than to espresso, and it is very hard to beat on a wet morning.',
    steps: [
      { t: 'Prep', d: 'Fill the boiler to just below the valve with water off the boil. Use a towel — it is hot.' },
      { t: '0:00', d: '18 g in the basket, levelled, never tamped. Screw the top on and set a low flame.' },
      { t: '2:30–3:30', d: 'Coffee should arrive as a slow, dark stream. A violent sputter means the flame is too high.' },
      { t: '4:00', d: 'The moment the stream goes pale and hisses, off the heat and onto a wet cloth.' },
      { t: 'After', d: 'Stir the pot before pouring — the first and last of the extraction are not the same coffee.' },
    ],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    drawing: 'ColdBrewDrawing',
    tagline: 'For everyone who says they dislike black coffee.',
    grind: 'Coarse',
    grindPos: 88,
    ratio: '1 : 8',
    dose: '100 g / 800 g',
    temp: 'Room, then cold',
    time: '16 hrs',
    bestCoffeeId: 'forest-reserve',
    body: 'The most forgiving thing on this list and the best convincer we own. No heat means almost none of the acidity that puts people off, so what is left is sweetness and body. Make it as a concentrate and cut it to taste — over ice, with water, with milk, with tonic if it is April.',
    steps: [
      { t: '0:00', d: '100 g coarse into 800 g of filtered water at room temperature. Stir once to wet it all.' },
      { t: '0:00–4:00', d: 'Leave it on the counter. The first hours at room temperature do most of the extracting.' },
      { t: '4:00–16:00', d: 'Into the fridge for the rest. Beyond about twenty hours it turns woody.' },
      { t: '16:00', d: 'Strain through a cloth, then once more through paper. Do not squeeze the grounds.' },
      { t: 'Serving', d: 'This is a concentrate. Start at one part coffee to two parts water or milk, then adjust.' },
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    drawing: 'EspressoDrawing',
    tagline: 'Nine bars and nowhere to hide.',
    grind: 'Fine',
    grindPos: 12,
    ratio: '1 : 2.2',
    dose: '18 g / 40 g',
    temp: '93 °C',
    time: '28 s',
    bestCoffeeId: 'estate-robusta',
    body: 'A good Robusta pulls the best shot we make — low acidity, heavy body, and a crema that actually holds. We go slightly long at 1:2.2 rather than 1:2, which keeps the chocolate sweet instead of letting it turn to ash. The Arabicas work here too; they simply want a finer grind and more patience.',
    steps: [
      { t: 'Prep', d: '18 g in a clean basket. Distribute, then tamp level. Level matters more than hard.' },
      { t: '0:00', d: 'Lock in and start immediately. A hot basket sitting idle scorches the puck.' },
      { t: '0:00–0:08', d: 'First drops should appear between six and nine seconds. Later means grind coarser.' },
      { t: '0:28', d: 'Stop at 40 g in the cup. Weigh it — the eye lies about espresso every time.' },
      { t: 'After', d: 'Taste before you adjust anything, and change only one variable at a time.' },
    ],
  },
];

/** The coffee each method suits best, resolved from the shared lineup. */
export const bestCoffeeFor = (method) => coffeeById(method.bestCoffeeId);

export const methodById = (id) => METHODS.find((m) => m.id === id);
