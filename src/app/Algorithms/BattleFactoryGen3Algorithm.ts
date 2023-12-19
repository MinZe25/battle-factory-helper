import {Pokemon, PokemonSet} from "../Models/Pokemon";
import {IPokemonService} from "../services/IPokemonService";

export class BattleFactoryGen3Algorithm implements Algorithm {
  constructor(private pokemonService: IPokemonService) {
  }

  getSets(party: PokemonSet, enemy: PokemonSet, level: FrontierLevel, round: number, type: PokemonType, battleStyle: BattleStyle): PokemonSet[] {
    const partySpecies = party.pokemons.map(x => x.specie);
    const possiblePokemon = this.pokemonService.getPokemonFromGroup(level, round)
      .filter(p =>
        !partySpecies.includes(p.specie) &&
        !this.isAForbiddenPokemon(p, level, round) &&
        (this.canFilterVariant(level, round) ? p.set == this.getRoundVariant(level, round) : true) &&
        this.isValidPokemonForEnemyParty(p, enemy)
      )
    const result: PokemonSet[] = [];
    console.log("calculating sets...");
    this.generatePokemonSets(possiblePokemon, enemy, type, battleStyle, [], result);
    console.log("Calculated sets, total length: ", result.length);
    return result;
  }

  private isValidPokemonForEnemyParty(pokemon: Pokemon, enemy: PokemonSet, forceFind = false): boolean {
    const found = enemy.pokemons.find(x => x.specie === pokemon.specie);
    if (!found) return !forceFind;
    if (!!found.item && found.item !== pokemon.item) return false;
    if (!!found.ability && found.ability !== pokemon.ability) return false;
    for (let move of found.moves.filter(x => !!x && x.length > 3)) {
      if (!pokemon.moves.includes(move)) return false;
    }
    return true;
  }

  private isAForbiddenPokemon(pokemon: Pokemon, level: FrontierLevel, round: number): boolean {
    if (pokemon.specie == "Unown") return true;
    switch (level) {
      case FrontierLevel.Level50:
        if (["Dragonite", "Tyranitar"].includes(pokemon.specie)) return true;

        if (round >= 8 && ["Articuno", "Zapdos", "Moltres", "Raikou", "Entei", "Suicune"].includes(pokemon.specie)) {
          return pokemon.set >= 5;
        }
        return round < 8 && this.legendaryPokemon.includes(pokemon.specie);
      case FrontierLevel.OpenLevel:
        return round <= 5 ? this.legendaryPokemon.includes(pokemon.specie) : false;
    }
  }

  private getRoundVariant(level: FrontierLevel, round: number): number {
    switch (level) {
      case FrontierLevel.Level50:
        switch (round) {
          case 1:
          case 2:
          case 4:
            return 1;
          case 3:
          case 5:
            return 2;
          case 6:
            return 3;
          default:
            return 4;
        }
      case FrontierLevel.OpenLevel:
        return round;
    }
  }

  private canFilterVariant(level: FrontierLevel, round: number): boolean {
    switch (level) {
      case FrontierLevel.Level50:
        return round <= 7;
      case FrontierLevel.OpenLevel:
        return round <= 4;
    }
  }

  //GPT
  private generatePokemonSets(possiblePokemon: Pokemon[], enemy: PokemonSet, type: PokemonType, battleStyle: number, currentSet: Pokemon[], result: PokemonSet[]): void {
    //TODO: Optimize this to validate every time, not only when it gets to three
    if (currentSet.length === 3) {
      // Check if the current set meets the requirements
      if (this.isValidSet(currentSet, enemy, type, battleStyle)) {
        const newPokemonSet = new PokemonSet();
        newPokemonSet.pokemons = currentSet.slice();
        result.push(newPokemonSet);
      }
      return;
    }
    const enemySpecies = enemy.pokemons.map(x => x.specie);
    for (const pokemon of possiblePokemon) {
      if (!currentSet.map(x => x.specie).includes(pokemon.specie) && this.isValidPokemonForEnemyParty(pokemon, enemy)) {
        if (currentSet.length < enemy.pokemons.length && pokemon.specie !== enemySpecies[currentSet.length])
          continue;
        currentSet.push(pokemon);
        this.generatePokemonSets(possiblePokemon, enemy, type, battleStyle, currentSet, result);
        currentSet.pop();
      }
    }
  }

