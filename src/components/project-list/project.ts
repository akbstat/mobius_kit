export interface Product {
    id: string,
    name: string,
    trails: Trail[],
}

export interface Trail {
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
    trail: string,
    purpose: string,
}