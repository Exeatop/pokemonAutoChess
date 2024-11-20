import { EffectClass } from "../types/enum/EffectClass";
import { PokemonEntity } from "./pokemon-entity"
import PokemonState from "./pokemon-state";
import Board from "./board";
import { Passive } from "../types/enum/Passive";
import { Transfer } from "../types";
import { distanceC } from "../utils/distance";
import { triggerSoundEffects } from "./synergies"
import { repeat } from "../utils/function";
import { Synergy } from "../types/enum/Synergy";

export function triggerPassives(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
}){
    const handler = passiveMap.get(params.pokemon.passive)
    if(handler){
        handler(effect_class, params)
    }
}

function triggerSlowStart(
    effect_class: EffectClass,
    params: {pokemon: PokemonEntity}
){
    const pokemon = params.pokemon
    switch(effect_class){
        case EffectClass.ABILITY:
            if(params.pokemon.count.ult === 1){
                pokemon.addAttackSpeed(30, pokemon, 0, false)
                pokemon.addAttack(10, pokemon, 0, false)
            }
            break
    }
}

function triggerWaterSpring(
    effect_class: EffectClass,
    params: {pokemon: PokemonEntity}
){
    const pokemon = params.pokemon
    switch(effect_class){
        case EffectClass.ENEMY_ABILITY:
            pokemon.addPP(5, pokemon, 0, false)
            pokemon.simulation.room.broadcast(Transfer.ABILITY, {
                id: pokemon.simulation.id,
                skill: pokemon.skill,
                positionX: pokemon.positionX,
                positionY: pokemon.positionY
            })
            break
    }
}

function triggerMegaLauncher(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
    }
){
    switch(effect_class){
        case EffectClass.ABILITY:
            if(params.pokemon.types.has(Synergy.SOUND)){
                repeat(2)(()=>
                    triggerSoundEffects(
                        EffectClass.ABILITY,
                        {
                            pokemon: params.pokemon,
                            state: params.state,
                            board: params.board,
                            target: params.target,
                            crit: params.crit
                        }
                    )
                )
            }
            break
    }
}

function triggerChimecho(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState
        board: Board,
        target: PokemonEntity,
        crit: boolean
    }
){
    const pokemon = params.pokemon
    switch(effect_class){
        case EffectClass.ALLY_SOUND_SYNERGY_ON_ABILITY:
            const ally = params.target
            if(distanceC(
                pokemon.positionX,
                pokemon.positionY,
                ally.positionX,
                ally.positionY
            )<=1){
                triggerSoundEffects(
                    EffectClass.ABILITY,
                    {
                        pokemon: ally,
                        state: params.state,
                        board: params.board,
                        target: pokemon,
                        crit: params.crit
                    },
                    false
                )
            }

    }
}

const passiveMap: ReadonlyMap<Passive, (...args)=>void> = new Map([
    [Passive.SLOW_START, triggerSlowStart],
    [Passive.WATER_SPRING, triggerWaterSpring],
    [Passive.MEGA_LAUNCHER, triggerMegaLauncher],
    [Passive.CHIMECHO, triggerChimecho]
])