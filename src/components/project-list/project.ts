export interface Product {
    id: string,
    name: string,
    trials: Trial[],
}

export interface Trial {
    id: string,
    name: string,
    purpose: Purpose[],
}

export interface Purpose {
    id: string,
    name: string,
}

export interface ChosenProject {
    product: string,
    trial: string,
    purpose: string,
}