  private isValidSet(pokemonSet: Pokemon[], enemy: PokemonSet, type: PokemonType, battleStyle: number): boolean {
    // Check for no repeated Pokemon specie in a set
    const speciesSet = new Set<string>();
    for (const pokemon of pokemonSet) {
      if (speciesSet.has(pokemon.specie)) {
        return false;
      }
      speciesSet.add(pokemon.specie);
    }

    // Check for no repeated items in a set
    const itemsSet = new Set<string>();
    for (const pokemon of pokemonSet) {
      if (itemsSet.has(pokemon.item)) {
        return false;
      }
      itemsSet.add(pokemon.item);
    }

    // Apply the battle type algorithm
    // count how many types there are
    const typeCount: { [type: string]: number } = {}
    for (let pokemon of pokemonSet) {
      for (let t of pokemon.types) {
        if (!typeCount[t]) {
          typeCount[t] = 0;
        }
        typeCount[t]++;
      }
    }

    function typeCountCount(n: number): number {
      let count = 0;
      for (const key in typeCount) {
        if (typeCount[key] == n) count++;
      }
      return count;
    }

    function checkTypeIsCorrect(): boolean {
      const threeCount = typeCountCount(3);
      const twoCount = typeCountCount(2);
      if (threeCount > 0) {
        return type == "none" ? threeCount != 1 : threeCount == 1 && typeCount[type] == 3;
      }
      if (twoCount == 1) {
        return type == "none" ? false : typeCount[type] == 2;
      }
      return type == "none";
    }

    if (type != "none" && !typeCount[type]) return false;
    if (!checkTypeIsCorrect()) return false;
    //apply the battle style algorithm
    const categoryCount = [
      0, 0, 0, 0, 0, 0, 0, 0
    ];
    for (let pokemon of pokemonSet) {
      for (let move of pokemon.moves) {
        const i = this.getCategoryMoveIndex(move);
        if (i < 0) continue;
        categoryCount[i]++;
      }
    }
    return this.getBattleStyleSelected(categoryCount) == battleStyle;
    // return true;
  }

  private getBattleStyleSelected(categoryCount: number[]): number {
    const categoryThreshold = [
      99, 3, 3, 3, 2, 2, 2, 2
    ];
    let count = 0;
    let max = 0;
    for (let i = 0; i < categoryThreshold.length; i++) {
      if (categoryThreshold[i] <= categoryCount[i]) {
        count++;
        if (count >= 3) return 8;
        max = Math.max(max, i + 1);
      }
    }
    return count == 0 ? 8 : max;
  }

  public getCategoryMoveIndex(move: string): number {
    for (let i = 0; i < this.categoryMoves.length; i++) {
      if (this.categoryMoves[i].includes(move)) {
        return i;
      }
    }
    return -1;
  }

