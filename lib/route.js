'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * route
 */

class Route {
    constructor(components) {
        this.counter = {};
        this.roundPool = {};
        this.components = components;
    }
    getRunableComponent(strategy, components) {
        let count = components.length;
        switch (strategy) {
            case 'random':
                let index = Math.floor(Math.random() * count);
                return components[index];
        }
    }
}
exports.default = Route;