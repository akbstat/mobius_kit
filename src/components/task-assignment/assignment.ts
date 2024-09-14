export interface Assignment {
    developer: string,
    task: string,
}

export function newAssignment(mapper: Map<string, string[]>): Assignment[] {
    const assignment: Assignment[] = [];
    const developers = Array.from(mapper.keys()).sort((x: string, y: string) => x < y ? -1 : 1);
    developers.forEach(developer => {
        mapper.get(developer)?.map(task => {
            return { developer, task };
        }).forEach(assign => {
            assignment.push(assign);
        })
    });
    return assignment;
}

