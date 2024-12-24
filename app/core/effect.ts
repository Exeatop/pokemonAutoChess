import { IPeriodicEffect } from "../types"
import { Effect as EffectEnum } from "../types/enum/Effect"
import { Item } from "../types/enum/Item"
import { Synergy, SynergyEffects } from "../types/enum/Synergy"
import { PokemonEntity } from "./pokemon-entity"

export abstract class Effect {
  apply: (entity: PokemonEntity) => void
  constructor(effect: (entity: PokemonEntity) => void) {
    this.apply = effect
  }
}

// item effect applied on fight start of after stealing/obtaining an item
export class OnItemGainedEffect extends Effect {}

export class OnItemRemovedEffect extends Effect {}

export class GroundSynergyEffect implements IPeriodicEffect {
  origin: EffectEnum
  intervalMs = 3000
  timer = this.intervalMs
  count = 0

  applyPeriodicEffect: (entity: PokemonEntity) => void
  constructor(origin: EffectEnum) {
    this.origin = origin
    const synergyLevel = SynergyEffects[Synergy.GROUND]
      .indexOf(origin) + 1
  
    this.applyPeriodicEffect = (pokemon) => {
      this.count++
      pokemon.addDefense(synergyLevel, pokemon, 0, false)
      pokemon.addSpecialDefense(synergyLevel, pokemon, 0, false)
      pokemon.addAttack(synergyLevel, pokemon, 0, false)
      pokemon.transferAbility("GROUND_GROW")
      if (
        pokemon.items.has(Item.BIG_NUGGET) &&
        this.count === 5 &&
        pokemon.player
      ) {
        pokemon.player.addMoney(3, true, pokemon)
        pokemon.count.moneyCount += 3
      }
    }
    
  }

  update(dt: number, entity: PokemonEntity){
    update(dt, entity, this)
  }
}

function update(dt: number, entity: PokemonEntity, context: IPeriodicEffect) {
  context.timer -= dt
  if (context.timer <= 0) {
    context.applyPeriodicEffect(entity)
    context.timer = context.intervalMs
  }
}