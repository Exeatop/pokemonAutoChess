import { EffectClass } from "../types/enum/EffectClass";
import {PokemonEntity} from "./pokemon-entity"
import PokemonState from "./pokemon-state";
import Board from "./board";
import { Effect } from "../types/enum/Effect";
import { Synergy, SynergyEffects } from "../types/enum/Synergy";
import { triggerPassives } from "./passives";

export function triggerSynergies(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
    }
){
    params.pokemon.types.forEach((s) =>{
        const handler = synergyMap.get(s)
        if(handler){
            handler(effect_class, params)
        }
    })
}

export function triggerSoundEffects(
    effect_class: EffectClass,
    params: {
        pokemon: PokemonEntity,
        state: PokemonState,
        board: Board,
        target: PokemonEntity,
        crit: boolean
    },
    check_passives = true
){
    const pokemon = params.pokemon
    const effectsOrder = SynergyEffects[Synergy.SOUND]
    const effect = effectsOrder.filter((e)=> pokemon.effects.has(e))
    let effect_index = -1
    if(effect){
    effect_index = effectsOrder.indexOf(effect[effect.length - 1])
    }
    switch(effect_class){
        case EffectClass.ABILITY:
            let attackBoost = 0
            let attackSpeedBoost = 0
            let manaBoost = 0

            if (effect_index >= effectsOrder.indexOf(Effect.LARGO)){
                attackBoost = 2
            }

            if (effect_index >= effectsOrder.indexOf(Effect.ALLEGRO)) {
                attackBoost = 1
                attackSpeedBoost = 1
            }
        
            if (effect_index === effectsOrder.indexOf(Effect.PRESTO)) {
                manaBoost = 3
            }
            
            params.board.cells.forEach((ally) => {
                if(ally && ally.team === pokemon.team){
                    ally.status.sleep = false
                    ally.addAttack(attackBoost, pokemon, 0, false)
                    ally.addAttackSpeed(attackSpeedBoost, pokemon, 0, false)
                    ally.addPP(manaBoost, pokemon, 0, false)
                }
            })

            if(check_passives){
                params.board.cells.forEach((ally)=>{
                    if(ally && ally.team === pokemon.team){
                        triggerPassives(
                            EffectClass.SOUND_SYNERGY_ON_ABILITY,
                            {
                                pokemon: ally,
                                state: params.state,
                                board: params.board,
                                target: params.target,
                                crit: params.crit
                            }
                        )
                    }
                })
            }
    }
}

const synergyMap: ReadonlyMap<Synergy, (...args)=>void> = new Map([
    [Synergy.SOUND, triggerSoundEffects]
])