/**
 * route
 */

export default class Route{
    constructor(components){
        this.counter = {}
        this.roundPool = {}
        this.components = components
    }
    getRunableComponent(strategy, components){
        let count = components.length
        switch(strategy){
            case 'random':
                let index = Math.floor(Math.random()*count)
                return components[index]
        }
    }
}