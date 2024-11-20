import { EffectClass } from "../types/enum/EffectClass"
import Board from "./board"
import { PokemonEntity } from "./pokemon-entity"
import { Item } from "../types/enum/Item"
import PokemonState from "./pokemon-state"
import { AbilityStrategies } from "./abilities/abilities"
import { Ability } from "../types/enum/Ability"

export function triggerItems(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
}){
    params.pokemon.items.forEach((i) =>{
        const handler = itemMap.get(i)
        if(handler){
            handler(effect_class, params)
        }
    })
}

function triggerAquaEgg(
    effect_class: EffectClass,
    params: {pokemon: PokemonEntity}
){
    switch (effect_class){
        case EffectClass.ABILITY:
            params.pokemon.addPP(20, params.pokemon, 0, false)
            break
    }
}

function triggerStarDust(
    effect_class: EffectClass,
    params: {pokemon: PokemonEntity}
){
    const pokemon = params.pokemon
    switch(effect_class){
        case EffectClass.ABILITY:
            pokemon.addShield(Math.round(0.5 * pokemon.maxPP), pokemon, 0, false)
            pokemon.count.starDustCount++
            break
    }
}

function triggerLeppaBerry(
    effect_class: EffectClass,
    params: {pokemon: PokemonEntity}
){
    switch(effect_class){
        case EffectClass.ABILITY:
            params.pokemon.eatBerry(Item.LEPPA_BERRY)
            break
    }
}

function triggerComfey(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
}){
    switch(effect_class){
        case EffectClass.ABILITY:
            AbilityStrategies[Ability.FLORAL_HEALING].process(
            params.pokemon,
            params.state,
            params.board,
            params.target,
            params.crit,
            true
            )
            break
    }
}


const itemMap: ReadonlyMap<Item, (...args)=>void> = new Map([
    [Item.AQUA_EGG, triggerAquaEgg],
    [Item.STAR_DUST, triggerStarDust],
    [Item.LEPPA_BERRY, triggerLeppaBerry],
    [Item.COMFEY, triggerComfey]
])