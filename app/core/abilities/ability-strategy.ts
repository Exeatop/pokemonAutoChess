import { Transfer } from "../../types"
import { Effect } from "../../types/enum/Effect"
import { Passive } from "../../types/enum/Passive"
import { Synergy } from "../../types/enum/Synergy"
import { distanceC } from "../../utils/distance"
import Board from "../board"
import { PokemonEntity } from "../pokemon-entity"
import PokemonState from "../pokemon-state"
import { min } from "../../utils/number"
import { triggerItems } from "../items"
import { EffectClass } from "../../types/enum/EffectClass"
import { triggerPassives } from "../passives"
import { triggerSynergies } from "../synergies"

export class AbilityStrategy {
  copyable = true // if true, can be copied by mimic, metronome...
  process(
    pokemon: PokemonEntity,
    state: PokemonState,
    board: Board,
    target: PokemonEntity,
    crit: boolean,
    preventDefaultAnim?: boolean
  ) {
    pokemon.pp = min(0)(pokemon.pp - pokemon.maxPP)
    pokemon.count.ult += 1

    if (!preventDefaultAnim) {
      pokemon.simulation.room.broadcast(Transfer.ABILITY, {
        id: pokemon.simulation.id,
        skill: pokemon.skill,
        positionX: pokemon.positionX,
        positionY: pokemon.positionY,
        targetX: target.positionX,
        targetY: target.positionY,
        orientation: pokemon.orientation
      })
    }

    triggerSynergies(
      EffectClass.ABILITY,
      {
        pokemon,
        state,
        board,
        target,
        crit
      }
    )

    board.forEach((x, y, enemy) => {
      if (
        enemy &&
        enemy.team !== pokemon.team &&
        enemy.id !== pokemon.id
      ) {
        triggerPassives(
          EffectClass.ENEMY_ABILITY,
          {
            pokemon: enemy,
            state,
            board,
            target: pokemon,
            crit: false
          }
        )
      }
    })

    triggerItems(
      EffectClass.ABILITY,
      {
        pokemon,
        state,
        board,
        target,
        crit
    })

  }
}

export function soundBoost(pokemon: PokemonEntity, board: Board) {
  pokemon.count.soundCount++
  const chimecho = board.find(
    (x, y, e) => e.passive === Passive.CHIMECHO && e.team === pokemon.team
  )
  const chimechoBoost =
    chimecho &&
    distanceC(
      pokemon.positionX,
      pokemon.positionY,
      chimecho.positionX,
      chimecho.positionY
    ) <= 1
  board.forEach((x: number, y: number, ally: PokemonEntity | undefined) => {
    if (ally && pokemon.team === ally.team) {
      ally.status.sleep = false
      if (pokemon.effects.has(Effect.LARGO)) {
        ally.addAttack(chimechoBoost ? 4 : 2, pokemon, 0, false)
      }
      if (
        pokemon.effects.has(Effect.ALLEGRO) ||
        pokemon.effects.has(Effect.PRESTO)
      ) {
        ally.addAttack(chimechoBoost ? 2 : 1, pokemon, 0, false)
        ally.addAttackSpeed(chimechoBoost ? 10 : 5, pokemon, 0, false)
      }
      if (pokemon.effects.has(Effect.PRESTO)) {
        const manaBoost = chimechoBoost ? 6 : 3
        ally.addPP(manaBoost, pokemon, 0, false)
      }
    }
  })
}