  private legendaryPokemon = [
    "Mewtwo",
    "Moltres",
    "Articuno",
    "Zapdos",
    "Mew",
    "Lugia",
    "Ho-Oh",
    "Entei",
    "Suicune",
    "Raikou",
    "Celebi",
    "Regirock",
    "Regice",
    "Registeel",
    "Latias",
    "Latios",
    "Groudon",
    "Kyogre",
    "Rayquaza",
    "Jirachi",
    "Deoxys"
  ]
  private categoryMoves = [
    ["Acid Armor",
      "Agility",
      "Amnesia",
      "Barrier",
      "Belly Drum",
      "Bulk Up",
      "Calm Mind",
      "Charge",
      "Conversion",
      "Conversion 2",
      "Cosmic Power",
      "Defense Curl",
      "Double Team",
      "Dragon Dance",
      "Focus Energy",
      "Growth",
      "Harden",
      "Howl",
      "Iron Defense",
      "Meditate",
      "Minimize",
      "Psych Up",
      "Sharpen",
      "Snatch",
      "Swords Dance",
      "Tail Glow",
      "Withdraw",
    ],
    ["Attract",
      "Block",
      "Confuse Ray",
      "Disable",
      "Encore",
      "Flatter",
      "Glare",
      "GrassWhistle",
      "Hypnosis",
      "Imprison",
      "Leech Seed",
      "Lovely Kiss",
      "Mean Look",
      "Poison Gas",
      "PoisonPowder",
      "Sing",
      "Sleep Powder",
      "Snatch",
      "Spider Web",
      "Spikes",
      "Spore",
      "Stun Spore",
      "Supersonic",
      "Swagger",
      "Sweet Kiss",
      "Taunt",
      "Teeter Dance",
      "Thunder Wave",
      "Torment",
      "Toxic",
      "Yawn",
      "Will-O-Wisp",
    ],
    ["Aromatherapy",
      "Baton Pass",
      "Detect",
      "Endure",
      "Haze",
      "Heal Bell",
      "Ingrain",
      "Light Screen",
      "Magic Coat",
      "Milk Drink",
      "Mist",
      "Moonlight",
      "Morning Sun",
      "Mud Sport",
      "Protect",
      "Recover",
      "Reflect",
      "Rest",
      "Safeguard",
      "Slack Off",
      "Softboiled",
      "Swallow",
      "Synthesis",
      "Recycle",
      "Refresh",
      "Water Sport",
      "Wish",
    ],
    ["Bide",
      "Blast Burn",
      "Counter",
      "Destiny Bond",
      "Double-Edge",
      "Explosion",
      "Facade",
      "Fissure",
      "Flail",
      "Focus Punch",
      "Frenzy Plant",
      "Grudge",
      "Guillotine",
      "Horn Drill",
      "Hydro Cannon",
      "Hyper Beam",
      "Memento",
      "Mirror Coat",
      "Overheat",
      "Pain Split",
      "Perish Song",
      "Psycho Boost",
      "Reversal",
      "Selfdestruct",
      "Sky Attack",
      "Volt Tackle",
    ],
    ["Charm",
      "Cotton Spore",
      "Fake Tears",
      "FeatherDance",
      "Flash",
      "Growl",
      "Kinesis",
      "Knock Off",
      "Leer",
      "Metal Sound",
      "Sand-Attack",
      "Scary Face",
      "Screech",
      "SmokeScreen",
      "Spite",
      "String Shot",
      "Sweet Scent",
      "Tail Whip",
      "Tickle",],
    ["Assist",
      "Camouflage",
      "Curse",
      "Follow Me",
      "Metronome",
      "Mimic",
      "Mirror Move",
      "Present",
      "Role Play",
      "Sketch",
      "Skill Swap",
      "Substitute",
      "Transform",
      "Trick"],
    ["Hail",
      "Rain Dance",
      "Sandstorm",
      "Sunny Day",
      "Weather Ball",]
  ];
}

export const PokemonTypes = [
  "none",
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark"
]
export type PokemonType = typeof PokemonTypes[number];

export enum BattleStyle {
  FreeSpirited,
  TotalPreparation,
  SlowAndSteady,
  Endurance,
  HighRiskHighReturn,
  Weakening,
  ImpossibleToPredict,
  BattleFlow,
  Flexible
}

export enum FrontierLevel {
  Level50,
  OpenLevel
}

export interface Algorithm {
  getSets(party: PokemonSet, enemy: PokemonSet, level: FrontierLevel, round: number, type: PokemonType, battleStyle: BattleStyle): PokemonSet[];
}
